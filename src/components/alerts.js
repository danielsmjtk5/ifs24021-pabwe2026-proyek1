// SweetAlert2 dimuat saat pertama kali dibutuhkan agar tidak membebani JavaScript awal.
// Promise import disimpan supaya modul hanya diunduh sekali.
let swalModule;

// Hasil pengganti bila SweetAlert2 gagal diunduh (mis. koneksi terputus atau versi aplikasi
// sudah berganti): dialog dianggap dibatalkan sehingga aksi berbahaya tidak pernah berjalan.
const DISMISSED = { isConfirmed: false, isDismissed: true };

const loadSwal = () => {
  swalModule ??= import('sweetalert2').catch((error) => {
    swalModule = undefined; // izinkan percobaan ulang pada pemanggilan berikutnya
    throw error;
  });
  return swalModule;
};

export async function fire(options) {
  try {
    const { default: Swal } = await loadSwal();
    return await Swal.fire(options);
  } catch (error) {
    console.error('Dialog tidak dapat ditampilkan:', error);
    return DISMISSED;
  }
}

export async function confirmDanger({ title, text, confirmText = 'Ya, hapus' }) {
  const result = await fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}

// Notifikasi tidak perlu ditunggu oleh pemanggil.
export function toastSuccess(title) {
  return fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

export function alertError(text) {
  return fire({
    icon: 'error',
    title: 'Gagal',
    text,
    confirmButtonColor: '#1d4ed8',
  });
}
