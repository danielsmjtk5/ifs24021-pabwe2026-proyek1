import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setupStore } from './store';
import { sessionExpired } from '../features/auth/states/authSlice';
import { changePassword, updateProfile } from '../features/users/states/usersSlice';
import { createReport, deleteReport, updateReport } from '../features/reports/states/reportsSlice';
import { ADMIN } from '../test-utils';

vi.mock('../features/auth/api/authApi', () => ({ default: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn() } }));

vi.mock('../features/users/api/userApi', () => ({ default: { updateProfile: vi.fn(), changePassword: vi.fn() } }));

vi.mock('../features/reports/api/reportApi', () => ({
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

describe('store', () => {
  it('menggabungkan reducer auth, reports, dashboard', async () => {
    const { default: defaultStore } = await import('../app/store');
    expect(Object.keys(defaultStore.getState())).toEqual(['auth', 'reports', 'dashboard']);
    const preloaded = setupStore({ auth: { user: ADMIN, sessionStatus: 'ready', sessionError: null, sessionExpired: false } });
    expect(preloaded.getState().auth.user.role).toBe('admin');
  });
});
