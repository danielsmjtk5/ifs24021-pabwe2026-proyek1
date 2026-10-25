import { useEffect, useId, useRef } from 'react';
import { IconX } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Dialog yang dapat diakses keyboard:
 * - fokus pindah ke elemen pertama di dalam modal saat dibuka,
 * - Tab/Shift+Tab berputar di dalam modal (focus trap),
 * - Escape menutup modal,
 * - fokus kembali ke elemen pemicu (mis. tombol "Ubah status") saat modal ditutup.
 */
function Modal({ title, description, onClose, children }) {
  // id unik agar aria-labelledby tidak bentrok bila ada lebih dari satu modal.
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)];

    // Tombol "Tutup" selalu ada, jadi selalu ada elemen yang bisa menerima fokus.
    focusables()[0].focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const start = items[0];
      const end = items.at(-1);
      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && document.activeElement === end) {
        event.preventDefault();
        start.focus();
      }
    };

    // Halaman di belakang modal tidak ikut tergulir selama modal terbuka.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="card static m-0 w-full max-w-lg p-6 text-inherit"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button type="button" className="btn-ghost p-2" onClick={onClose} aria-label="Tutup">
            <IconX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </dialog>
    </div>
  );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default Modal;
