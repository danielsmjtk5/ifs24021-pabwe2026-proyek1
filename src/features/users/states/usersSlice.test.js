import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setupStore } from '../../../app/store';
import userApi from '../api/userApi';
import { sessionExpired } from '../../auth/states/authSlice';
import { changePassword, updateProfile } from './usersSlice';
import { createReport, deleteReport, updateReport } from '../../reports/states/reportsSlice';
import { ApiError } from '../../../helpers/apiHelper';
import { RESIDENT } from '../../../test-utils';

vi.mock('../../auth/api/authApi', () => ({ default: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn() } }));

vi.mock('../api/userApi', () => ({ default: { updateProfile: vi.fn(), changePassword: vi.fn() } }));

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
