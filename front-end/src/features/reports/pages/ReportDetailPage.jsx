import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  IconArrowLeft,
  IconCalendar,
  IconCategory,
  IconEdit,
  IconMapPin,
  IconMessagePlus,
  IconProgress,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { PriorityBadge, StatusBadge } from '../../../components/Badges';
import { ErrorState, LoadingState } from '../../../components/States';
import { alertError, confirmDanger, toastSuccess } from '../../../components/alerts';
import { categoryLabel, formatDate } from '../../../helpers/toolsHelper';
import StatusTimeline from '../components/StatusTimeline';
import NoteModal from '../modals/NoteModal';
import StatusChangeModal from '../modals/StatusChangeModal';
import { addReportNote, changeReportStatus, deleteReport, fetchReport } from '../states/reportsSlice';

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="text-sm font-semibold text-slate-800">{children}</div>
      </div>
    </div>
  );
}

function ReportDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { item: report, status, error } = useSelector((state) => state.reports.detail);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchReport(id));
  }, [dispatch, id]);

  if (status === 'failed') {
    return (
      <div className="card">
        <ErrorState message={error} onRetry={() => dispatch(fetchReport(id))} />
      </div>
    );
  }
  if (!report || String(report.id) !== id) return <LoadingState message="Memuat detail laporan..." />;

  const { permissions } = report;

  const onDelete = async () => {
    const ok = await confirmDanger({
      title: 'Hapus laporan ini?',
      text: `"${report.title}" beserta riwayatnya akan dihapus permanen.`,
    });
    if (!ok) return;
    const result = await dispatch(deleteReport(report.id));
    if (deleteReport.fulfilled.match(result)) {
      toastSuccess('Laporan berhasil dihapus');
      void navigate(user.role === 'admin' ? '/admin/reports' : '/my-reports', { replace: true });
    } else {
      alertError(result.payload.message);
    }
  };

  const submitWith = (thunk, message) => async (values) => {
    const result = await dispatch(thunk({ id: report.id, ...values }));
    if (thunk.fulfilled.match(result)) {
      toastSuccess(message);
      return true;
    }
    alertError(result.payload.message);
    return false;
  };

  return (
    <>
      <button type="button" className="btn-ghost mb-4 -ml-2" onClick={() => navigate(-1)}>
        <IconArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-400">Laporan #{report.id}</span>
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{report.title}</h1>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InfoRow icon={IconCategory} label="Kategori">
              {categoryLabel(report.category)}
            </InfoRow>
            <InfoRow icon={IconMapPin} label="Lokasi">
              {report.location}
            </InfoRow>
            <InfoRow icon={IconCalendar} label="Dibuat">
              {formatDate(report.created_at, true)}
            </InfoRow>
            <InfoRow icon={IconCalendar} label="Terakhir diperbarui">
              {formatDate(report.updated_at, true)}
            </InfoRow>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="text-sm font-bold text-slate-900">Deskripsi kerusakan</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{report.description}</p>
          </div>

          {(permissions.canEdit || permissions.canDelete) && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
              {permissions.canEdit && (
                <Link to={`/reports/${report.id}/edit`} className="btn-secondary">
                  <IconEdit className="h-4 w-4" aria-hidden="true" />
                  Ubah laporan
                </Link>
              )}
              {permissions.canDelete && (
                <button type="button" className="btn-danger" onClick={onDelete}>
                  <IconTrash className="h-4 w-4" aria-hidden="true" />
                  Hapus laporan
                </button>
              )}
            </div>
          )}
          {!permissions.canEdit && report.reporter.id === user.id && (
            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Laporan yang sudah ditangani admin tidak dapat diubah atau dihapus.
            </p>
          )}
        </article>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">Pelapor</h2>
            <div className="mt-4 space-y-4">
              <InfoRow icon={IconUser} label="Nama">
                {report.reporter.name}
              </InfoRow>
              {report.reporter.email && (
                <InfoRow icon={IconUser} label="Kontak">
                  {report.reporter.email}
                  {report.reporter.room && <span className="block font-normal text-slate-500">Kamar {report.reporter.room}</span>}
                </InfoRow>
              )}
            </div>
          </div>

          {(permissions.canChangeStatus || permissions.canAddNote) && (
            <div className="card space-y-2 p-6">
              <h2 className="mb-2 text-sm font-bold text-slate-900">Tindakan admin</h2>
              {permissions.canChangeStatus && (
                <button type="button" className="btn-primary w-full" onClick={() => setModal('status')}>
                  <IconProgress className="h-4 w-4" aria-hidden="true" />
                  Ubah status
                </button>
              )}
              <button type="button" className="btn-secondary w-full" onClick={() => setModal('note')}>
                <IconMessagePlus className="h-4 w-4" aria-hidden="true" />
                Tambah catatan
              </button>
            </div>
          )}

          <div className="card p-6">
            <h2 className="mb-5 text-sm font-bold text-slate-900">Riwayat penanganan</h2>
            <StatusTimeline history={report.history} />
          </div>
        </aside>
      </div>

      {modal === 'status' && (
        <StatusChangeModal
          report={report}
          onClose={() => setModal(null)}
          onSubmit={submitWith(changeReportStatus, 'Status laporan diperbarui')}
        />
      )}
      {modal === 'note' && (
        <NoteModal onClose={() => setModal(null)} onSubmit={submitWith(addReportNote, 'Catatan ditambahkan')} />
      )}
    </>
  );
}

export default ReportDetailPage;
