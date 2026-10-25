import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormField from './FormField';

describe('FormField', () => {
  it('menghubungkan label, input, dan error', () => {
    render(<FormField id="judul" label="Judul" error="Judul wajib diisi" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Judul');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('input-error');
    expect(input).toHaveAccessibleDescription('Judul wajib diisi');
  });

  it('membuat id unik bila id tidak diberikan', () => {
    render(
      <>
        <FormField label="Catatan A" value="" onChange={() => {}} />
        <FormField label="Catatan B" value="" onChange={() => {}} />
      </>,
    );
    const a = screen.getByLabelText('Catatan A');
    const b = screen.getByLabelText('Catatan B');
    expect(a.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
    expect(a).not.toHaveAttribute('aria-describedby');
  });

  it('mendukung select, textarea, dan hint', () => {
    render(
      <>
        <FormField id="kat" as="select" label="Kategori" value="a" onChange={() => {}}>
          <option value="a">A</option>
        </FormField>
        <FormField id="desk" as="textarea" label="Deskripsi" hint="Maks 1000" value="" onChange={() => {}} />
      </>,
    );
    expect(screen.getByLabelText('Kategori').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Deskripsi').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Deskripsi')).toHaveAccessibleDescription('Maks 1000');
  });
});
