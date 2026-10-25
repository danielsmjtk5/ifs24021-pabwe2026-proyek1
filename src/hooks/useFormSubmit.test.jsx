import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useFormSubmit from './useFormSubmit';

const event = () => ({ preventDefault: vi.fn() });

function setup(overrides = {}) {
  const options = {
    getValues: () => ({ name: 'Budi' }),
    validate: () => ({}),
    submit: vi.fn().mockResolvedValue({ ok: true, data: { id: 1 } }),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
  return { options, ...renderHook(() => useFormSubmit(options)) };
}

describe('useFormSubmit', () => {
  it('tidak mengirim bila validasi gagal', async () => {
    const { result, options } = setup({ validate: () => ({ name: 'Nama wajib diisi' }) });
    const e = event();
    await act(() => result.current.handleSubmit(e));
    expect(e.preventDefault).toHaveBeenCalled();
    expect(result.current.errors).toEqual({ name: 'Nama wajib diisi' });
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('memanggil onSuccess dengan data dan nilai yang dikirim', async () => {
    const { result, options } = setup();
    await act(() => result.current.handleSubmit(event()));
    expect(options.submit).toHaveBeenCalledWith({ name: 'Budi' });
    expect(options.onSuccess).toHaveBeenCalledWith({ id: 1 }, { name: 'Budi' });
    expect(options.onError).not.toHaveBeenCalled();
    expect(result.current.submitting).toBe(false);
  });

  it('menyimpan error server per field dan pesan umum', async () => {
    const error = { message: 'Email sudah terdaftar', errors: { email: 'Email sudah terdaftar' } };
    const { result, options } = setup({ submit: vi.fn().mockResolvedValue({ ok: false, error }) });
    await act(() => result.current.handleSubmit(event()));
    expect(result.current.errors).toEqual({ email: 'Email sudah terdaftar' });
    expect(result.current.serverError).toBe('Email sudah terdaftar');
    expect(options.onError).toHaveBeenCalledWith(error);
  });

  it('error server tanpa detail field dan tanpa callback', async () => {
    const { result } = setup({
      submit: vi.fn().mockResolvedValue({ ok: false, error: { message: 'Server error' } }),
      onSuccess: undefined,
      onError: undefined,
    });
    await act(() => result.current.handleSubmit(event()));
    expect(result.current.errors).toEqual({});
    expect(result.current.serverError).toBe('Server error');
  });

  it('tombol kembali aktif walau submit melempar error', async () => {
    const { result } = setup({ submit: vi.fn().mockRejectedValue(new Error('putus')), onSuccess: undefined });
    await act(async () => {
      await expect(result.current.handleSubmit(event())).rejects.toThrow('putus');
    });
    expect(result.current.submitting).toBe(false);
  });
});
