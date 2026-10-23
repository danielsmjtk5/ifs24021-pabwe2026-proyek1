import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import { alertError, toastSuccess } from '../../../components/alerts';
import ReportForm from '../components/ReportForm';
import { createReport } from '../states/reportsSlice';

function ReportCreatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState({});

  const onSubmit = async (values) => {
    const result = await dispatch(createReport(values));
    if (createReport.fulfilled.match(result)) {
      toastSuccess('Laporan berhasil dibuat');
      navigate(`/reports/${result.payload.id}`);
    } else {
      setServerErrors(result.payload.errors || {});
      alertError(result.payload.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Buat Laporan Kerusakan"
        description="Isi detail kerusakan selengkap mungkin agar pengelola dapat menindaklanjuti dengan cepat."
      />
      <ReportForm submitLabel="Kirim laporan" onSubmit={onSubmit} onCancel={() => navigate(-1)} serverErrors={serverErrors} />
    </div>
  );
}

export default ReportCreatePage;
