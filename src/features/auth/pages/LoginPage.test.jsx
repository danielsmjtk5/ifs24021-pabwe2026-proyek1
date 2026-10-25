import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoginPage from './LoginPage';
import { RESIDENT, authState, mockApi, renderWithProviders } from '../../../test-utils';

function renderLogin(options = {}) {
  return renderWithProviders(<LoginPage />, { path: '/auth/login', route: '/auth/login', ...options });
}

describe('LoginPage', () => {
  it('memiliki selector yang dipakai audit otomatis (#username, #password, #btn-submit)', () => {
    mockApi();
    const { container } = renderLogin();
    expect(container.querySelector('#username')).toBe(screen.getByLabelText('Email'));
    expect(container.querySelector('#password')).toBe(screen.getByLabelText('Password'));
    expect(container.querySelector('#btn-submit')).toBe(screen.getByRole('button', { name: 'Masuk' }));
  });

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
