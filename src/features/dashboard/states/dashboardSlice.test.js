import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setupStore } from '../../../app/store';
import reportApi from '../../reports/api/reportApi';
import { changePassword, updateProfile } from '../../users/states/usersSlice';
import { createReport, deleteReport, updateReport } from '../../reports/states/reportsSlice';
import { fetchStats } from './dashboardSlice';
import { ApiError } from '../../../helpers/apiHelper';

vi.mock('../../auth/api/authApi', () => ({ default: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn() } }));

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
