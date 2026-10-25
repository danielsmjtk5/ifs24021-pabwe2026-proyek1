import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../helpers/apiHelper';
import userApi from './userApi';

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

describe('userApi', () => {
  it('memperbarui profil dan password', async () => {
    expect(await userApi.updateProfile({ name: 'B', room: 'A', role: 'admin' })).toMatchObject(user);
    expect(api.put).toHaveBeenCalledWith('/users/me', { name: 'B', room: 'A' });
    await userApi.changePassword({ currentPassword: 'a', newPassword: 'b' });
    expect(api.put).toHaveBeenLastCalledWith('/users/me/password', { currentPassword: 'a', newPassword: 'b' });
  });
});
