import api from '../../../helpers/apiHelper';
import { normalizeReport, normalizeReportList, normalizeStats } from '../../../helpers/normalizers';

const toPayload = ({ title, category, location, description, priority }) => ({
  title,
  category,
  location,
  description,
  priority,
});

const reportApi = {
  async getReports(params) {
    return normalizeReportList(await api.get('/reports', { query: params }));
  },
  async getReport(id) {
    return normalizeReport((await api.get(`/reports/${id}`)).report);
  },
  async createReport(values) {
    return normalizeReport((await api.post('/reports', toPayload(values))).report);
  },
  async updateReport(id, values) {
    return normalizeReport((await api.put(`/reports/${id}`, toPayload(values))).report);
  },
  async deleteReport(id) {
    await api.delete(`/reports/${id}`);
  },
  async changeStatus(id, { status, note }) {
    return normalizeReport((await api.patch(`/reports/${id}/status`, { status, note })).report);
  },
  async addNote(id, { note }) {
    return normalizeReport((await api.post(`/reports/${id}/notes`, { note })).report);
  },
  async getStats() {
    return normalizeStats(await api.get('/reports/stats'));
  },
};

export default reportApi;
