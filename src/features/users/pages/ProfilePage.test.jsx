import { screen, waitFor, within } from '@testing-library/react';
import Swal from 'sweetalert2';
import { describe, expect, it } from 'vitest';
import ProfilePage from './ProfilePage';
import { ADMIN, RESIDENT, authState, mockApi, renderWithProviders } from '../../../test-utils';

describe('ProfilePage', () => {
  it('menampilkan dan memperbarui profil', async () => {
    let sent;
    mockApi({
      'PUT /api/users/me': ({ body }) => {
        sent = body;
        return { data: { user: { ...RESIDENT, ...body } } };
      },
    });
    const { user, store } = renderWithProviders(<ProfilePage />, { preloadedState: authState(RESIDENT) });
    const form = screen.getByRole('form', { name: 'Form profil' });
    expect(within(form).getByLabelText('Email')).toBeDisabled();
    const name = within(form).getByLabelText('Nama lengkap');
    await user.clear(name);
    await user.type(name, 'Budi Baru');
    await user.click(within(form).getByRole('button', { name: 'Simpan profil' }));
    await waitFor(() => expect(store.getState().auth.user.name).toBe('Budi Baru'));
    expect(sent).toEqual({ name: 'Budi Baru', room: 'A-101' });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Profil berhasil diperbarui' }));
  });

  it('validasi profil dan error server', async () => {
    mockApi({ 'PUT /api/users/me': { status: 400, body: { success: false, message: 'Data tidak valid', errors: { room: 'Kamar ditolak' } } } });
    const { user } = renderWithProviders(<ProfilePage />, { preloadedState: authState(ADMIN) });
    const form = screen.getByRole('form', { name: 'Form profil' });
    const name = within(form).getByLabelText('Nama lengkap');
    await user.clear(name);
    await user.click(within(form).getByRole('button', { name: 'Simpan profil' }));
    expect(within(form).getByText('Nama wajib diisi')).toBeInTheDocument();
    await user.type(name, 'Admin Baru');
    await user.click(within(form).getByRole('button', { name: 'Simpan profil' }));
    expect(await within(form).findByText('Kamar ditolak')).toBeInTheDocument();
  });

  it('mengganti password dan mengosongkan form', async () => {
    let sent;
    mockApi({
      'PUT /api/users/me/password': ({ body }) => {
        sent = body;
        return { data: null };
      },
    });
    const { user } = renderWithProviders(<ProfilePage />, { preloadedState: authState(RESIDENT) });
    const form = screen.getByRole('form', { name: 'Form password' });
    await user.click(within(form).getByRole('button', { name: 'Ganti password' }));
    expect(within(form).getByText('Password lama wajib diisi')).toBeInTheDocument();
    await user.type(within(form).getByLabelText('Password lama'), 'Penghuni123');
    await user.type(within(form).getByLabelText('Password baru'), 'Baru12345');
    await user.type(within(form).getByLabelText('Konfirmasi password baru'), 'Baru12345');
    await user.click(within(form).getByRole('button', { name: 'Ganti password' }));
    await waitFor(() => expect(within(form).getByLabelText('Password lama')).toHaveValue(''));
    expect(sent).toEqual({ currentPassword: 'Penghuni123', newPassword: 'Baru12345' });
  });

  it('password lama salah', async () => {
    mockApi({
      'PUT /api/users/me/password': {
        status: 400,
        body: { success: false, message: 'Password lama tidak sesuai', errors: { currentPassword: 'Password lama tidak sesuai' } },
      },
    });
    const { user } = renderWithProviders(<ProfilePage />, { preloadedState: authState(RESIDENT) });
    const form = screen.getByRole('form', { name: 'Form password' });
    await user.type(within(form).getByLabelText('Password lama'), 'Salah12345');
    await user.type(within(form).getByLabelText('Password baru'), 'Baru12345');
    await user.type(within(form).getByLabelText('Konfirmasi password baru'), 'Baru12345');
    await user.click(within(form).getByRole('button', { name: 'Ganti password' }));
    expect(await within(form).findByText('Password lama tidak sesuai')).toBeInTheDocument();
  });

  it('error server tanpa detail field', async () => {
    mockApi({
      'PUT /api/users/me': { status: 500, message: 'Server error' },
      'PUT /api/users/me/password': { status: 500, message: 'Server error' },
    });
    const { user } = renderWithProviders(<ProfilePage />, { preloadedState: authState(RESIDENT) });
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }));
    const form = screen.getByRole('form', { name: 'Form password' });
    await user.type(within(form).getByLabelText('Password lama'), 'Salah12345');
    await user.type(within(form).getByLabelText('Password baru'), 'Baru12345');
    await user.type(within(form).getByLabelText('Konfirmasi password baru'), 'Baru12345');
    await user.click(within(form).getByRole('button', { name: 'Ganti password' }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(2));
  });
});
