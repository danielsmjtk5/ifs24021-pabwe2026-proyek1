import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { setupStore } from './app/store';
import { ADMIN, RESIDENT, makeReport, mockApi } from './test-utils';

const emptyStats = {
  scope: 'mine',
  total: 1,
  byStatus: { menunggu: 1, diproses: 0, selesai: 0, ditolak: 0 },
  byCategory: [{ category: 'listrik', count: 1 }],
  recent: [makeReport()],
};

function renderApp(route = '/') {
  const store = setupStore();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
  return { store, user: userEvent.setup() };
}

describe('App (integrasi)', () => {
  it('menampilkan loading lalu mengarahkan tamu ke login', async () => {
    mockApi({ 'GET /api/auth/me': { status: 401, message: 'Silakan login terlebih dahulu' } });
    renderApp('/reports');
    expect(screen.getByText('Menyiapkan AsramaCare...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Masuk ke akun' })).toBeInTheDocument();
  });

  it('alur login penghuni hingga dashboard dan halaman laporan', async () => {
    mockApi({
      'GET /api/auth/me': { status: 401, message: 'Silakan login terlebih dahulu' },
      'POST /api/auth/login': { data: { user: RESIDENT } },
      'GET /api/reports/stats': { data: emptyStats },
      'GET /api/reports': { data: { reports: [makeReport()], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } },
    });
    const { user } = renderApp('/auth/login');
    await user.type(await screen.findByLabelText('Email'), 'budi@asramacare.test');
    await user.type(screen.getByLabelText('Password'), 'Penghuni123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Laporan Saya' }));
    expect(await screen.findByRole('heading', { name: 'Laporan Saya' })).toBeInTheDocument();
  });

  it('penghuni tidak dapat membuka halaman admin', async () => {
    mockApi({
      'GET /api/auth/me': { data: { user: RESIDENT } },
      'GET /api/reports/stats': { data: emptyStats },
    });
    renderApp('/admin/reports');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('admin tidak memiliki halaman buat laporan, tetapi bisa membuka kelola laporan', async () => {
    mockApi({
      'GET /api/auth/me': { data: { user: ADMIN } },
      'GET /api/reports/stats': { data: { ...emptyStats, scope: 'all' } },
      'GET /api/reports': { data: { reports: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } } },
    });
    const { user } = renderApp('/reports/new');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Kelola Laporan' }));
    expect(await screen.findByRole('heading', { name: 'Kelola Laporan' })).toBeInTheDocument();
  });

  it('pengguna yang sudah login dialihkan dari halaman login', async () => {
    mockApi({ 'GET /api/auth/me': { data: { user: RESIDENT } }, 'GET /api/reports/stats': { data: emptyStats } });
    renderApp('/auth/register');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('halaman 404', async () => {
    mockApi({ 'GET /api/auth/me': { status: 401, message: 'x' } });
    renderApp('/tidak-ada');
    expect(await screen.findByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
  });

  it('sesi kedaluwarsa saat memuat data mengarahkan ke login dengan pesan', async () => {
    mockApi({
      'GET /api/auth/me': { data: { user: RESIDENT } },
      'GET /api/reports/stats': { status: 401, message: 'Sesi Anda telah berakhir, silakan login kembali' },
    });
    const { store } = renderApp('/');
    expect(await screen.findByText('Sesi Anda telah berakhir. Silakan login kembali.')).toBeInTheDocument();
    expect(store.getState().auth.sessionExpired).toBe(true);
  });

  it('server tidak dapat dihubungi saat memeriksa sesi', async () => {
    let calls = 0;
    mockApi({
      'GET /api/auth/me': () => {
        calls += 1;
        return calls === 1 ? new TypeError('Failed to fetch') : { status: 401, message: 'x' };
      },
    });
    const { user } = renderApp('/');
    expect(await screen.findByRole('alert')).toHaveTextContent('Tidak dapat terhubung ke server');
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Masuk ke akun' })).toBeInTheDocument());
  });
});
