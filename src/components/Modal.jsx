import { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import PropTypes from 'prop-types';

function Modal({ title, description, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <dialog open aria-modal="true" aria-labelledby="modal-title" className="card static m-0 w-full max-w-lg p-6 text-inherit">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
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
