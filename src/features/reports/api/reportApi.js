import api from '../../../helpers/apiHelper';

const toPayload = ({ title, category, location, description, priority }) => ({
  title,
  category,
  location,
  description,
  priority,
});

const reportApi = {
  getReports(params) {
    return api.get('/reports', { query: params });
  },
  async getReport(id) {
    return (await api.get(`/reports/${id}`)).report;
  },
  async createReport(values) {
    return (await api.post('/reports', toPayload(values))).report;
  },
  async updateReport(id, values) {
    return (await api.put(`/reports/${id}`, toPayload(values))).report;
  },
  async deleteReport(id) {
    await api.delete(`/reports/${id}`);
  },
  async changeStatus(id, { status, note }) {
    return (await api.patch(`/reports/${id}/status`, { status, note })).report;
  },
  async addNote(id, { note }) {
    return (await api.post(`/reports/${id}/notes`, { note })).report;
  },
  getStats() {
    return api.get('/reports/stats');
  },
};

export default reportApi;
