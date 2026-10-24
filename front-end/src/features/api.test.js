import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../helpers/apiHelper';
import authApi from './auth/api/authApi';
import userApi from './users/api/userApi';
import reportApi from './reports/api/reportApi';
import dashboardApi from './dashboard/api/dashboardApi';

vi.mock('../helpers/apiHelper', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const user = { id: 1, name: 'Budi' };
const report = { id: 3 };

beforeEach(() => {
  api.get.mockResolvedValue({ user, report });
  api.post.mockResolvedValue({ user, report });
  api.put.mockResolvedValue({ user, report });
  api.patch.mockResolvedValue({ report });
  api.delete.mockResolvedValue(null);
});

describe('authApi', () => {
  it('login, register, me, logout memanggil endpoint yang benar', async () => {
    expect(await authApi.login({ email: 'a@b.c', password: 'x', extra: 1 })).toEqual(user);
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'x' }, { skipAuthHandler: true });

    await authApi.register({ name: 'B', email: 'e', room: 'r', password: 'p', role: 'admin' });
    expect(api.post).toHaveBeenLastCalledWith(
      '/auth/register',
      { name: 'B', email: 'e', room: 'r', password: 'p' },
      { skipAuthHandler: true },
    );

    expect(await authApi.me()).toEqual(user);
    expect(api.get).toHaveBeenCalledWith('/auth/session', { skipAuthHandler: true });

    await authApi.logout();
    expect(api.post).toHaveBeenLastCalledWith('/auth/logout', undefined, { skipAuthHandler: true });
  });
});

describe('userApi', () => {
  it('memperbarui profil dan password', async () => {
    expect(await userApi.updateProfile({ name: 'B', room: 'A', role: 'admin' })).toEqual(user);
    expect(api.put).toHaveBeenCalledWith('/users/me', { name: 'B', room: 'A' });
    await userApi.changePassword({ currentPassword: 'a', newPassword: 'b' });
    expect(api.put).toHaveBeenLastCalledWith('/users/me/password', { currentPassword: 'a', newPassword: 'b' });
  });
});

describe('reportApi', () => {
  const values = { title: 't', category: 'c', location: 'l', description: 'd', priority: 'p', status: 'selesai' };
  const payload = { title: 't', category: 'c', location: 'l', description: 'd', priority: 'p' };

  it('hanya mengirim field konten laporan', async () => {
    await reportApi.createReport(values);
    expect(api.post).toHaveBeenCalledWith('/reports', payload);
    await reportApi.updateReport(3, values);
    expect(api.put).toHaveBeenCalledWith('/reports/3', payload);
  });

  it('endpoint lain', async () => {
    await reportApi.getReports({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/reports', { query: { page: 1 } });
    expect(await reportApi.getReport(3)).toEqual(report);
    expect(api.get).toHaveBeenCalledWith('/reports/3');
    await reportApi.deleteReport(3);
    expect(api.delete).toHaveBeenCalledWith('/reports/3');
    expect(await reportApi.changeStatus(3, { status: 'diproses', note: 'n' })).toEqual(report);
    expect(api.patch).toHaveBeenCalledWith('/reports/3/status', { status: 'diproses', note: 'n' });
    expect(await reportApi.addNote(3, { note: 'n' })).toEqual(report);
    expect(api.post).toHaveBeenCalledWith('/reports/3/notes', { note: 'n' });
    await reportApi.getStats();
    expect(api.get).toHaveBeenCalledWith('/reports/stats');
    await dashboardApi.getStats();
    expect(api.get).toHaveBeenLastCalledWith('/reports/stats');
  });
});
