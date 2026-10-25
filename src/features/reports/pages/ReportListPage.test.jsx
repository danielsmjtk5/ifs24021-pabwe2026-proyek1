import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ReportListPage from './ReportListPage';
import { ADMIN, RESIDENT, authState, makeReport, mockApi, renderWithProviders } from '../../../test-utils';

const reports = [
  makeReport({ id: 1, title: 'Keran bocor', reporter: { id: 3, name: 'Sari Lestari' } }),
  makeReport({ id: 2, title: 'Lampu mati', status: 'diproses' }),
];

function listHandler(captured, { total = 2, totalPages = 1, items = reports } = {}) {
  return ({ url }) => {
    captured.push(Object.fromEntries(url.searchParams));
    return { data: { reports: items, pagination: { page: Number(url.searchParams.get('page')), limit: 10, total, totalPages } } };
  };
}

describe('ReportListPage', () => {
  it('mode semua laporan: memuat dari API dan menampilkan pelapor', async () => {
    const queries = [];
    mockApi({ 'GET /api/reports': listHandler(queries) });
    renderWithProviders(<ReportListPage mode="all" />, { preloadedState: authState(RESIDENT) });
    expect(screen.getByRole('status')).toHaveTextContent('Memuat laporan...');
    expect(await screen.findByText('Keran bocor')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Semua Laporan' })).toBeInTheDocument();
    expect(screen.getByText('Sari Lestari')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Keran bocor/ })).toHaveAttribute('href', '/reports/1');
    expect(queries[0]).toEqual({ sort: 'newest', page: '1', limit: '10' });
  });

  it('mode laporan saya mengirim mine=true tanpa kolom pelapor', async () => {
    const queries = [];
    mockApi({ 'GET /api/reports': listHandler(queries) });
    renderWithProviders(<ReportListPage mode="mine" />, { preloadedState: authState(RESIDENT) });
    await screen.findByText('Keran bocor');
    expect(queries[0].mine).toBe('true');
    expect(screen.queryByText(/Pelapor:/)).not.toBeInTheDocument();
  });

  it('mode admin mengurutkan berdasarkan prioritas dan tanpa tombol buat laporan', async () => {
    const queries = [];
    mockApi({ 'GET /api/reports': listHandler(queries) });
    renderWithProviders(<ReportListPage mode="admin" />, { preloadedState: authState(ADMIN) });
    await screen.findByText('Keran bocor');
    expect(queries[0].sort).toBe('priority');
    expect(screen.getByRole('heading', { name: 'Kelola Laporan' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Buat laporan/ })).not.toBeInTheDocument();
  });

  it('filter, pencarian, dan reset mengirim query ke API', async () => {
    const queries = [];
    mockApi({ 'GET /api/reports': listHandler(queries) });
    const { user } = renderWithProviders(<ReportListPage />, { preloadedState: authState(RESIDENT) });
    await screen.findByText('Keran bocor');

    await user.selectOptions(screen.getByLabelText('Kategori'), 'listrik');
    await user.selectOptions(screen.getByLabelText('Prioritas'), 'darurat');
    await user.selectOptions(screen.getByLabelText('Status'), 'menunggu');
    await user.selectOptions(screen.getByLabelText('Urutkan'), 'oldest');
    await user.type(screen.getByLabelText('Dari tanggal'), '2026-10-01');
    await user.type(screen.getByLabelText('Sampai tanggal'), '2026-10-31');
    await user.type(screen.getByLabelText('Cari laporan'), '  lampu  ');
    await user.click(screen.getByRole('button', { name: 'Cari' }));

    await waitFor(() =>
      expect(queries.at(-1)).toEqual({
        q: 'lampu',
        category: 'listrik',
        priority: 'darurat',
        status: 'menunggu',
        dateFrom: '2026-10-01',
        dateTo: '2026-10-31',
        sort: 'oldest',
        page: '1',
        limit: '10',
      }),
    );

    await user.click(screen.getByRole('button', { name: /Reset/ }));
    await waitFor(() => expect(queries.at(-1)).toEqual({ sort: 'newest', page: '1', limit: '10' }));
    expect(screen.getByLabelText('Cari laporan')).toHaveValue('');
  });

  it('pagination memuat halaman berikutnya', async () => {
    const queries = [];
    mockApi({ 'GET /api/reports': listHandler(queries, { total: 15, totalPages: 2 }) });
    const { user } = renderWithProviders(<ReportListPage />, { preloadedState: authState(RESIDENT) });
    await screen.findByText('Keran bocor');
    await user.click(screen.getByRole('button', { name: /Berikutnya/ }));
    await waitFor(() => expect(queries.at(-1).page).toBe('2'));
  });

  it('empty state dengan ajakan membuat laporan', async () => {
    mockApi({ 'GET /api/reports': listHandler([], { items: [], total: 0 }) });
    renderWithProviders(<ReportListPage />, { preloadedState: authState(RESIDENT) });
    expect(await screen.findByText('Tidak ada laporan')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Buat laporan/ })).toHaveLength(2);
  });

  it('empty state admin tanpa ajakan membuat laporan', async () => {
    mockApi({ 'GET /api/reports': listHandler([], { items: [], total: 0 }) });
    renderWithProviders(<ReportListPage mode="admin" />, { preloadedState: authState(ADMIN) });
    expect(await screen.findByText('Tidak ada laporan')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Buat laporan/ })).not.toBeInTheDocument();
  });

  it('error state saat server gagal dan bisa dicoba lagi', async () => {
    let calls = 0;
    mockApi({
      'GET /api/reports': () => {
        calls += 1;
        return calls === 1 ? new TypeError('Failed to fetch') : { data: { reports, pagination: { page: 1, totalPages: 1, total: 2 } } };
      },
    });
    const { user } = renderWithProviders(<ReportListPage />, { preloadedState: authState(RESIDENT) });
    expect(await screen.findByRole('alert')).toHaveTextContent('Tidak dapat terhubung ke server');
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Keran bocor')).toBeInTheDocument();
  });
});
