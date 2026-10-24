import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Dispatch yang selalu mengembalikan Promise, sehingga hasil thunk
 * (fulfilled/rejected) dapat ditunggu dengan `await`.
 */
export function useAppDispatch() {
  const dispatch = useDispatch();
  return useCallback(async (action) => dispatch(action), [dispatch]);
}
