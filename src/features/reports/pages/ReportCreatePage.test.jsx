import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import { describe, expect, it } from 'vitest';
import ReportCreatePage from './ReportCreatePage';
import { RESIDENT, authState, fillReportForm, makeReport, mockApi, renderWithProviders } from '../../../test-utils';

describe('ReportCreatePage', () => {
  it('membuat laporan lalu membuka detail', async () => {
    const fetchMock = mockApi({ 'POST /api/reports': { status: 201, data: { report: makeReport({ id: 12 }) } } });
    const { user } = renderWithProviders(<ReportCreatePage />, { preloadedState: authState(RESIDENT) });
    await fillReportForm(user);
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
    await fillReportForm(user);
    await user.click(screen.getByRole('button', { name: 'Kirim laporan' }));
    expect(await screen.findByText('Lokasi ditolak')).toBeInTheDocument();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Data tidak valid' }));
  });

  it('tombol batal kembali ke halaman sebelumnya', async () => {
    mockApi();
    const { user } = renderWithProviders(<ReportCreatePage />, {
      preloadedState: authState(RESIDENT),
      route: '/reports/new',
      path: '/reports/new',
      history: ['/my-reports'],
    });
    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/my-reports');
  });

  it('error tanpa detail field', async () => {
    mockApi({ 'POST /api/reports': { status: 500, message: 'Server error' } });
    const { user } = renderWithProviders(<ReportCreatePage />, { preloadedState: authState(RESIDENT) });
    await fillReportForm(user);
    await user.click(screen.getByRole('button', { name: 'Kirim laporan' }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Server error' })));
  });
});
