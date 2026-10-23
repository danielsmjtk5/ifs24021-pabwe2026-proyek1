import { Link } from 'react-router-dom';
import { IconCalendar, IconChevronRight, IconMapPin } from '@tabler/icons-react';
import { PriorityBadge, StatusBadge } from '../../../components/Badges';
import { categoryLabel, formatDate } from '../../../helpers/toolsHelper';

function ReportList({ reports, showReporter = false }) {
  return (
    <ul className="divide-y divide-slate-100">
      {reports.map((report) => (
        <li key={report.id}>
          <Link
            to={`/reports/${report.id}`}
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">#{report.id}</span>
                <StatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </div>
              <p className="mt-1.5 truncate font-semibold text-slate-900">{report.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{categoryLabel(report.category)}</span>
                <span className="flex items-center gap-1">
                  <IconMapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {report.location}
                </span>
                <span className="flex items-center gap-1">
                  <IconCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(report.created_at)}
                </span>
                {showReporter && (
                  <span>
                    Pelapor: <span className="font-medium text-slate-700">{report.reporter.name}</span>
                    {report.reporter.room && ` · ${report.reporter.room}`}
                  </span>
                )}
              </div>
            </div>
            <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default ReportList;
