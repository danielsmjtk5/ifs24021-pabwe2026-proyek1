import { PRIORITY_STYLES, STATUS_STYLES, priorityLabel, statusLabel } from '../helpers/toolsHelper';

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset';

export function StatusBadge({ status }) {
  return (
    <span className={`${base} ${STATUS_STYLES[status] || STATUS_STYLES.menunggu}`} data-testid="status-badge">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`${base} ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.rendah}`}>
      {priorityLabel(priority)}
    </span>
  );
}
