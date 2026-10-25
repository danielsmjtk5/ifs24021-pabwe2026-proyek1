import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from './Navbar';
import { RESIDENT } from '../test-utils';

describe('Navbar', () => {
  it('menampilkan pengguna dan memanggil handler', async () => {
    const onMenu = vi.fn();
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <Navbar user={RESIDENT} onMenu={onMenu} onLogout={onLogout} />
      </MemoryRouter>,
    );
    expect(screen.getByText('BS')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Buka menu' }));
    await userEvent.click(screen.getByRole('button', { name: /Keluar/ }));
    expect(onMenu).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
  });
});
