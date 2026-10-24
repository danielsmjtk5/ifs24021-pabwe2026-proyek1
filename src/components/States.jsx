import { IconAlertTriangle, IconInbox, IconLoader2 } from '@tabler/icons-react';
import PropTypes from 'prop-types';

export function LoadingState({ message = 'Memuat data...' }) {
  return (
    <output className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <IconLoader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </output>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
        <IconInbox className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-2xl bg-rose-50 p-4 text-rose-600">
        <IconAlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-slate-800">Terjadi kesalahan</h2>
      <p className="max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

LoadingState.propTypes = { message: PropTypes.string };
EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};
ErrorState.propTypes = { message: PropTypes.string.isRequired, onRetry: PropTypes.func };
