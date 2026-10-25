import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setupStore } from '../../../app/store';
import authApi from '../../auth/api/authApi';
import reportApi from '../api/reportApi';
import { logoutUser } from '../../auth/states/authSlice';
import { changePassword, updateProfile } from '../../users/states/usersSlice';
import { addReportNote, changeReportStatus, createReport, deleteReport, fetchReport, fetchReports, updateReport } from './reportsSlice';
import { fetchStats } from '../../dashboard/states/dashboardSlice';
import { ApiError } from '../../../helpers/apiHelper';
import { makeReport } from '../../../test-utils';

vi.mock('../../auth/api/authApi', () => ({ default: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), me: vi.fn() } }));

vi.mock('../../users/api/userApi', () => ({ default: { updateProfile: vi.fn(), changePassword: vi.fn() } }));

vi.mock('../api/reportApi', () => ({
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

describe('reportsSlice', () => {
  const list = { reports: [makeReport({ id: 1 }), makeReport({ id: 2 })], pagination: { page: 1, totalPages: 1 } };

  it('fetchReports: loading, sukses, gagal', async () => {
    reportApi.getReports.mockResolvedValueOnce(list);
    const p = store.dispatch(fetchReports({}));
    expect(store.getState().reports.list.status).toBe('loading');
    await p;
    expect(store.getState().reports.list).toMatchObject({ status: 'succeeded', pagination: list.pagination });
    expect(store.getState().reports.list.items).toHaveLength(2);

    reportApi.getReports.mockRejectedValueOnce(new ApiError('Server error', 500));
    await store.dispatch(fetchReports({}));
    expect(store.getState().reports.list).toMatchObject({ status: 'failed', error: 'Server error' });
  });

  it('fetchReport: loading, sukses, gagal', async () => {
    reportApi.getReport.mockResolvedValueOnce(makeReport());
    const p = store.dispatch(fetchReport(7));
    expect(store.getState().reports.detail.status).toBe('loading');
    await p;
    expect(store.getState().reports.detail.item.id).toBe(7);

    reportApi.getReport.mockRejectedValueOnce(new ApiError('Laporan tidak ditemukan', 404));
    await store.dispatch(fetchReport(99));
    expect(store.getState().reports.detail).toEqual({ item: null, status: 'failed', error: 'Laporan tidak ditemukan' });
  });

  it('mutasi memperbarui detail', async () => {
    reportApi.createReport.mockResolvedValueOnce(makeReport({ id: 10 }));
    await store.dispatch(createReport({}));
    expect(store.getState().reports.detail.item.id).toBe(10);

    reportApi.updateReport.mockResolvedValueOnce(makeReport({ id: 10, title: 'Ubah' }));
    await store.dispatch(updateReport({ id: 10, values: {} }));
    expect(reportApi.updateReport).toHaveBeenCalledWith(10, {});
    expect(store.getState().reports.detail.item.title).toBe('Ubah');

    reportApi.changeStatus.mockResolvedValueOnce(makeReport({ id: 10, status: 'diproses' }));
    await store.dispatch(changeReportStatus({ id: 10, status: 'diproses', note: 'n' }));
    expect(reportApi.changeStatus).toHaveBeenCalledWith(10, { status: 'diproses', note: 'n' });
    expect(store.getState().reports.detail.item.status).toBe('diproses');

    reportApi.addNote.mockResolvedValueOnce(makeReport({ id: 10, status: 'diproses' }));
    await store.dispatch(addReportNote({ id: 10, note: 'catatan' }));
    expect(reportApi.addNote).toHaveBeenCalledWith(10, { note: 'catatan' });
  });

  it('deleteReport menghapus dari daftar dan detail', async () => {
    reportApi.getReports.mockResolvedValueOnce(list);
    await store.dispatch(fetchReports({}));
    reportApi.getReport.mockResolvedValueOnce(makeReport({ id: 1 }));
    await store.dispatch(fetchReport(1));

    reportApi.deleteReport.mockResolvedValue(undefined);
    await store.dispatch(deleteReport(2));
    expect(store.getState().reports.list.items.map((r) => r.id)).toEqual([1]);
    expect(store.getState().reports.detail.item.id).toBe(1);

    await store.dispatch(deleteReport(1));
    expect(store.getState().reports.detail.item).toBeNull();
  });

  it('mutasi gagal mengembalikan payload error', async () => {
    reportApi.deleteReport.mockRejectedValueOnce(new ApiError('Tidak boleh', 403));
    const result = await store.dispatch(deleteReport(1));
    expect(result.payload).toEqual({ message: 'Tidak boleh', errors: null, status: 403 });
  });

  it('logout mereset data laporan dan dashboard', async () => {
    reportApi.getReports.mockResolvedValueOnce(list);
    reportApi.getStats.mockResolvedValueOnce({ total: 2 });
    await store.dispatch(fetchReports({}));
    await store.dispatch(fetchStats());
    authApi.logout.mockResolvedValueOnce();
    await store.dispatch(logoutUser());
    expect(store.getState().reports.list.items).toEqual([]);
    expect(store.getState().dashboard.stats).toBeNull();
  });
});
