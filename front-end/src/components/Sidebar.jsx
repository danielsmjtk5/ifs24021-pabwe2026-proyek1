import { NavLink } from 'react-router-dom';
import {
  IconClipboardList,
  IconFilePlus,
  IconLayoutDashboard,
  IconShieldCog,
  IconUser,
  IconUserCircle,
  IconX,
} from '@tabler/icons-react';
import Brand from './Brand';

export function navItemsFor(role) {
  const items = [
    { to: '/', label: 'Dashboard', icon: IconLayoutDashboard, end: true },
    { to: '/reports', label: 'Semua Laporan', icon: IconClipboardList, end: true },
  ];
  if (role === 'admin') {
    items.push({ to: '/admin/reports', label: 'Kelola Laporan', icon: IconShieldCog });
  } else {
    items.push({ to: '/my-reports', label: 'Laporan Saya', icon: IconUser });
    items.push({ to: '/reports/new', label: 'Buat Laporan', icon: IconFilePlus });
  }
  items.push({ to: '/profile', label: 'Profil', icon: IconUserCircle });
  return items;
}

function Sidebar({ user, open, onClose }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
      isActive ? 'bg-white/10 text-white shadow-inner' : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-backdrop"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-gradient-to-b from-navy-950 to-navy-900 px-5 py-6 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi utama"
      >
        <div className="mb-8 flex items-center justify-between">
          <Brand light />
          <button type="button" className="rounded-lg p-1.5 text-blue-100 lg:hidden" onClick={onClose} aria-label="Tutup menu">
            <IconX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-blue-300/70">Menu</p>
        <nav className="flex flex-1 flex-col gap-1">
          {navItemsFor(user.role).map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-2xl bg-white/5 p-4 text-sm text-blue-100">
          <p className="font-semibold text-white">Butuh bantuan darurat?</p>
          <p className="mt-1 text-xs leading-relaxed text-blue-200/80">
            Untuk kebakaran atau korsleting, segera hubungi pengelola asrama selain membuat laporan.
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
