import { describe, expect, it } from 'vitest';
import { normalizeReport, normalizeReportList, normalizeStats, normalizeUser } from './normalizers';

describe('normalizeUser', () => {
  it('mengembalikan null bila tidak ada pengguna', () => {
    expect(normalizeUser(null)).toBeNull();
    expect(normalizeUser(undefined)).toBeNull();
  });

  it('melengkapi field yang kosong dan membatasi role', () => {
    expect(normalizeUser({ id: 1, role: 'superadmin' })).toEqual({
      id: 1,
      name: 'Pengguna',
      email: '',
      room: null,
      role: 'penghuni',
    });
    expect(normalizeUser({ id: 2, name: 'Admin', email: 'a@b.c', room: 'A-1', role: 'admin' })).toMatchObject({
      name: 'Admin',
      room: 'A-1',
      role: 'admin',
    });
  });
});

describe('normalizeReport', () => {
  it('mengembalikan null bila laporan kosong', () => {
    expect(normalizeReport(null)).toBeNull();
  });

  it('mengisi default untuk izin, pelapor, riwayat, dan teks', () => {
    const report = normalizeReport({ id: 5, permissions: { canEdit: true, nextStatuses: 'salah' } });
    expect(report).toMatchObject({
      id: 5,
      title: '(Tanpa judul)',
      location: '-',
      description: '',
      reporter: { name: 'Pengguna terhapus' },
      history: [],
      permissions: { canEdit: true, canDelete: false, canChangeStatus: false, canAddNote: false, nextStatuses: [] },
    });
  });

  it('mempertahankan data yang sudah lengkap', () => {
    const full = {
      id: 1,
      title: 'Lampu mati',
      location: 'A-1',
      description: 'Mati',
      reporter: { id: 2, name: 'Budi' },
      history: [{ id: 1 }],
      permissions: { canEdit: true, canDelete: true, canChangeStatus: false, canAddNote: false, nextStatuses: ['diproses'] },
    };
    expect(normalizeReport(full)).toEqual(full);
  });
});

describe('normalizeReportList', () => {
  it('menghasilkan daftar kosong untuk respons tidak lengkap', () => {
    expect(normalizeReportList(undefined)).toEqual({ reports: [], pagination: null });
    expect(normalizeReportList({ reports: 'x' })).toEqual({ reports: [], pagination: null });
  });

  it('menormalkan laporan dan angka pagination', () => {
    const result = normalizeReportList({ reports: [{ id: 1 }], pagination: { page: '2', totalPages: '3', total: 'abc' } });
    expect(result.reports[0]).toMatchObject({ id: 1, history: [] });
    expect(result.pagination).toEqual({ page: 2, totalPages: 3, total: 0 });
    expect(normalizeReportList({ reports: [], pagination: {} }).pagination).toEqual({ page: 1, totalPages: 0, total: 0 });
  });
});

describe('normalizeStats', () => {
  it('menghasilkan statistik nol untuk respons kosong', () => {
    expect(normalizeStats(undefined)).toEqual({
      total: 0,
      byStatus: { menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 },
      byCategory: [],
      recent: [],
    });
  });

  it('menormalkan kategori dan laporan terbaru', () => {
    const stats = normalizeStats({
      total: 3,
      byStatus: { menunggu: 2, selesai: '1' },
      byCategory: [{ category: 'listrik', count: '2' }, { count: 1 }],
      recent: [{ id: 9 }],
    });
    expect(stats.byStatus).toEqual({ menunggu: 2, diproses: 0, selesai: 1, ditolak: 0 });
    expect(stats.byCategory).toEqual([
      { category: 'listrik', count: 2 },
      { category: '', count: 1 },
    ]);
    expect(stats.recent[0]).toMatchObject({ id: 9, reporter: { name: 'Pengguna terhapus' } });
  });
});
