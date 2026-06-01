import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import absensiService from '../../api/absensiService';
import jadwalService from '../../api/jadwalService';
import Swal from 'sweetalert2';

export function useAsistenAbsensi() {
    // === CONFIGURATION ===
    const route = useRoute();
    const router = useRouter();
    const isSidebarOpen = ref(true);

    // Deteksi Mode
    const isInputMode = computed(() => !!route.params.id);
    const idJadwalInput = computed(() => route.params.id);

    // =========================================================
    // STATE MANAGEMENT
    // =========================================================
    const jadwalDanAbsensi = ref([]);
    const isLoadingTable = ref(false);

    // Pagination & Search
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 5;

    // Modal Riwayat
    const isHistoryModalOpen = ref(false);
    const selectedHistoryList = ref([]);
    const selectedMatkulName = ref('');

    // Form Input
    const form = ref({ status: 'Hadir', latitude: null, longitude: null, foto: null });
    const isLoadingForm = ref(false);
    const locationError = ref('');
    
    // Template Refs (Kamera)
    const videoRef = ref(null);
    const canvasRef = ref(null);
    const photoPreview = ref(null);
    const isCameraActive = ref(false);

    // =========================================================
    // LOGIC SEARCH & PAGINATION
    // =========================================================
    const filteredJadwal = computed(() => {
        if (!searchQuery.value) return jadwalDanAbsensi.value;
        const query = searchQuery.value.toLowerCase();
        
        return jadwalDanAbsensi.value.filter(item => {
            const mk = item.Kelas?.nama_mk?.toLowerCase() || '';
            const dosen = item.Kelas?.nama_dosen?.toLowerCase() || '';
            const hariRaw = item.hari || (item.Kelas?.hari_jam ? item.Kelas.hari_jam.split(' ')[0] : '');
            const hari = hariRaw.toLowerCase();
            return mk.includes(query) || dosen.includes(query) || hari.includes(query);
        });
    });

    const totalPages = computed(() => Math.ceil(filteredJadwal.value.length / itemsPerPage));

    const paginatedJadwal = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredJadwal.value.slice(start, end);
    });

    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
    const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

    watch(searchQuery, () => { currentPage.value = 1; });

    // =========================================================
    // LOGIC A: MODE TABEL
    // =========================================================
    const canEditOrDelete = (waktuAbsenStr, tanggalStr) => {
        if (!waktuAbsenStr || !tanggalStr) return false;
        const absenTime = new Date(`${tanggalStr}T${waktuAbsenStr}`);
        const diffMins = Math.round((new Date() - absenTime) / 60000);
        return diffMins <= 10;
    };

    const fetchTableData = async () => {
        if (isInputMode.value) return; 
        try {
            isLoadingTable.value = true;
            const resJadwal = await jadwalService.getJadwalSaya();
            const jadwalList = resJadwal.data.data || [];
            const combinedData = [];

            for (const jadwal of jadwalList) {
                const resRiwayat = await absensiService.getRiwayatAbsensi(jadwal.id_jadwal);
                const history = (resRiwayat.data || []).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                const today = new Date().toISOString().slice(0, 10);
                const absenHariIni = history.find(h => h.tanggal === today);

                combinedData.push({
                    ...jadwal,
                    absenData: absenHariIni || null,
                    fullHistory: history
                });
            }
            jadwalDanAbsensi.value = combinedData;
        } catch (error) {
            console.error("Gagal memuat data tabel:", error);
        } finally {
            isLoadingTable.value = false;
        }
    };

    const gotoInput = (id) => { router.push(`/absensi/${id}`); };

    const deleteAbsen = async (idAbsensi) => {
        const result = await Swal.fire({
            title: 'Hapus Absensi?',
            text: "Data foto dan kehadiran hari ini akan dihapus. Anda harus absen ulang.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus'
        });

        if (result.isConfirmed) {
            try {
                await absensiService.deleteAbsensi(idAbsensi);
                Swal.fire('Terhapus!', 'Data absensi berhasil dihapus.', 'success');
                fetchTableData();
            } catch (error) {
                Swal.fire('Gagal', 'Gagal menghapus data. Coba lagi.', 'error');
            }
        }
    };

    const openHistoryModal = (item) => {
        selectedMatkulName.value = item.Kelas?.nama_mk || 'Mata Kuliah';
        selectedHistoryList.value = item.fullHistory || [];
        isHistoryModalOpen.value = true;
    };

    const closeHistoryModal = () => {
        isHistoryModalOpen.value = false;
        selectedHistoryList.value = [];
    };

    // =========================================================
    // LOGIC B: MODE FORM (KAMERA & GPS)
    // =========================================================
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.value) videoRef.value.srcObject = stream;
            isCameraActive.value = true;
        } catch (err) {
            Swal.fire('Error', 'Gagal akses kamera. Pastikan izin diberikan.', 'error');
        }
    };

    const stopCamera = () => {
        if (videoRef.value && videoRef.value.srcObject) {
            videoRef.value.srcObject.getTracks().forEach(t => t.stop());
            videoRef.value.srcObject = null;
        }
        isCameraActive.value = false;
    };

    const takePhoto = () => {
        if (!videoRef.value || !canvasRef.value) return;
        const ctx = canvasRef.value.getContext('2d');
        canvasRef.value.width = videoRef.value.videoWidth;
        canvasRef.value.height = videoRef.value.videoHeight;
        ctx.drawImage(videoRef.value, 0, 0);
        canvasRef.value.toBlob(blob => {
            form.value.foto = new File([blob], "absen.jpg", { type: "image/jpeg" });
            photoPreview.value = URL.createObjectURL(blob);
            stopCamera();
        }, 'image/jpeg', 0.8);
    };

    const retakePhoto = () => {
        form.value.foto = null;
        photoPreview.value = null;
        startCamera();
    };

    const getLocation = () => {
        locationError.value = '';
        if (!navigator.geolocation) return locationError.value = "Browser tidak support GPS";
        navigator.geolocation.getCurrentPosition(
            pos => { form.value.latitude = pos.coords.latitude; form.value.longitude = pos.coords.longitude; },
            err => { locationError.value = "GPS Gagal. Pastikan GPS aktif dan izin diberikan."; }
        );
    };

    const submitAbsensi = async () => {
        if (!form.value.foto || !form.value.latitude) return Swal.fire('Warning', 'Foto dan Lokasi wajib diisi', 'warning');
        try {
            isLoadingForm.value = true;
            const formData = new FormData();
            formData.append('id_jadwal', idJadwalInput.value);
            formData.append('status', form.value.status);
            formData.append('latitude', form.value.latitude);
            formData.append('longitude', form.value.longitude);
            formData.append('foto_absensi', form.value.foto);

            const res = await absensiService.submitAbsensi(formData);
            Swal.fire('Sukses', res.data.message, 'success').then(() => {
                router.push('/absensi');
            });
        } catch (error) {
            Swal.fire('Gagal', error.response?.data?.message || 'Error', 'error');
        } finally {
            isLoadingForm.value = false;
        }
    };

    // =========================================================
    // LIFECYCLE
    // =========================================================
    watch(() => route.params.id, (newId) => {
        if (newId) {
            stopCamera(); 
            form.value.foto = null;
            photoPreview.value = null;
            getLocation();
            startCamera();
        } else {
            stopCamera();
            fetchTableData();
        }
    });

    onMounted(() => {
        if (isInputMode.value) {
            getLocation();
            startCamera();
        } else {
            fetchTableData();
        }
    });

    onUnmounted(() => {
        stopCamera();
    });

    // RETURN SEMUA VARIABLE/FUNCTION YG AKAN DIPAKAI DI TEMPLATE
    return {
        // Router & UI
        router,
        isSidebarOpen,
        isInputMode,
        // State Table
        searchQuery,
        isLoadingTable,
        paginatedJadwal,
        totalPages,
        currentPage,
        // State Form & Modal
        form,
        isLoadingForm,
        locationError,
        isHistoryModalOpen,
        selectedMatkulName,
        selectedHistoryList,
        photoPreview,
        // Refs
        videoRef,
        canvasRef,
        // Methods
        nextPage,
        prevPage,
        gotoInput,
        deleteAbsen,
        canEditOrDelete,
        openHistoryModal,
        closeHistoryModal,
        takePhoto,
        retakePhoto,
        submitAbsensi
    };
}