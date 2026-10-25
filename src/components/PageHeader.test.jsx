import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
  it('menampilkan judul, deskripsi, dan aksi', () => {
    render(<PageHeader title="Judul" description="Deskripsi" actions={<button type="button">Aksi</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Judul' })).toBeInTheDocument();
    expect(screen.getByText('Deskripsi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aksi' })).toBeInTheDocument();
  });

  it('boleh tanpa deskripsi dan aksi', () => {
    render(<PageHeader title="Tanpa aksi" />);
    expect(screen.getByRole('heading', { name: 'Tanpa aksi' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
