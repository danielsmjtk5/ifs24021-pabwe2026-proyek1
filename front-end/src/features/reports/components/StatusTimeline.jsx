import { IconMessage2, IconProgressCheck } from '@tabler/icons-react';
import { StatusBadge } from '../../../components/Badges';
import { formatDate } from '../../../helpers/toolsHelper';

function StatusTimeline({ history }) {
  return (
    <ol className="relative space-y-5 border-l-2 border-slate-200 pl-6">
      {history.map((item) => {
        const isNote = item.old_status === item.new_status;
        const Icon = isNote ? IconMessage2 : IconProgressCheck;
        return (
          <li key={item.id} className="relative">
            <span className="absolute top-0.5 -left-[35px] flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-700 ring-2 ring-blue-100">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {isNote ? (
                <span className="text-sm font-semibold text-slate-800">Catatan tindak lanjut</span>
              ) : (
                <StatusBadge status={item.new_status} />
              )}
              <span className="text-xs text-slate-500">{formatDate(item.created_at, true)}</span>
            </div>
            {item.note && <p className="mt-1.5 text-sm text-slate-700">{item.note}</p>}
            <p className="mt-1 text-xs text-slate-500">
              oleh {item.changed_by_name || 'Pengguna terhapus'}
              {item.changed_by_role === 'admin' && ' (Admin)'}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export default StatusTimeline;
