import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconAlertCircle, IconLogin2 } from '@tabler/icons-react';
import FormField from '../../../components/FormField';
import useFormSubmit from '../../../hooks/useFormSubmit';
import useInput from '../../../hooks/useInput';
import useThunk from '../../../hooks/useThunk';
import { validateLogin } from '../../../helpers/toolsHelper';
import { loginUser } from '../states/authSlice';

function LoginPage() {
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const sessionExpired = useSelector((state) => state.auth.sessionExpired);
  const run = useThunk();
  const navigate = useNavigate();
  const location = useLocation();

  const { errors, serverError, submitting, handleSubmit } = useFormSubmit({
    getValues: () => ({ email: email.trim(), password }),
    validate: validateLogin,
    submit: (values) => run(loginUser(values)),
    onSuccess: () => navigate(location.state?.from || '/', { replace: true }),
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Masuk ke akun</h1>
      <p className="mt-2 text-sm text-slate-500">Gunakan email dan password yang terdaftar di asrama.</p>

      {sessionExpired && (
        <output className="mt-6 block rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sesi Anda telah berakhir. Silakan login kembali.
        </output>
      )}
      {serverError && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        {/* id username/password/btn-submit dipakai audit otomatis Delcom untuk login. */}
        <FormField
          id="username"
          name="username"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nama@asrama.ac.id"
          value={email}
          onChange={onEmailChange}
          error={errors.email}
        />
        <FormField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          value={password}
          onChange={onPasswordChange}
          error={errors.password}
        />
        <button id="btn-submit" type="submit" className="btn-primary w-full py-3" disabled={submitting}>
          <IconLogin2 className="h-5 w-5" aria-hidden="true" />
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Penghuni baru?{' '}
        <Link to="/auth/register" className="font-semibold text-blue-700 hover:underline">
          Daftar akun penghuni
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
