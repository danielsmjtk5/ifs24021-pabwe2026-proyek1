import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../helpers/apiHelper';
import reportApi from './reportApi';

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
    expect(await reportApi.getReport(3)).toMatchObject(report);
    expect(api.get).toHaveBeenCalledWith('/reports/3');
    await reportApi.deleteReport(3);
    expect(api.delete).toHaveBeenCalledWith('/reports/3');
    expect(await reportApi.changeStatus(3, { status: 'diproses', note: 'n' })).toMatchObject(report);
    expect(api.patch).toHaveBeenCalledWith('/reports/3/status', { status: 'diproses', note: 'n' });
    expect(await reportApi.addNote(3, { note: 'n' })).toMatchObject(report);
    expect(api.post).toHaveBeenCalledWith('/reports/3/notes', { note: 'n' });
    await reportApi.getStats();
    expect(api.get).toHaveBeenCalledWith('/reports/stats');
  });
});
