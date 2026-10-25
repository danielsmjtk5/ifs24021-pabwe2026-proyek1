import { useSelector } from 'react-redux';
import { IconKey, IconUserCircle } from '@tabler/icons-react';
import FormField from '../../../components/FormField';
import PageHeader from '../../../components/PageHeader';
import { alertError, toastSuccess } from '../../../components/alerts';
import useFormSubmit from '../../../hooks/useFormSubmit';
import useInput from '../../../hooks/useInput';
import useThunk from '../../../hooks/useThunk';
import { formatDate, initials, validatePasswordChange, validateProfile } from '../../../helpers/toolsHelper';
import { changePassword, updateProfile } from '../states/usersSlice';
import { userShape } from '../../../helpers/propShapes';

function ProfileForm({ user }) {
  const run = useThunk();
  const [name, onNameChange] = useInput(user.name);
  const [room, onRoomChange] = useInput(user.room || '');
  const { errors, submitting, handleSubmit } = useFormSubmit({
    getValues: () => ({ name: name.trim(), room: room.trim() }),
    validate: validateProfile,
    submit: (values) => run(updateProfile(values)),
    onSuccess: () => toastSuccess('Profil berhasil diperbarui'),
    onError: (error) => alertError(error.message),
  });

  return (
    <form className="card space-y-5 p-6" onSubmit={handleSubmit} noValidate aria-label="Form profil">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <IconUserCircle className="h-5 w-5 text-blue-700" aria-hidden="true" />
        Informasi profil
      </h2>
      <FormField label="Nama lengkap" value={name} onChange={onNameChange} error={errors.name} />
      <FormField label="Email" value={user.email} disabled hint="Email tidak dapat diubah." />
      <FormField label="Kamar" value={room} onChange={onRoomChange} error={errors.room} placeholder="Contoh: A-101" />
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan profil'}
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const run = useThunk();
  const [currentPassword, onCurrentChange, setCurrent] = useInput('');
  const [newPassword, onNewChange, setNew] = useInput('');
  const [confirmPassword, onConfirmChange, setConfirm] = useInput('');
  const { errors, submitting, handleSubmit } = useFormSubmit({
    getValues: () => ({ currentPassword, newPassword, confirmPassword }),
    validate: validatePasswordChange,
    submit: (values) => run(changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })),
    onSuccess: () => {
      setCurrent('');
      setNew('');
      setConfirm('');
      toastSuccess('Password berhasil diganti');
    },
    onError: (error) => alertError(error.message),
  });

  return (
    <form className="card space-y-5 p-6" onSubmit={handleSubmit} noValidate aria-label="Form password">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <IconKey className="h-5 w-5 text-blue-700" aria-hidden="true" />
        Ganti password
      </h2>
      <FormField type="password" label="Password lama" value={currentPassword} onChange={onCurrentChange} error={errors.currentPassword} autoComplete="current-password" />
      <FormField type="password" label="Password baru" value={newPassword} onChange={onNewChange} error={errors.newPassword} hint="Minimal 8 karakter, berisi huruf dan angka." autoComplete="new-password" />
      <FormField type="password" label="Konfirmasi password baru" value={confirmPassword} onChange={onConfirmChange} error={errors.confirmPassword} autoComplete="new-password" />
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Ganti password'}
        </button>
      </div>
    </form>
  );
}

function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  return (
    <>
      <PageHeader title="Profil" description="Kelola informasi akun Anda." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center p-6 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-extrabold text-blue-800">
            {initials(user.name)}
          </span>
          <p className="mt-4 text-lg font-bold text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
            {user.role}
          </span>
          <p className="mt-4 text-xs text-slate-500">Terdaftar sejak {formatDate(user.created_at)}</p>
        </div>
        <div className="space-y-6 lg:col-span-2">
          <ProfileForm user={user} />
          <PasswordForm />
        </div>
      </div>
    </>
  );
}

ProfileForm.propTypes = { user: userShape.isRequired };

export default ProfilePage;
