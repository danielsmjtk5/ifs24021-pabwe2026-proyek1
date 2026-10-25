// Normalisasi data dari API sebelum masuk ke Redux. Komponen dapat mengandalkan bentuk data
// yang lengkap (array selalu array, angka selalu angka) walau respons server tidak lengkap.

const asArray = (value) => (Array.isArray(value) ? value : []);
const asNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const asText = (value, fallback = '') => (typeof value === 'string' ? value : fallback);

const NO_PERMISSIONS = {
  canEdit: false,
  canDelete: false,
  canChangeStatus: false,
  canAddNote: false,
  nextStatuses: [],
};

export function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    name: asText(user.name, 'Pengguna'),
    email: asText(user.email),
    room: user.room ?? null,
    role: user.role === 'admin' ? 'admin' : 'penghuni',
  };
}

export function normalizeReport(report) {
  if (!report) return null;
  const permissions = { ...NO_PERMISSIONS, ...report.permissions };
  const reporter = report.reporter ?? {};
  return {
    ...report,
    title: asText(report.title, '(Tanpa judul)'),
    location: asText(report.location, '-'),
    description: asText(report.description),
    permissions: { ...permissions, nextStatuses: asArray(permissions.nextStatuses) },
    reporter: { ...reporter, name: asText(reporter.name, 'Pengguna terhapus') },
    history: asArray(report.history),
  };
}

export function normalizeReportList(data) {
  const pagination = data?.pagination;
  return {
    reports: asArray(data?.reports).map(normalizeReport),
    pagination: pagination
      ? { page: asNumber(pagination.page) || 1, totalPages: asNumber(pagination.totalPages), total: asNumber(pagination.total) }
      : null,
  };
}

export function normalizeStats(stats) {
  const byStatus = stats?.byStatus ?? {};
  return {
    total: asNumber(stats?.total),
    byStatus: {
      menunggu: asNumber(byStatus.menunggu),
      diproses: asNumber(byStatus.diproses),
      selesai: asNumber(byStatus.selesai),
      ditolak: asNumber(byStatus.ditolak),
    },
    byCategory: asArray(stats?.byCategory).map((c) => ({ category: asText(c.category), count: asNumber(c.count) })),
    recent: asArray(stats?.recent).map(normalizeReport),
  };
}
