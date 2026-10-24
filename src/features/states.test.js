import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setupStore } from '../app/store';
import authApi from './auth/api/authApi';
import userApi from './users/api/userApi';
import reportApi from './reports/api/reportApi';
import authReducer, {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  sessionExpired,
} from './auth/states/authSlice';
import { changePassword, updateProfile } from './users/states/usersSlice';
import {
  addReportNote,
  changeReportStatus,
  createReport,
  deleteReport,
  fetchReport,
  fetchReports,
  updateReport,
} from './reports/states/reportsSlice';
import { fetchStats } from './dashboard/states/dashboardSlice';
import { ApiError } from '../helpers/apiHelper';
import { ADMIN, RESIDENT, makeReport } from '../test-utils';

vi.mock('./auth/api/authApi', () => ({ default: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn() } }));
vi.mock('./users/api/userApi', () => ({ default: { updateProfile: vi.fn(), changePassword: vi.fn() } }));
vi.mock('./reports/api/reportApi', () => ({
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

describe('usersSlice', () => {
  it('updateProfile memperbarui user di auth', async () => {
    store = setupStore({ auth: { user: RESIDENT, sessionStatus: 'ready', sessionError: null, sessionExpired: false } });
    userApi.updateProfile.mockResolvedValueOnce({ ...RESIDENT, name: 'Budi Baru' });
    await store.dispatch(updateProfile({ name: 'Budi Baru' }));
    expect(store.getState().auth.user.name).toBe('Budi Baru');

    userApi.updateProfile.mockRejectedValueOnce(new ApiError('Data tidak valid', 400, { name: 'x' }));
    const failed = await store.dispatch(updateProfile({ name: '' }));
    expect(failed.payload).toEqual({ message: 'Data tidak valid', errors: { name: 'x' } });
  });

  it('changePassword', async () => {
    userApi.changePassword.mockResolvedValueOnce(undefined);
    const ok = await store.dispatch(changePassword({}));
    expect(changePassword.fulfilled.match(ok)).toBe(true);
    userApi.changePassword.mockRejectedValueOnce(new ApiError('Password lama tidak sesuai', 400));
    const failed = await store.dispatch(changePassword({}));
    expect(failed.payload.message).toBe('Password lama tidak sesuai');
  });
});

describe('reportsSlice', () => {
  const list = { reports: [makeReport({ id: 1 }), makeReport({ id: 2 })], pagination: { page: 1, totalPages: 1 } };

  it('fetchReports: loading, sukses, gagal', async () => {
    reportApi.getReports.mockResolvedValueOnce(list);
    const p = store.dispatch(fetchReports({}));
    expect(store.getState().reports.list.status).toBe('loading');
    await p;
    expect(store.getState().reports.list).toMatchObject({ status: 'succeeded', pagination: list.pagination });
    expect(store.getState().reports.list.items).toHaveLength(2);

    reportApi.getReports.mockRejectedValueOnce(new ApiError('Server error', 500));
    await store.dispatch(fetchReports({}));
    expect(store.getState().reports.list).toMatchObject({ status: 'failed', error: 'Server error' });
  });

  it('fetchReport: loading, sukses, gagal', async () => {
    reportApi.getReport.mockResolvedValueOnce(makeReport());
    const p = store.dispatch(fetchReport(7));
    expect(store.getState().reports.detail.status).toBe('loading');
    await p;
    expect(store.getState().reports.detail.item.id).toBe(7);

    reportApi.getReport.mockRejectedValueOnce(new ApiError('Laporan tidak ditemukan', 404));
    await store.dispatch(fetchReport(99));
    expect(store.getState().reports.detail).toEqual({ item: null, status: 'failed', error: 'Laporan tidak ditemukan' });
  });

  it('mutasi memperbarui detail', async () => {
    reportApi.createReport.mockResolvedValueOnce(makeReport({ id: 10 }));
    await store.dispatch(createReport({}));
    expect(store.getState().reports.detail.item.id).toBe(10);

    reportApi.updateReport.mockResolvedValueOnce(makeReport({ id: 10, title: 'Ubah' }));
    await store.dispatch(updateReport({ id: 10, values: {} }));
    expect(reportApi.updateReport).toHaveBeenCalledWith(10, {});
    expect(store.getState().reports.detail.item.title).toBe('Ubah');

    reportApi.changeStatus.mockResolvedValueOnce(makeReport({ id: 10, status: 'diproses' }));
    await store.dispatch(changeReportStatus({ id: 10, status: 'diproses', note: 'n' }));
    expect(reportApi.changeStatus).toHaveBeenCalledWith(10, { status: 'diproses', note: 'n' });
    expect(store.getState().reports.detail.item.status).toBe('diproses');

    reportApi.addNote.mockResolvedValueOnce(makeReport({ id: 10, status: 'diproses' }));
    await store.dispatch(addReportNote({ id: 10, note: 'catatan' }));
    expect(reportApi.addNote).toHaveBeenCalledWith(10, { note: 'catatan' });
  });

  it('deleteReport menghapus dari daftar dan detail', async () => {
    reportApi.getReports.mockResolvedValueOnce(list);
    await store.dispatch(fetchReports({}));
    reportApi.getReport.mockResolvedValueOnce(makeReport({ id: 1 }));
    await store.dispatch(fetchReport(1));

    reportApi.deleteReport.mockResolvedValue(undefined);
    await store.dispatch(deleteReport(2));
    expect(store.getState().reports.list.items.map((r) => r.id)).toEqual([1]);
    expect(store.getState().reports.detail.item.id).toBe(1);

    await store.dispatch(deleteReport(1));
    expect(store.getState().reports.detail.item).toBeNull();
  });

  it('mutasi gagal mengembalikan payload error', async () => {
    reportApi.deleteReport.mockRejectedValueOnce(new ApiError('Tidak boleh', 403));
    const result = await store.dispatch(deleteReport(1));
    expect(result.payload).toEqual({ message: 'Tidak boleh', errors: null, status: 403 });
  });

  it('logout mereset data laporan dan dashboard', async () => {
    reportApi.getReports.mockResolvedValueOnce(list);
    reportApi.getStats.mockResolvedValueOnce({ total: 2 });
    await store.dispatch(fetchReports({}));
    await store.dispatch(fetchStats());
    authApi.logout.mockResolvedValueOnce();
    await store.dispatch(logoutUser());
    expect(store.getState().reports.list.items).toEqual([]);
    expect(store.getState().dashboard.stats).toBeNull();
  });
});

describe('dashboardSlice', () => {
  it('fetchStats: loading, sukses, gagal', async () => {
    reportApi.getStats.mockResolvedValueOnce({ total: 4 });
    const p = store.dispatch(fetchStats());
    expect(store.getState().dashboard.status).toBe('loading');
    await p;
    expect(store.getState().dashboard).toEqual({ stats: { total: 4 }, status: 'succeeded', error: null });

    reportApi.getStats.mockRejectedValueOnce(new ApiError('Gagal memuat'));
    await store.dispatch(fetchStats());
    expect(store.getState().dashboard).toMatchObject({ status: 'failed', error: 'Gagal memuat' });
  });
});

describe('store', () => {
  it('menggabungkan reducer auth, reports, dashboard', async () => {
    const { default: defaultStore } = await import('../app/store');
    expect(Object.keys(defaultStore.getState())).toEqual(['auth', 'reports', 'dashboard']);
    const preloaded = setupStore({ auth: { user: ADMIN, sessionStatus: 'ready', sessionError: null, sessionExpired: false } });
    expect(preloaded.getState().auth.user.role).toBe('admin');
  });
});
