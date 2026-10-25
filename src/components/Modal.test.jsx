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

  it('memindahkan fokus ke dalam modal dan mengunci Tab di dalamnya', async () => {
    const user = userEvent.setup();
    render(
      <Modal title="Ubah status" onClose={() => {}}>
        <input aria-label="Catatan" />
        <button type="button">Simpan</button>
      </Modal>,
    );
    const close = screen.getByRole('button', { name: 'Tutup' });
    const save = screen.getByRole('button', { name: 'Simpan' });
    expect(close).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Catatan')).toHaveFocus();
    await user.tab();
    expect(save).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(save).toHaveFocus();
    await user.tab();
    await user.tab({ shift: true });
    expect(save).toHaveFocus();
  });

  it('mengunci scroll halaman lalu mengembalikan fokus ke tombol pemicu saat ditutup', () => {
    function Harness({ open }) {
      return (
        <>
          <button type="button">Buka</button>
          {open && (
            <Modal title="Info" onClose={() => {}}>
              <p>Tanpa tombol</p>
            </Modal>
          )}
        </>
      );
    }
    const { rerender } = render(<Harness open={false} />);
    const trigger = screen.getByRole('button', { name: 'Buka' });
    trigger.focus();
    const overflowBefore = document.body.style.overflow;
    rerender(<Harness open />);
    expect(screen.getByRole('button', { name: 'Tutup' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Harness open={false} />);
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe(overflowBefore);
  });


  it('memakai onClose terbaru saat Escape ditekan', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Modal title="Judul" onClose={first} />);
    rerender(<Modal title="Judul" onClose={second} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
