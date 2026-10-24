import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../app/hooks';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { confirmDanger } from '../components/alerts';
import { logoutUser } from '../features/auth/states/authSlice';

function DashboardLayout() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = async () => {
    const ok = await confirmDanger({
      title: 'Keluar dari AsramaCare?',
      text: 'Anda perlu login kembali untuk mengakses laporan.',
      confirmText: 'Ya, keluar',
    });
    if (!ok) return;
    await dispatch(logoutUser());
    navigate('/auth/login', { replace: true });
  };

  // Saat logout atau sesi berakhir, user menjadi null sebelum halaman berpindah.
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Sidebar user={user} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-72">
        <Navbar user={user} onMenu={() => setMenuOpen(true)} onLogout={onLogout} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
