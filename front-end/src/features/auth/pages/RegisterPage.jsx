import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { IconAlertCircle, IconUserPlus } from '@tabler/icons-react';
import FormField from '../../../components/FormField';
import useInput from '../../../hooks/useInput';
import { validateRegister } from '../../../helpers/toolsHelper';
import { registerUser } from '../states/authSlice';

function RegisterPage() {
  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [room, onRoomChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [confirmPassword, onConfirmChange] = useInput('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    const found = validateRegister({ name, email, room, password, confirmPassword });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    const result = await dispatch(
      registerUser({ name: name.trim(), email: email.trim(), room: room.trim(), password }),
    );
    setSubmitting(false);
    if (registerUser.fulfilled.match(result)) {
      void navigate('/', { replace: true });
    } else {
      setServerError(result.payload.message);
      setErrors(result.payload.errors || {});
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Daftar akun penghuni</h2>
      <p className="mt-2 text-sm text-slate-500">Akun baru otomatis berperan sebagai penghuni asrama.</p>

      {serverError && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <FormField id="name" label="Nama lengkap" value={name} onChange={onNameChange} error={errors.name} autoComplete="name" />
        <FormField id="email" label="Email" type="email" value={email} onChange={onEmailChange} error={errors.email} autoComplete="email" />
        <FormField id="room" label="Kamar (opsional)" placeholder="Contoh: A-101" value={room} onChange={onRoomChange} error={errors.room} />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          error={errors.password}
          hint="Minimal 8 karakter, berisi huruf dan angka."
          autoComplete="new-password"
        />
        <FormField
          id="confirmPassword"
          label="Konfirmasi password"
          type="password"
          value={confirmPassword}
          onChange={onConfirmChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
          <IconUserPlus className="h-5 w-5" aria-hidden="true" />
          {submitting ? 'Mendaftarkan...' : 'Daftar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{' '}
        <Link to="/auth/login" className="font-semibold text-blue-700 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
