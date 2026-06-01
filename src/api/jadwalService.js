import Api from './index';

export default {
  // Mengambil semua jadwal (Nanti backend yang filter berdasarkan ID Asisten)
  getJadwalSaya() {
    return Api.get('/jadwal');
  },

  // (Opsional) Jika nanti butuh detail 1 jadwal
  getJadwalDetail(id) {
    return Api.get(`/jadwal/${id}`);
  }
};