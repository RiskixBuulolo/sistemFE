import Api from './index';

export default {
  // Input Absensi Baru
  submitAbsensi(formData) {
    return Api.post('/absensi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Ambil Riwayat per Jadwal (Untuk Mode Form)
  getRiwayatAbsensi(idJadwal) {
    return Api.get(`/absensi/jadwal/${idJadwal}`);
  },

  // Ambil SEMUA Riwayat Asisten Hari Ini (Untuk Mode Tabel)
  // Anda mungkin perlu membuat endpoint ini di backend: router.get('/absensi/today', ...)
  // Atau sementara kita filter manual dari list jadwal jika backend belum siap.
  getAbsensiHariIni() {
    return Api.get('/absensi/history/today'); 
  },

  // Hapus Absensi
  deleteAbsensi(idAbsensi) {
    return Api.delete(`/absensi/${idAbsensi}`);
  }
};