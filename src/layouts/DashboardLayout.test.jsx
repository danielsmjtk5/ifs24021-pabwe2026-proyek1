import { screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import { describe, expect, it } from 'vitest';
import DashboardLayout from './DashboardLayout';
import { RESIDENT, authState, mockApi, renderWithProviders } from '../test-utils';

function renderLayout() {
  return renderWithProviders(<DashboardLayout />, {
    preloadedState: authState(RESIDENT),
    path: '/__layout',
    route: '/',
    extraRoutes: (
      <>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<p>Konten halaman</p>} />
        </Route>
        <Route path="/auth/login" element={<p>Halaman login</p>} />
      </>
    ),
  });
}

describe('DashboardLayout', () => {
  it('menampilkan sidebar, navbar, dan konten', () => {
    renderLayout();
    expect(screen.getByLabelText('Navigasi utama')).toBeInTheDocument();
    expect(screen.getByText('Konten halaman')).toBeInTheDocument();
    expect(screen.getAllByText('Budi Santoso').length).toBeGreaterThan(0);
  });

  it('membuka dan menutup menu mobile', async () => {
    const { user } = renderLayout();
    await user.click(screen.getByRole('button', { name: 'Buka menu' }));
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tutup menu' }));
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
  });

  it('logout setelah konfirmasi', async () => {
    const fetchMock = mockApi({ 'POST /api/auth/logout': { data: null } });
    const { user, store } = renderLayout();
    await user.click(screen.getByRole('button', { name: /Keluar/ }));
    expect(await screen.findByText('Halaman login')).toBeInTheDocument();
    expect(store.getState().auth.user).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
  });

  it('batal logout', async () => {
    const fetchMock = mockApi();
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    const { user, store } = renderLayout();
    await user.click(screen.getByRole('button', { name: /Keluar/ }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(store.getState().auth.user).toEqual(RESIDENT);
  });
});
