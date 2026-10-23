import { screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import { describe, expect, it, vi } from 'vitest';
import ReportForm from './components/ReportForm';
import ReportCreatePage from './pages/ReportCreatePage';
import ReportEditPage from './pages/ReportEditPage';
import { RESIDENT, authState, makeReport, mockApi, renderWithProviders } from '../../test-utils';

async function fillForm(user, values = {}) {
  const v = {
    title: 'Kloset tersumbat',
    category: 'air_sanitasi',
    priority: 'tinggi',
    location: 'Gedung A Lantai 1',
    description: 'Kloset tersumbat dan air meluap.',
    ...values,
  };
  await user.type(screen.getByLabelText('Judul laporan'), v.title);
  await user.selectOptions(screen.getByLabelText('Kategori kerusakan'), v.category);
  await user.selectOptions(screen.getByLabelText('Tingkat prioritas'), v.priority);
  await user.type(screen.getByLabelText('Lokasi fasilitas'), v.location);
  await user.type(screen.getByLabelText('Deskripsi kerusakan'), v.description);
}

describe('ReportForm', () => {
  it('menampilkan semua error validasi dan tidak submit', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ReportForm submitLabel="Kirim" onSubmit={onSubmit} onCancel={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    expect(screen.getByText('Judul wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Pilih kategori kerusakan')).toBeInTheDocument();
    expect(screen.getByText('Pilih tingkat prioritas')).toBeInTheDocument();
    expect(screen.getByText('Lokasi wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mengirim nilai yang sudah di-trim dan memanggil batal', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const onCancel = vi.fn();
    const { user } = renderWithProviders(<ReportForm submitLabel="Kirim" onSubmit={onSubmit} onCancel={onCancel} />);
    await fillForm(user, { title: '  Kloset tersumbat  ' });
    expect(screen.getByText('32/1000 karakter')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Kloset tersumbat',
      category: 'air_sanitasi',
      priority: 'tinggi',
      location: 'Gedung A Lantai 1',
      description: 'Kloset tersumbat dan air meluap.',
    });
    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('menampilkan error dari server', () => {
    renderWithProviders(
      <ReportForm submitLabel="Kirim" onSubmit={() => {}} onCancel={() => {}} serverErrors={{ title: 'Judul ditolak server' }} />,
    );
    expect(screen.getByText('Judul ditolak server')).toBeInTheDocument();
  });
});

describe('ReportCreatePage', () => {
  it('membuat laporan lalu membuka detail', async () => {
    const fetchMock = mockApi({ 'POST /api/reports': { status: 201, data: { report: makeReport({ id: 12 }) } } });
    const { user } = renderWithProviders(<ReportCreatePage />, { preloadedState: authState(RESIDENT) });
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Kirim laporan' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/reports/12'));
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Laporan berhasil dibuat' }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('status');
  });

  it('menampilkan error server', async () => {
    mockApi({
      'POST /api/reports': { status: 400, body: { success: false, message: 'Data tidak valid', errors: { location: 'Lokasi ditolak' } } },
    });
    const { user } = renderWithProviders(<ReportCreatePage />, { preloadedState: authState(RESIDENT) });
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Kirim laporan' }));
    expect(await screen.findByText('Lokasi ditolak')).toBeInTheDocument();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Data tidak valid' }));
  });

  it('tombol batal kembali ke halaman sebelumnya', async () => {
    mockApi();
    const { user } = renderWithProviders(<ReportCreatePage />, { preloadedState: authState(RESIDENT) });
    await user.click(screen.getByRole('button', { name: 'Batal' }));
  });

  it('error tanpa detail field', async () => {
    mockApi({ 'POST /api/reports': { status: 500, message: 'Server error' } });
    const { user } = renderWithProviders(<ReportCreatePage />, { preloadedState: authState(RESIDENT) });
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Kirim laporan' }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Server error' })));
  });
});

describe('ReportEditPage', () => {
  const renderEdit = (handlers) => {
    mockApi(handlers);
    return renderWithProviders(<ReportEditPage />, {
      preloadedState: authState(RESIDENT),
      path: '/reports/:id/edit',
      route: '/reports/7/edit',
      extraRoutes: <Route path="/reports/:id" element={<p>Halaman detail</p>} />,
    });
  };

  it('mengisi form dengan data lama dan menyimpan perubahan', async () => {
    let sent;
    const { user } = renderEdit({
      'GET /api/reports/7': { data: { report: makeReport() } },
      'PUT /api/reports/7': ({ body }) => {
        sent = body;
        return { data: { report: makeReport({ title: body.title }) } };
      },
    });
    expect(await screen.findByDisplayValue('Lampu kamar mandi mati')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Judul laporan'), ' total');
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(screen.getByText('Halaman detail')).toBeInTheDocument());
    expect(sent.title).toBe('Lampu kamar mandi mati total');
  });

  it('mengalihkan ke detail jika laporan tidak bisa diubah', async () => {
    renderEdit({
      'GET /api/reports/7': { data: { report: makeReport({ status: 'diproses', permissions: { canEdit: false } }) } },
    });
    expect(await screen.findByText('Halaman detail')).toBeInTheDocument();
  });

  it('menampilkan error saat gagal memuat dan saat gagal menyimpan', async () => {
    const { user, unmount } = renderEdit({ 'GET /api/reports/7': { status: 404, message: 'Laporan tidak ditemukan' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Laporan tidak ditemukan');
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    unmount();

    const second = renderEdit({
      'GET /api/reports/7': { data: { report: makeReport() } },
      'PUT /api/reports/7': { status: 409, message: 'Laporan yang sudah diproses tidak dapat diubah' },
    });
    await screen.findByDisplayValue('Lampu kamar mandi mati');
    await second.user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Laporan yang sudah diproses tidak dapat diubah' })),
    );
    await second.user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(await screen.findByText('Halaman detail')).toBeInTheDocument();
  });
});
