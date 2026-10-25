import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import { toastSuccess } from '../../../components/alerts';
import useThunk from '../../../hooks/useThunk';
import ReportForm from '../components/ReportForm';
import { createReport } from '../states/reportsSlice';

function ReportCreatePage() {
  const run = useThunk();
  const navigate = useNavigate();

  const onSuccess = (report) => {
    toastSuccess('Laporan berhasil dibuat');
    navigate(`/reports/${report.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Buat Laporan Kerusakan"
        description="Isi detail kerusakan selengkap mungkin agar pengelola dapat menindaklanjuti dengan cepat."
      />
      <ReportForm
        submitLabel="Kirim laporan"
        onSubmit={(values) => run(createReport(values))}
        onSuccess={onSuccess}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}

export default ReportCreatePage;
