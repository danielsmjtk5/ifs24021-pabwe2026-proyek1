// SweetAlert2 dimuat saat pertama kali dibutuhkan agar tidak membebani JavaScript awal.
// Promise import disimpan supaya modul hanya diunduh sekali.
let swalModule;
const fire = (options) => {
  swalModule ??= import('sweetalert2');
  return swalModule.then(({ default: Swal }) => Swal.fire(options));
};

export function confirmDanger({ title, text, confirmText = 'Ya, hapus' }) {
  return fire({
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
  }).then((result) => result.isConfirmed);
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
