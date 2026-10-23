import { screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { RESIDENT, authState, mockApi, renderWithProviders } from '../../test-utils';

function renderLogin(options = {}) {
  return renderWithProviders(<LoginPage />, { path: '/auth/login', route: '/auth/login', ...options });
}

describe('AuthLayout', () => {
  it('menampilkan panel merek dan outlet', () => {
    renderWithProviders(<AuthLayout />, {
      path: '/auth',
      route: '/auth/login',
      extraRoutes: (
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<p>Isi form</p>} />
        </Route>
      ),
    });
    expect(screen.getByText(/Asrama nyaman dimulai/)).toBeInTheDocument();
  });
});

describe('LoginPage', () => {
  it('menampilkan validasi saat field kosong tanpa memanggil API', async () => {
    const fetchMock = mockApi();
    const { user } = renderLogin();
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Password wajib diisi')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('menampilkan pesan dari server saat login gagal', async () => {
    mockApi({ 'POST /api/auth/login': { status: 401, message: 'Email atau password salah' } });
    const { user } = renderLogin();
    await user.type(screen.getByLabelText('Email'), 'budi@asramacare.test');
    await user.type(screen.getByLabelText('Password'), 'salah123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email atau password salah');
  });

  it('login berhasil lalu diarahkan ke dashboard', async () => {
    const fetchMock = mockApi({ 'POST /api/auth/login': { data: { user: RESIDENT } } });
    const { user, store } = renderLogin();
    await user.type(screen.getByLabelText('Email'), '  budi@asramacare.test ');
    await user.type(screen.getByLabelText('Password'), 'Penghuni123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/));
    expect(store.getState().auth.user).toEqual(RESIDENT);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'budi@asramacare.test', password: 'Penghuni123' });
  });

  it('kembali ke halaman asal setelah login', async () => {
    mockApi({ 'POST /api/auth/login': { data: { user: RESIDENT } } });
    const { user } = renderWithProviders(<LoginPage />, { path: '/auth/login', route: { pathname: '/auth/login', state: { from: '/profile' } } });
    await user.type(screen.getByLabelText('Email'), 'budi@asramacare.test');
    await user.type(screen.getByLabelText('Password'), 'Penghuni123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/profile'));
  });

  it('menampilkan pemberitahuan sesi kedaluwarsa', () => {
    renderLogin({ preloadedState: authState(null, { sessionExpired: true }) });
    expect(screen.getByRole('status')).toHaveTextContent('Sesi Anda telah berakhir');
  });

  it('menampilkan error field dari server', async () => {
    mockApi({
      'POST /api/auth/login': { status: 400, body: { success: false, message: 'Data tidak valid', errors: { email: 'Format email ditolak server' } } },
    });
    const { user } = renderLogin();
    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    await user.type(screen.getByLabelText('Password'), 'x');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Format email ditolak server')).toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  const fill = async (user, overrides = {}) => {
    const values = {
      'Nama lengkap': 'Rina Wati',
      Email: 'rina@test.local',
      'Kamar (opsional)': 'C-3',
      Password: 'Rahasia123',
      'Konfirmasi password': 'Rahasia123',
      ...overrides,
    };
    for (const [label, value] of Object.entries(values)) {
      if (value) await user.type(screen.getByLabelText(label), value);
    }
  };

  it('validasi di sisi klien', async () => {
    const fetchMock = mockApi();
    const { user } = renderWithProviders(<RegisterPage />);
    await fill(user, { 'Konfirmasi password': 'Beda12345' });
    await user.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText('Konfirmasi password tidak sama')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('registrasi berhasil', async () => {
    const fetchMock = mockApi({ 'POST /api/auth/register': { status: 201, data: { user: { ...RESIDENT, name: 'Rina Wati' } } } });
    const { user, store } = renderWithProviders(<RegisterPage />, { path: '/auth/register', route: '/auth/register' });
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Daftar' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/));
    expect(store.getState().auth.user.name).toBe('Rina Wati');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      name: 'Rina Wati',
      email: 'rina@test.local',
      room: 'C-3',
      password: 'Rahasia123',
    });
  });

  it('menampilkan konflik email dari server', async () => {
    mockApi({ 'POST /api/auth/register': { status: 409, message: 'Email sudah terdaftar' } });
    const { user } = renderWithProviders(<RegisterPage />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email sudah terdaftar');
  });
});
