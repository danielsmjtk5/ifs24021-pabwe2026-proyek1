import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
  it('menutup lewat tombol dan tombol Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal title="Judul modal" description="Penjelasan" onClose={onClose}>
        <p>Isi</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Judul modal' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('memakai id unik sehingga dua modal tidak saling bentrok', () => {
    render(
      <>
        <Modal title="Modal pertama" description="Deskripsi pertama" onClose={() => {}} />
        <Modal title="Modal kedua" onClose={() => {}} />
      </>,
    );
    const first = screen.getByRole('dialog', { name: 'Modal pertama' });
    const second = screen.getByRole('dialog', { name: 'Modal kedua' });
    expect(first.getAttribute('aria-labelledby')).not.toBe(second.getAttribute('aria-labelledby'));
    expect(first).toHaveAccessibleDescription('Deskripsi pertama');
    expect(second).not.toHaveAttribute('aria-describedby');
  });
});
