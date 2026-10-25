import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import { describe, expect, it } from 'vitest';
import ReportDetailPage from './ReportDetailPage';
import { RESIDENT, authState, makeReport, mockApi, renderWithProviders } from '../../../test-utils';

const adminPermissions = {
  canEdit: false,
  canDelete: true,
  canChangeStatus: true,
  canAddNote: true,
  nextStatuses: ['diproses', 'ditolak'],
};

function renderDetail(user, handlers, route = '/reports/7') {
  mockApi(handlers);
  return renderWithProviders(<ReportDetailPage />, { preloadedState: authState(user), path: '/reports/:id', route });
}

describe('ReportDetailPage - penghuni', () => {
  it('menampilkan detail, riwayat, dan aksi pemilik', async () => {
    renderDetail(RESIDENT, { 'GET /api/reports/7': { data: { report: makeReport() } } });
    expect(screen.getByRole('status')).toHaveTextContent('Memuat detail laporan...');
    expect(await screen.findByRole('heading', { name: 'Lampu kamar mandi mati' })).toBeInTheDocument();
    expect(screen.getByText('Listrik & Pencahayaan')).toBeInTheDocument();
    expect(screen.getByText('Laporan dibuat')).toBeInTheDocument();
    expect(screen.getByText('Kamar A-101')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ubah laporan/ })).toHaveAttribute('href', '/reports/7/edit');
    expect(screen.queryByText('Tindakan admin')).not.toBeInTheDocument();
  });

  it('laporan milik sendiri yang sudah diproses tidak dapat diubah', async () => {
    renderDetail(RESIDENT, {
      'GET /api/reports/7': {
        data: { report: makeReport({ status: 'diproses', permissions: { ...adminPermissions, canDelete: false, canChangeStatus: false, canAddNote: false } }) },
      },
    });
    expect(await screen.findByText(/tidak dapat diubah atau dihapus/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hapus laporan/ })).not.toBeInTheDocument();
  });

  it('laporan milik orang lain: tanpa kontak dan tanpa aksi', async () => {
    renderDetail(RESIDENT, {
      'GET /api/reports/7': {
        data: {
          report: makeReport({
            reporter: { id: 9, name: 'Sari Lestari' },
            permissions: { canEdit: false, canDelete: false, canChangeStatus: false, canAddNote: false, nextStatuses: [] },
          }),
        },
      },
    });
    await screen.findByText('Sari Lestari');
    expect(screen.queryByText('Kontak')).not.toBeInTheDocument();
    expect(screen.queryByText(/tidak dapat diubah atau dihapus/)).not.toBeInTheDocument();
  });

  it('menghapus laporan setelah konfirmasi', async () => {
    const { user } = renderDetail(RESIDENT, {
      'GET /api/reports/7': { data: { report: makeReport() } },
      'DELETE /api/reports/7': { data: null },
    });
    await user.click(await screen.findByRole('button', { name: /Hapus laporan/ }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/my-reports'));
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Hapus laporan ini?' }));
  });

  it('membatalkan penghapusan', async () => {
    const fetchMock = mockApi({ 'GET /api/reports/7': { data: { report: makeReport() } } });
    const { user } = renderWithProviders(<ReportDetailPage />, {
      preloadedState: authState(RESIDENT),
      path: '/reports/:id',
      route: '/reports/7',
    });
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await user.click(await screen.findByRole('button', { name: /Hapus laporan/ }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('location')).toHaveTextContent('/reports/7');
  });

  it('menampilkan pesan jika penghapusan ditolak server', async () => {
    const { user } = renderDetail(RESIDENT, {
      'GET /api/reports/7': { data: { report: makeReport() } },
      'DELETE /api/reports/7': { status: 409, message: 'Laporan yang sudah diproses tidak dapat dihapus' },
    });
    await user.click(await screen.findByRole('button', { name: /Hapus laporan/ }));
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Laporan yang sudah diproses tidak dapat dihapus' })),
    );
  });

  it('error 404 dapat dicoba lagi', async () => {
    const { user } = renderDetail(RESIDENT, { 'GET /api/reports/99': { status: 404, message: 'Laporan tidak ditemukan' } }, '/reports/99');
    expect(await screen.findByRole('alert')).toHaveTextContent('Laporan tidak ditemukan');
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
  });

  it('tombol kembali', async () => {
    mockApi({ 'GET /api/reports/7': { data: { report: makeReport() } } });
    const { user } = renderWithProviders(<ReportDetailPage />, {
      preloadedState: authState(RESIDENT),
      path: '/reports/:id',
      route: '/reports/7',
      history: ['/my-reports'],
    });
    await user.click(await screen.findByRole('button', { name: /Kembali/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/my-reports');
  });
});
