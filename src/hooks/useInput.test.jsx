import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useInput from './useInput';

describe('useInput', () => {
  it('menyimpan nilai awal dan memperbarui dari event onChange', () => {
    const { result } = renderHook(() => useInput('awal'));
    expect(result.current[0]).toBe('awal');
    act(() => result.current[1]({ target: { value: 'baru' } }));
    expect(result.current[0]).toBe('baru');
    act(() => result.current[2]('diatur'));
    expect(result.current[0]).toBe('diatur');
  });

  it('nilai default adalah string kosong', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe('');
  });
});
