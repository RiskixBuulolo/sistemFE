import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import jadwalService from '../../api/jadwalService';

export function useAsistenJadwal() {
    // 1. Setup Router & UI State
    const router = useRouter();
    const isSidebarOpen = ref(true);

    // 2. Data State
    const jadwalList = ref([]);
    const isLoading = ref(true);
    const errorMessage = ref('');

    // 3. Search & Pagination State
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 6;

    // 4. Helper: Format Waktu
    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5);
    };

    // 5. API Call (Fetch Data)
    const fetchJadwal = async () => {
        try {
            isLoading.value = true;
            const response = await jadwalService.getJadwalSaya();
            jadwalList.value = response.data.data || []; 
        } catch (error) {
            console.error("Gagal ambil jadwal:", error);
            errorMessage.value = "Gagal memuat jadwal. Pastikan server berjalan.";
        } finally {
            isLoading.value = false;
        }
    };

    // 6. Logic Search (Computed Filtering)
    const filteredJadwal = computed(() => {
        if (!searchQuery.value) return jadwalList.value;

        const query = searchQuery.value.toLowerCase();
        
        return jadwalList.value.filter(jadwal => {
            const namaMk = jadwal.Kelas?.nama_mk?.toLowerCase() || '';
            const namaDosen = jadwal.Kelas?.nama_dosen?.toLowerCase() || '';
            const namaKelas = jadwal.Kelas?.nama_kelas?.toLowerCase() || '';
            const hariRaw = jadwal.hari || (jadwal.Kelas?.hari_jam ? jadwal.Kelas.hari_jam.split(' ')[0] : '');
            const hari = hariRaw.toLowerCase();

            return namaMk.includes(query) || 
                   namaDosen.includes(query) || 
                   namaKelas.includes(query) || 
                   hari.includes(query);
        });
    });

    // 7. Logic Pagination (Computed)
    const totalPages = computed(() => Math.ceil(filteredJadwal.value.length / itemsPerPage));

    const paginatedJadwal = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredJadwal.value.slice(start, end);
    });

    // 8. Methods Pagination
    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
    };

    // Watcher: Reset page saat search berubah
    watch(searchQuery, () => {
        currentPage.value = 1;
    });

    // 9. Navigation Methods
    const goToAbsensi = (idJadwal) => router.push(`/absensi/${idJadwal}`);
    const goToLaporan = (idJadwal) => {
        router.push({ path: '/laporan', query: { jadwal_id: idJadwal } });
    };

    // 10. Lifecycle
    onMounted(() => {
        fetchJadwal();
    });

    // 11. Return variables untuk dipakai di Template
    return {
        isSidebarOpen,
        isLoading,
        errorMessage,
        searchQuery,
        currentPage,
        filteredJadwal,
        totalPages,
        paginatedJadwal, // Gunakan ini di v-for
        formatTime,
        nextPage,
        prevPage,
        goToAbsensi,
        goToLaporan
    };
}