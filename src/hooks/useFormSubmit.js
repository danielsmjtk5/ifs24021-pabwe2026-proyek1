import { useState } from 'react';

const hasErrors = (errors) => Object.keys(errors).length > 0;

/**
 * Alur submit formulir yang sama untuk semua form:
 * ambil nilai → validasi di front-end → kirim → tampilkan error dari server.
 *
 * - `getValues()` mengembalikan nilai yang akan divalidasi dan dikirim.
 * - `validate(values)` mengembalikan objek error per field (kosong bila valid).
 * - `submit(values)` mengembalikan hasil `useThunk`: `{ ok, data }` atau `{ ok: false, error }`.
 * - `onSuccess(data, values)` dan `onError(error)` dipanggil sesuai hasil.
 */
function useFormSubmit({ getValues, validate, submit, onSuccess, onError }) {
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    const values = getValues();
    const found = validate(values);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const outcome = await submit(values);
      if (outcome.ok) {
        onSuccess?.(outcome.data, values);
        return;
      }
      setErrors(outcome.error.errors || {});
      setServerError(outcome.error.message);
      onError?.(outcome.error);
    } finally {
      setSubmitting(false);
    }
  };

  return { errors, serverError, submitting, handleSubmit };
}

export default useFormSubmit;
