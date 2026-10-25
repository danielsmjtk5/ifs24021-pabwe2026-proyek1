import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardPage from './pages/DashboardPage';
import { ADMIN, RESIDENT, authState, makeReport, mockApi, renderWithProviders } from '../../test-utils';

const stats = {
  scope: 'all',
  total: 5,
  byStatus: { menunggu: 2, diproses: 1, selesai: 1, ditolak: 1 },
  byCategory: [{ category: 'listrik', count: 3 }],
  recent: [makeReport({ id: 1, title: 'Lampu koridor mati' })],
};

describe('DashboardPage', () => {
  it('menampilkan statistik dari API untuk admin', async () => {
    mockApi({ 'GET /api/reports/stats': { data: stats } });
    renderWithProviders(<DashboardPage />, { preloadedState: authState(ADMIN) });
    expect(screen.getByRole('status')).toHaveTextContent('Memuat statistik...');
    expect(await screen.findByText('Lampu koridor mati')).toBeInTheDocument();
    const section = screen.getByLabelText('Statistik laporan');
    expect(section).toHaveTextContent('Total laporan5');
    expect(section).toHaveTextContent('Menunggu2');
    expect(section).toHaveTextContent('1 laporan ditolak');
    expect(screen.getAllByText('Listrik & Pencahayaan')).toHaveLength(2);
    expect(screen.getByText('Ringkasan seluruh laporan kerusakan asrama.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Buat laporan/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat semua' })).toHaveAttribute('href', '/admin/reports');
    expect(screen.getByText(/Pelapor:/)).toBeInTheDocument();
  });

  it('empty state untuk penghuni yang belum punya laporan', async () => {
    mockApi({
      'GET /api/reports/stats': {
        data: { scope: 'mine', total: 0, byStatus: { menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 }, byCategory: [], recent: [] },
      },
    });
    renderWithProviders(<DashboardPage />, { preloadedState: authState(RESIDENT) });
    expect(await screen.findByText('Belum ada laporan')).toBeInTheDocument();
    expect(screen.getByText('Laporkan kerusakan pertama Anda.')).toBeInTheDocument();
    expect(screen.getByText('Belum ada data kategori.')).toBeInTheDocument();
    expect(screen.getAllByText('(0%)')).toHaveLength(4);
    expect(screen.getByRole('link', { name: /Buat laporan/ })).toHaveAttribute('href', '/reports/new');
    expect(screen.getByRole('link', { name: 'Lihat semua' })).toHaveAttribute('href', '/my-reports');
  });

  it('empty state admin', async () => {
    mockApi({
      'GET /api/reports/stats': {
        data: { scope: 'all', total: 0, byStatus: { menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 }, byCategory: [], recent: [] },
      },
    });
    renderWithProviders(<DashboardPage />, { preloadedState: authState(ADMIN) });
    expect(await screen.findByText('Laporan dari penghuni akan muncul di sini.')).toBeInTheDocument();
  });

  it('error state dan coba lagi', async () => {
    let calls = 0;
    mockApi({
      'GET /api/reports/stats': () => {
        calls += 1;
        return calls === 1 ? { status: 500, message: 'Terjadi kesalahan pada server' } : { data: stats };
      },
    });
    const { user } = renderWithProviders(<DashboardPage />, { preloadedState: authState(ADMIN) });
    expect(await screen.findByRole('alert')).toHaveTextContent('Terjadi kesalahan pada server');
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Lampu koridor mati')).toBeInTheDocument();
  });
});
