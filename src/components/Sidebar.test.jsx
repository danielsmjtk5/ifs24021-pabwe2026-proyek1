import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Sidebar, { navItemsFor } from './Sidebar';
import { ADMIN, RESIDENT } from '../test-utils';

describe('Sidebar', () => {
  it('menu berbeda untuk penghuni dan admin', () => {
    expect(navItemsFor('penghuni').map((i) => i.label)).toEqual([
      'Dashboard',
      'Semua Laporan',
      'Laporan Saya',
      'Buat Laporan',
      'Profil',
    ]);
    expect(navItemsFor('admin').map((i) => i.label)).toEqual(['Dashboard', 'Semua Laporan', 'Kelola Laporan', 'Profil']);
  });

  it('menandai menu aktif dan menutup di mobile', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter initialEntries={['/my-reports']}>
        <Sidebar user={RESIDENT} open onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Laporan Saya' })).toHaveClass('bg-white/10');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass('bg-white/10');
    await userEvent.click(screen.getByTestId('sidebar-backdrop'));
    await userEvent.click(screen.getByRole('button', { name: 'Tutup menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'Profil' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('tersembunyi saat tertutup', () => {
    render(
      <MemoryRouter>
        <Sidebar user={ADMIN} open={false} onClose={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Navigasi utama')).toHaveClass('-translate-x-full');
  });
});
