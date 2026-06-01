import Api from './index';

export default {
  // Mengambil data ringkasan untuk Kepala Labor
  getKepalaSummary() {
    return Api.get('/dashboard/kepala/summary');
  },

  // Mengambil data ringkasan untuk Asisten
  getAsistenSummary() {
    return Api.get('/dashboard/asisten/summary');
  },

  // === TAMBAHKAN INI (Untuk Staff) ===
  getStaffSummary() {
    return Api.get('/dashboard/staff/summary');
  }
};