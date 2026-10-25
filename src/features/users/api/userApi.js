import api from '../../../helpers/apiHelper';

const userApi = {
  async updateProfile({ name, room }) {
    const data = await api.put('/users/me', { name, room });
    return data.user;
  },
  async changePassword({ currentPassword, newPassword }) {
    await api.put('/users/me/password', { currentPassword, newPassword });
  },
};

export default userApi;
