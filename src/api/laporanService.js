import Api from './index'; 

export default {
  // 1. Buat Header Laporan Harian (Teks saja - JSON oke)
  createLaporanHarian(data) {
    return Api.post('/laporan/harian', data);
  },

  // 2. Upload Bukti (WAJIB Tambah Header Multipart)
  uploadBuktiLaporan(formData) {
    return Api.post('/laporan/bukti', formData, {
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
  },

  // 3. Upload RPS (WAJIB Tambah Header Multipart)
  uploadRps(formData) {
    return Api.post('/laporan/rps', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 4. Upload Kontrak Kuliah (WAJIB Tambah Header Multipart)
  uploadKontrak(formData) {
    return Api.post('/laporan/kontrak', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 5. Get History
  getLaporanByJadwal(idJadwal) {
    return Api.get(`/harian/${idJadwal}`);
  },

  // 6. Get Status Dokumen
  getDokumenSemester() {
    return Api.get('/semester');
  }
};