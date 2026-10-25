import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RegisterPage from './RegisterPage';
import { RESIDENT, mockApi, renderWithProviders } from '../../../test-utils';

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
