import { ref, onMounted, onUnmounted, computed } from 'vue';
import Api from '../../api';
import Swal from 'sweetalert2';

export function useMonitoringAbsensi() {
    
    // --- STATE ---
    const isSidebarOpen = ref(true);
    const isLoading = ref(false);
    const jadwalOptions = ref([]); 
    const selectedJadwal = ref(''); 
    const absensiList = ref([]);    
    const searchQuery = ref(''); 
    
    // State Baru untuk Custom Dropdown
    const isDropdownOpen = ref(false); // Mengontrol tampilan list
    const dropdownRef = ref(null);

    const showPhotoModal = ref(false);
    const activePhotoUrl = ref('');
    const BASE_URL = 'http://localhost:5000/public/uploads/absensi/'; 

    // --- STATE PAGINATION (BARU) ---
    const currentPage = ref(1);
    const itemsPerPage = 5; // Batas data per halaman

    // --- COMPUTED ---
    const filteredJadwalOptions = computed(() => {
        if (!searchQuery.value) {
            return jadwalOptions.value;
        }
        const query = searchQuery.value.toLowerCase();
        return jadwalOptions.value.filter(item => 
            item.label.toLowerCase().includes(query)
        );
    });

    // --- COMPUTED PAGINATION (BARU) ---
    // 1. Hitung total halaman
    const totalPages = computed(() => {
        return Math.ceil(absensiList.value.length / itemsPerPage);
    });

    // 2. Data yang ditampilkan (sudah dipotong 5 biji)
    const paginatedAbsensiList = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return absensiList.value.slice(start, end);
    });

    // --- METHODS: PAGINATION (BARU) ---
    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
        }
    };

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--;
        }
    };

    const goToPage = (page) => {
        currentPage.value = page;
    };

    // --- METHODS: DROPDOWN ACTION ---
    
    // Fungsi saat user memilih item dari list
    const selectItem = (item) => {
        selectedJadwal.value = item.id;     // Simpan ID
        searchQuery.value = item.label;     // Tampilkan teks di input
        isDropdownOpen.value = false;       // Tutup dropdown
        fetchAbsensi();                     // Ambil data absensi
    };

    // Fungsi saat user mengetik
    const onSearchInput = () => {
        selectedJadwal.value = ''; // Reset pilihan jika user mengetik ulang
        isDropdownOpen.value = true; // Buka dropdown
        // [LOGIC BARU] Jika input dikosongkan manual, kembali load SEMUA data
        if (searchQuery.value === '') {
            selectedJadwal.value = ''; 
            fetchAbsensi(); 
        } else {
            // Jika sedang mengetik tapi belum memilih, reset ID seleksi sementara
            selectedJadwal.value = ''; 
        }
    };
    // [BARU] Logic Menutup Dropdown (Klik Luar & ESC)
    const handleClickOutside = (event) => {
        // Jika dropdown terbuka DAN klik terjadi DI LUAR elemen dropdownRef
        if (isDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
            isDropdownOpen.value = false;
        }
    };
    const handleKeydown = (event) => {
        // Jika tombol ESC ditekan
        if (event.key === 'Escape') {
            isDropdownOpen.value = false;
        }
    };

    // --- METHODS: API (Sama seperti sebelumnya) ---
    const fetchJadwalOptions = async () => {
        try {
            const response = await Api.get('/jadwal');
            const data = response.data.data || [];
            jadwalOptions.value = data.map(item => {
                let label = item.Kelas ? `${item.Kelas.hari_jam} - ${item.Kelas.nama_mk} (${item.Kelas.nama_kelas})` : 'Kelas Terhapus';
                if (item.DataAsisten?.User) label += ` - ${item.DataAsisten.User.nama_lengkap}`;
                return { id: item.id_jadwal, label: label };
            });
        } catch (error) {
            console.error(error);
            // Toast Error kecil di pojok kanan atas
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Gagal memuat daftar jadwal',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

// [UPDATE PENTING] Modifikasi Fetch Absensi
const fetchAbsensi = async () => {
    try {
        isLoading.value = true;
        let endpoint = '';

        if (selectedJadwal.value) {
            // CASE 1: Jika ada jadwal dipilih -> Ambil per jadwal
            endpoint = `/absensi/jadwal/${selectedJadwal.value}`;
        } else {
            // CASE 2: Jika TIDAK ada jadwal dipilih -> Ambil SEMUA
            // Pastikan route backend '/absensi' tersedia untuk mengambil semua data
            endpoint = `/absensi`; 
        }

        const response = await Api.get(endpoint);
        // Sesuaikan respons data (kadang response.data, kadang response.data.data)
        absensiList.value = response.data.data || response.data || [];
        
    } catch (error) {
        console.error("Gagal memuat absensi:", error);
        Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Gagal mengambil data absensi dari server.',
        });
    } finally {
        isLoading.value = false;
    }
};

    // ... (Helper & Modal methods sama seperti sebelumnya) ...
    const formatTime = (t) => t ? t.substring(0, 5) : '-';
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    
    const viewPhoto = (filename) => {
        if (!filename) {
            Swal.fire({ icon: 'warning', title: 'Tidak ada foto', timer: 1500, showConfirmButton: false });
            return;
        }

        const imageUrl = BASE_URL + filename;

        Swal.fire({
            title: 'Bukti Absensi',
            imageUrl: imageUrl,
            imageAlt: 'Foto Absensi',
            imageWidth: 600, // Lebar maksimal
            imageHeight: 'auto',
            showCloseButton: true,
            showConfirmButton: false, // Hilangkan tombol OK biar fokus ke foto
        });
    };
    // const closePhotoModal = () => { showPhotoModal.value = false; activePhotoUrl.value = ''; };
    const openMap = (lat, long) => { 
        if(!lat || !long) {
            Swal.fire({ icon: 'info', title: 'Lokasi tidak tersedia', timer: 1500, showConfirmButton: false });
            return;
        }
        window.open(`https://www.google.com/maps?q=${lat},${long}`, '_blank'); 
    };

// --- LIFECYCLE ---
onMounted(() => {
    // 1. Ambil list jadwal untuk dropdown
    fetchJadwalOptions(); 

    // 2. [PERBAIKAN] Panggil data absensi di sini agar muncul saat halaman dibuka
    fetchAbsensi(); 
    
    // 3. Pasang event listener
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    // [PERBAIKAN] Jangan panggil fetch di sini. 
    // onUnmounted hanya untuk bersih-bersih (remove listener)
    
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeydown);
});

    return {
        isSidebarOpen, isLoading, 
        filteredJadwalOptions, searchQuery, selectedJadwal, absensiList, dropdownRef,
        isDropdownOpen, selectItem, onSearchInput, // Return fungsi baru ini
        showPhotoModal, activePhotoUrl, fetchAbsensi,
        formatTime, formatDate, viewPhoto, openMap, 
        paginatedAbsensiList, currentPage, totalPages, nextPage, prevPage, goToPage, itemsPerPage
    };
}