import { Component } from 'react';
import PropTypes from 'prop-types';
import { IconAlertTriangle } from '@tabler/icons-react';

/**
 * Menangkap error render yang tidak tertangani (termasuk gagal memuat halaman lazy)
 * agar pengguna melihat pesan yang jelas, bukan layar putih.
 * `resetKey` berganti saat pindah halaman sehingga error lama dibersihkan.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey };
    return null;
  }

  componentDidCatch(error, info) {
    console.error('Kesalahan tidak tertangani:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div role="alert" className="card flex max-w-md flex-col items-center gap-3 p-8 text-center">
          <div className="rounded-2xl bg-rose-50 p-4 text-rose-600">
            <IconAlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Terjadi kesalahan pada aplikasi</h1>
          <p className="text-sm text-slate-500">
            Halaman tidak dapat ditampilkan. Muat ulang halaman, atau periksa koneksi bila baru saja ada pembaruan aplikasi.
          </p>
          <button type="button" className="btn-primary" onClick={() => globalThis.location.reload()}>
            Muat ulang
          </button>
        </div>
      </main>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  resetKey: PropTypes.string,
};

export default ErrorBoundary;
