import { Link } from 'react-router-dom';
import { IconLogout, IconMenu2 } from '@tabler/icons-react';
import { initials } from '../helpers/toolsHelper';
import PropTypes from 'prop-types';
import { userShape } from '../helpers/propShapes';

function Navbar({ user, onMenu, onLogout }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button type="button" className="btn-ghost p-2 lg:hidden" onClick={onMenu} aria-label="Buka menu">
        <IconMenu2 className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="hidden lg:block">
        <p className="text-sm text-slate-600">
          Selamat datang, <span className="font-semibold text-slate-800">{user.name}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/profile" className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
            {initials(user.name)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-slate-800">{user.name}</span>
            <span className="block text-xs capitalize text-slate-600">{user.role}</span>
          </span>
        </Link>
        <button type="button" className="btn-secondary px-3" onClick={onLogout}>
          <IconLogout className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  user: userShape.isRequired,
  onMenu: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
