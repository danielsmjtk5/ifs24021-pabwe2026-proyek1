import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import { ErrorState, LoadingState } from '../../../components/States';
import { alertError, toastSuccess } from '../../../components/alerts';
import ReportForm from '../components/ReportForm';
import { fetchReport, updateReport } from '../states/reportsSlice';

function ReportEditPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { item, status, error } = useSelector((state) => state.reports.detail);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    dispatch(fetchReport(id));
  }, [dispatch, id]);

  if (status === 'failed') return <ErrorState message={error} onRetry={() => dispatch(fetchReport(id))} />;
  if (!item || String(item.id) !== id) return <LoadingState />;
  if (!item.permissions.canEdit) return <Navigate to={`/reports/${id}`} replace />;

  const onSubmit = async (values) => {
    const result = await dispatch(updateReport({ id, values }));
    if (updateReport.fulfilled.match(result)) {
      toastSuccess('Laporan berhasil diperbarui');
      navigate(`/reports/${id}`);
    } else {
      setServerErrors(result.payload.errors || {});
      alertError(result.payload.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ubah Laporan" description="Laporan hanya dapat diubah selama statusnya masih menunggu." />
      <ReportForm
        initialValues={item}
        submitLabel="Simpan perubahan"
        onSubmit={onSubmit}
        onCancel={() => navigate(`/reports/${id}`)}
        serverErrors={serverErrors}
      />
    </div>
  );
}

export default ReportEditPage;
