import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../app/hooks';
import { IconKey, IconUserCircle } from '@tabler/icons-react';
import FormField from '../../../components/FormField';
import PageHeader from '../../../components/PageHeader';
import { alertError, toastSuccess } from '../../../components/alerts';
import useInput from '../../../hooks/useInput';
import { formatDate, initials, validatePasswordChange, validateProfile } from '../../../helpers/toolsHelper';
import { changePassword, updateProfile } from '../states/usersSlice';
import PropTypes from 'prop-types';
import { userShape } from '../../../helpers/propShapes';

function ProfileForm({ user }) {
  const dispatch = useAppDispatch();
  const [name, onNameChange] = useInput(user.name);
  const [room, onRoomChange] = useInput(user.room || '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const values = { name: name.trim(), room: room.trim() };
    const found = validateProfile(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    const result = await dispatch(updateProfile(values));
    setSaving(false);
    if (updateProfile.fulfilled.match(result)) {
      toastSuccess('Profil berhasil diperbarui');
    } else {
      setErrors(result.payload.errors || {});
      alertError(result.payload.message);
    }
  };

  return (
    <form className="card space-y-5 p-6" onSubmit={onSubmit} noValidate aria-label="Form profil">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <IconUserCircle className="h-5 w-5 text-blue-700" aria-hidden="true" />
        Informasi profil
      </h2>
      <FormField id="profile-name" label="Nama lengkap" value={name} onChange={onNameChange} error={errors.name} />
      <FormField id="profile-email" label="Email" value={user.email} disabled hint="Email tidak dapat diubah." />
      <FormField id="profile-room" label="Kamar" value={room} onChange={onRoomChange} error={errors.room} placeholder="Contoh: A-101" />
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan profil'}
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const dispatch = useAppDispatch();
  const [currentPassword, onCurrentChange, setCurrent] = useInput('');
  const [newPassword, onNewChange, setNew] = useInput('');
  const [confirmPassword, onConfirmChange, setConfirm] = useInput('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validatePasswordChange({ currentPassword, newPassword, confirmPassword });
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    const result = await dispatch(changePassword({ currentPassword, newPassword }));
    setSaving(false);
    if (changePassword.fulfilled.match(result)) {
      setCurrent('');
      setNew('');
      setConfirm('');
      toastSuccess('Password berhasil diganti');
    } else {
      setErrors(result.payload.errors || {});
      alertError(result.payload.message);
    }
  };

  return (
    <form className="card space-y-5 p-6" onSubmit={onSubmit} noValidate aria-label="Form password">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <IconKey className="h-5 w-5 text-blue-700" aria-hidden="true" />
        Ganti password
      </h2>
      <FormField id="current-password" type="password" label="Password lama" value={currentPassword} onChange={onCurrentChange} error={errors.currentPassword} autoComplete="current-password" />
      <FormField id="new-password" type="password" label="Password baru" value={newPassword} onChange={onNewChange} error={errors.newPassword} hint="Minimal 8 karakter, berisi huruf dan angka." autoComplete="new-password" />
      <FormField id="confirm-password" type="password" label="Konfirmasi password baru" value={confirmPassword} onChange={onConfirmChange} error={errors.confirmPassword} autoComplete="new-password" />
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Ganti password'}
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
          <p className="text-sm text-slate-600">{user.email}</p>
          <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
            {user.role}
          </span>
          <p className="mt-4 text-xs font-medium text-slate-600">Terdaftar sejak {formatDate(user.created_at)}</p>
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
