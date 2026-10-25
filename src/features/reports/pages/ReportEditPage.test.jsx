import { screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import { describe, expect, it } from 'vitest';
import ReportEditPage from './ReportEditPage';
import { RESIDENT, authState, makeReport, mockApi, renderWithProviders } from '../../../test-utils';

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
