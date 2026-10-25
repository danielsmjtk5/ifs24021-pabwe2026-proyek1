import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setupStore } from '../../../app/store';
import authApi from '../api/authApi';
import authReducer, { fetchCurrentUser, loginUser, logoutUser, registerUser, sessionExpired } from './authSlice';
import { changePassword, updateProfile } from '../../users/states/usersSlice';
import { createReport, deleteReport, updateReport } from '../../reports/states/reportsSlice';
import { ApiError } from '../../../helpers/apiHelper';
import { RESIDENT } from '../../../test-utils';

vi.mock('../api/authApi', () => ({ default: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn() } }));

vi.mock('../../users/api/userApi', () => ({ default: { updateProfile: vi.fn(), changePassword: vi.fn() } }));

vi.mock('../../reports/api/reportApi', () => ({
  default: {
    getReports: vi.fn(),
    getReport: vi.fn(),
    createReport: vi.fn(),
    updateReport: vi.fn(),
    deleteReport: vi.fn(),
    changeStatus: vi.fn(),
    addNote: vi.fn(),
    getStats: vi.fn(),
  },
}));

let store;

beforeEach(() => {
  store = setupStore();
});

describe('authSlice', () => {
  it('state awal', () => {
    expect(store.getState().auth).toEqual({
      user: null,
      sessionStatus: 'idle',
      sessionError: null,
      sessionExpired: false,
    });
  });

  it('fetchCurrentUser: pending lalu fulfilled', async () => {
    authApi.me.mockResolvedValue(RESIDENT);
    const promise = store.dispatch(fetchCurrentUser());
    expect(store.getState().auth.sessionStatus).toBe('checking');
    await promise;
    expect(store.getState().auth).toMatchObject({ user: RESIDENT, sessionStatus: 'ready' });
  });

  it('fetchCurrentUser: 401 berarti belum login', async () => {
    authApi.me.mockRejectedValue(new ApiError('Silakan login', 401));
    await store.dispatch(fetchCurrentUser());
    expect(store.getState().auth).toMatchObject({ user: null, sessionStatus: 'ready', sessionError: null });
  });

  it('fetchCurrentUser: server mati menghasilkan sessionError', async () => {
    authApi.me.mockRejectedValue(new ApiError('Tidak dapat terhubung ke server.'));
    await store.dispatch(fetchCurrentUser());
    expect(store.getState().auth).toMatchObject({ sessionStatus: 'ready', sessionError: 'Tidak dapat terhubung ke server.' });
  });

  it('loginUser berhasil dan gagal', async () => {
    authApi.login.mockResolvedValueOnce(RESIDENT);
    await store.dispatch(loginUser({ email: 'a', password: 'b' }));
    expect(store.getState().auth.user).toEqual(RESIDENT);

    authApi.login.mockRejectedValueOnce(new ApiError('Email atau password salah', 401));
    const result = await store.dispatch(loginUser({ email: 'a', password: 'b' }));
    expect(result.payload).toEqual({ message: 'Email atau password salah', errors: null });
  });

  it('registerUser berhasil dan gagal', async () => {
    authApi.register.mockResolvedValueOnce(RESIDENT);
    await store.dispatch(registerUser({}));
    expect(store.getState().auth.user).toEqual(RESIDENT);

    authApi.register.mockRejectedValueOnce(new ApiError('Email sudah terdaftar', 409));
    const result = await store.dispatch(registerUser({}));
    expect(result.payload.message).toBe('Email sudah terdaftar');
  });

  it('logoutUser selalu membersihkan sesi, walau server gagal', async () => {
    store = setupStore({ auth: { user: RESIDENT, sessionStatus: 'ready', sessionError: null, sessionExpired: false } });
    authApi.logout.mockRejectedValueOnce(new Error('offline'));
    await store.dispatch(logoutUser());
    expect(store.getState().auth.user).toBeNull();
  });

  it('sessionExpired hanya menandai jika sebelumnya login', () => {
    const loggedIn = authReducer({ user: RESIDENT, sessionExpired: false }, sessionExpired());
    expect(loggedIn).toEqual({ user: null, sessionExpired: true });
    const guest = authReducer({ user: null, sessionExpired: false }, sessionExpired());
    expect(guest.sessionExpired).toBe(false);
  });
});
