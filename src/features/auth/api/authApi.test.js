import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../helpers/apiHelper';
import authApi from './authApi';

vi.mock('../../../helpers/apiHelper', () => ({
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
    expect(await authApi.login({ email: 'a@b.c', password: 'x', extra: 1 })).toMatchObject(user);
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'x' }, { skipAuthHandler: true });

    await authApi.register({ name: 'B', email: 'e', room: 'r', password: 'p', role: 'admin' });
    expect(api.post).toHaveBeenLastCalledWith(
      '/auth/register',
      { name: 'B', email: 'e', room: 'r', password: 'p' },
      { skipAuthHandler: true },
    );

    expect(await authApi.me()).toMatchObject(user);
    expect(api.get).toHaveBeenCalledWith('/auth/session', { skipAuthHandler: true });

    await authApi.logout();
    expect(api.post).toHaveBeenLastCalledWith('/auth/logout', undefined, { skipAuthHandler: true });
  });
});
