import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Brand from './Brand';
import NotFoundPage from './NotFoundPage';

describe('Brand dan NotFoundPage', () => {
  it('render', () => {
    render(
      <MemoryRouter>
        <Brand />
        <Brand light />
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('AsramaCare')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke dashboard' })).toHaveAttribute('href', '/');
  });
});
