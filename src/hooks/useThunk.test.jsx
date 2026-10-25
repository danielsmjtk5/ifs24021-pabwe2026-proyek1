import { createAsyncThunk } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { setupStore } from '../app/store';
import useThunk from './useThunk';

const succeed = createAsyncThunk('test/succeed', async (value) => value * 2);
const fail = createAsyncThunk('test/fail', async (_, { rejectWithValue }) => rejectWithValue({ message: 'Gagal' }));

function renderUseThunk() {
  const store = setupStore();
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  return renderHook(() => useThunk(), { wrapper }).result.current;
}

describe('useThunk', () => {
  it('mengembalikan { ok: true, data } saat thunk berhasil', async () => {
    const run = renderUseThunk();
    expect(await run(succeed(21))).toEqual({ ok: true, data: 42 });
  });

  it('mengembalikan { ok: false, error } saat thunk ditolak', async () => {
    const run = renderUseThunk();
    expect(await run(fail())).toEqual({ ok: false, error: { message: 'Gagal' } });
  });
});
