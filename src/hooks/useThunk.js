import { useCallback } from 'react';
import { useAppDispatch } from '../app/hooks';

/**
 * Menjalankan async thunk dan mengubah hasilnya menjadi bentuk yang seragam:
 * `{ ok: true, data }` saat berhasil atau `{ ok: false, error }` saat gagal.
 * Komponen tidak perlu lagi memeriksa `thunk.fulfilled.match(result)` satu per satu.
 */
function useThunk() {
  const dispatch = useAppDispatch();
  return useCallback(
    async (action) => {
      const result = await dispatch(action);
      if (result.meta.requestStatus === 'fulfilled') return { ok: true, data: result.payload };
      return { ok: false, error: result.payload };
    },
    [dispatch],
  );
}

export default useThunk;
