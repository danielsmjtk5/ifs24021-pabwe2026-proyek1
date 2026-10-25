import { screen, waitFor, within } from '@testing-library/react';
import Swal from 'sweetalert2';
import { describe, expect, it } from 'vitest';
import ReportDetailPage from './ReportDetailPage';
import { ADMIN, RESIDENT, authState, makeReport, mockApi, renderWithProviders } from '../../../test-utils';

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
  it('tetap tampil walau data laporan dari API tidak lengkap', async () => {
    renderDetail(RESIDENT, { 'GET /api/reports/7': { data: { report: { id: 7, status: 'menunggu', priority: 'sedang' } } } });
    expect(await screen.findByRole('heading', { level: 1, name: '(Tanpa judul)' })).toBeInTheDocument();
    expect(screen.getByText('Pengguna terhapus')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hapus laporan/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ubah laporan/ })).not.toBeInTheDocument();
  });

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

describe('ReportDetailPage - admin', () => {
  const report = makeReport({ permissions: adminPermissions });

  it('mengubah status melalui modal', async () => {
    let sent;
    const { user } = renderDetail(ADMIN, {
      'GET /api/reports/7': { data: { report } },
      'PATCH /api/reports/7/status': ({ body }) => {
        sent = body;
        return {
          data: {
            report: makeReport({
              status: 'diproses',
              permissions: { ...adminPermissions, nextStatuses: ['selesai', 'ditolak'] },
              history: [
                ...report.history,
                { id: 2, old_status: 'menunggu', new_status: 'diproses', note: 'Dicek teknisi', created_at: '2026-10-21T08:00:00.000Z', changed_by_name: 'Admin Asrama', changed_by_role: 'admin' },
              ],
            }),
          },
        };
      },
    });
    await user.click(await screen.findByRole('button', { name: /Ubah status/ }));
    const dialog = screen.getByRole('dialog', { name: 'Ubah status laporan' });
    expect(within(dialog).getByLabelText('Status baru')).toHaveValue('diproses');
    await user.type(within(dialog).getByLabelText('Catatan (opsional)'), 'Dicek teknisi');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan status' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(sent).toEqual({ status: 'diproses', note: 'Dicek teknisi' });
    expect(screen.getByText('Dicek teknisi')).toBeInTheDocument();
    expect(screen.getByText(/oleh Admin Asrama \(Admin\)/)).toBeInTheDocument();
  });

  it('penolakan wajib alasan, dan error server membuat modal tetap terbuka', async () => {
    const { user } = renderDetail(ADMIN, {
      'GET /api/reports/7': { data: { report } },
      'PATCH /api/reports/7/status': { status: 409, message: 'Status tidak dapat diubah' },
    });
    await user.click(await screen.findByRole('button', { name: /Ubah status/ }));
    const dialog = screen.getByRole('dialog');
    await user.selectOptions(within(dialog).getByLabelText('Status baru'), 'ditolak');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan status' }));
    expect(within(dialog).getByText('Alasan penolakan wajib diisi')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('Alasan penolakan'), 'Laporan duplikat');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan status' }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Status tidak dapat diubah' })));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('menambah catatan tindak lanjut', async () => {
    const { user } = renderDetail(ADMIN, {
      'GET /api/reports/7': { data: { report } },
      'POST /api/reports/7/notes': {
        data: {
          report: makeReport({
            permissions: adminPermissions,
            history: [
              ...report.history,
              { id: 3, old_status: 'menunggu', new_status: 'menunggu', note: 'Menunggu suku cadang', created_at: '2026-10-21T09:00:00.000Z', changed_by_name: null, changed_by_role: null },
            ],
          }),
        },
      },
    });
    await user.click(await screen.findByRole('button', { name: /Tambah catatan/ }));
    const dialog = screen.getByRole('dialog', { name: 'Tambah catatan tindak lanjut' });
    await user.click(within(dialog).getByRole('button', { name: 'Simpan catatan' }));
    expect(within(dialog).getByText('Catatan wajib diisi')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('Catatan'), 'Menunggu suku cadang');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan catatan' }));
    expect(await screen.findByText('Menunggu suku cadang')).toBeInTheDocument();
    expect(screen.getByText('Catatan tindak lanjut')).toBeInTheDocument();
    expect(screen.getByText('oleh Pengguna terhapus')).toBeInTheDocument();
  });

  it('catatan gagal tetap membuka modal; batal menutup', async () => {
    const { user } = renderDetail(ADMIN, {
      'GET /api/reports/7': { data: { report } },
      'POST /api/reports/7/notes': { status: 500, message: 'Server error' },
    });
    await user.click(await screen.findByRole('button', { name: /Tambah catatan/ }));
    await user.type(screen.getByLabelText('Catatan'), 'Catatan uji');
    await user.click(screen.getByRole('button', { name: 'Simpan catatan' }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Server error' })));
    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('admin diarahkan ke kelola laporan setelah menghapus', async () => {
    const { user } = renderDetail(ADMIN, {
      'GET /api/reports/7': { data: { report } },
      'DELETE /api/reports/7': { data: null },
    });
    await user.click(await screen.findByRole('button', { name: /Hapus laporan/ }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/reports'));
  });

  it('laporan selesai hanya bisa diberi catatan', async () => {
    renderDetail(ADMIN, {
      'GET /api/reports/7': {
        data: { report: makeReport({ status: 'selesai', permissions: { ...adminPermissions, canChangeStatus: false, nextStatuses: [] } }) },
      },
    });
    expect(await screen.findByRole('button', { name: /Tambah catatan/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ubah status/ })).not.toBeInTheDocument();
  });
});
