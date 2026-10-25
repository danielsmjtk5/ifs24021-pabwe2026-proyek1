import api from '../../../helpers/apiHelper';
import { normalizeUser } from '../../../helpers/normalizers';

const userApi = {
  async updateProfile({ name, room }) {
    const data = await api.put('/users/me', { name, room });
    return normalizeUser(data.user);
  },
  async changePassword({ currentPassword, newPassword }) {
    await api.put('/users/me/password', { currentPassword, newPassword });
  },
};

export default userApi;
