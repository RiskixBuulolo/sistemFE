import { ref, onMounted } from 'vue';
import dashboardService from '../../api/dashboardService';

export function useAsistenDashboard() {
    // State untuk toggle sidebar
const isSidebarOpen = ref(true);

// State Data (Sesuaikan dengan controller asisten tadi)
const stats = ref({
  jadwal_saya: 0,
  absensi_saya: 0,
  laporan_saya: 0,
  pesan_baru: 0
});


const isLoading = ref(true);
const errorMessage = ref('');

const fetchDashboardData = async () => {
  try {
    // PANGGIL SERVICE KHUSUS ASISTEN
    const response = await dashboardService.getAsistenSummary();
    stats.value = response.data.data; 
  } catch (error) {
    console.error("Gagal ambil data dashboard:", error);
    errorMessage.value = "Gagal memuat data server.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});

// Kita return variable agar bisa dipakai di template
return {
    isSidebarOpen,
    stats,
    isLoading,
    errorMessage
};
}