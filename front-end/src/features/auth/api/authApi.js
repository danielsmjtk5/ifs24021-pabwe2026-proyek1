import api from '../../../helpers/apiHelper';

const authApi = {
  async login({ email, password }) {
    const data = await api.post('/auth/login', { email, password }, { skipAuthHandler: true });
    return data.user;
  },
  async register({ name, email, room, password }) {
    const data = await api.post('/auth/register', { name, email, room, password }, { skipAuthHandler: true });
    return data.user;
  },
  async logout() {
    await api.post('/auth/logout', undefined, { skipAuthHandler: true });
  },
  async me() {
    // /auth/session selalu 200 (user null bila belum login) sehingga tidak ada error 401 di console.
    const data = await api.get('/auth/session', { skipAuthHandler: true });
    return data.user;
  },
};

export default authApi;
