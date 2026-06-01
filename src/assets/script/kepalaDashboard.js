import { ref, onMounted } from 'vue';
import dashboardService from '../../api/dashboardService';

export function useKepalaDashboard() {
    
    // === STATE ===
    const isSidebarOpen = ref(true);
    const isLoading = ref(true);
    const errorMessage = ref('');
    
    // Initial State untuk data dashboard
    const stats = ref({
        total_kegiatan: 0,
        total_rps: 0,
        total_kontrak: 0,
        total_absensi: 0,
        total_jadwal: 0,
        total_kelas: 0,
        total_absmon: 0,
        staff_aktif: 0,
        asisten_aktif: 0,
        pesan_baru: 0
    });

    // === METHODS ===
    const fetchDashboardData = async () => {
        try {
            // Reset loading state jika dipanggil ulang
            // isLoading.value = true; 
            
            const response = await dashboardService.getKepalaSummary();
            
            // Pastikan mapping data sesuai struktur response backend
            stats.value = response.data.data; 
        } catch (error) {
            console.error("Gagal ambil data dashboard:", error);
            errorMessage.value = "Gagal memuat data server.";
        } finally {
            isLoading.value = false;
        }
    };

    // === LIFECYCLE ===
    onMounted(() => {
        fetchDashboardData();
    });

    // === RETURN ===
    // Kembalikan semua variabel yang dibutuhkan oleh Template HTML
    return {
        isSidebarOpen,
        stats,
        isLoading,
        errorMessage,
        fetchDashboardData // Opsional: jika butuh tombol 'Refresh' manual
    };
}