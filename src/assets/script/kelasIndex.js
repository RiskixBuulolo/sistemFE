import { ref, onMounted, computed, watch } from 'vue';
import Api from '../../api'; // Pastikan path import Api benar sesuai struktur folder Anda
import Swal from 'sweetalert2';

export function useKelasIndex() {
    // ==========================================
    // 1. STATE MANAGEMENT (DATA)
    // ==========================================
    const isSidebarOpen = ref(true);
    const kelasList = ref([]);
    const isLoading = ref(true);
    const showModal = ref(false);
    const isEditMode = ref(false);

    // State Pagination & Search
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 5; 

    // Referensi Element Input File
    const fileInput = ref(null);

    // Form Object
    const form = ref({
        id_kelas: null,
        kode_mk: '',
        nama_mk: '',
        nama_dosen: '',
        nama_kelas: '',
        semester: '',
        sks: 1,
        hari_jam: '',
        ruangan: ''
    });

    // ==========================================
    // 2. COMPUTED PROPERTIES (LOGIC OTOMATIS)
    // ==========================================
    
    // Filter Data berdasarkan Search
    const filteredKelas = computed(() => {
        if (!searchQuery.value) return kelasList.value;
        
        const query = searchQuery.value.toLowerCase();
        
        return kelasList.value.filter(item => {
            const mk = item.nama_mk ? item.nama_mk.toLowerCase() : '';
            const kode = item.kode_mk ? item.kode_mk.toLowerCase() : '';
            const kelas = item.nama_kelas ? item.nama_kelas.toLowerCase() : '';
            const ruang = item.ruangan ? item.ruangan.toLowerCase() : '';
            const dosen = item.nama_dosen ? item.nama_dosen.toLowerCase() : '';
            
            return mk.includes(query) || 
                   kode.includes(query) || 
                   kelas.includes(query) || 
                   ruang.includes(query) || 
                   dosen.includes(query);
        });
    });

    // Pagination Logic
    const paginatedKelas = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredKelas.value.slice(start, end);
    });

    const totalPages = computed(() => {
        return Math.ceil(filteredKelas.value.length / itemsPerPage);
    });

    // ==========================================
    // 3. WATCHERS
    // ==========================================
    watch(searchQuery, () => {
        currentPage.value = 1; // Reset ke hal 1 saat mencari
    });

    // ==========================================
    // 4. METHODS / FUNCTIONS (AKSI)
    // ==========================================

    const fetchKelas = async () => {
        try {
            isLoading.value = true;
            const response = await Api.get('/kelas');
            kelasList.value = response.data.data || [];
        } catch (error) {
            console.error(error);
            // Error Fetch cukup pakai Toast kecil atau Swal Error
            Swal.fire({
                icon: 'error',
                title: 'Koneksi Gagal',
                text: 'Tidak dapat memuat data kelas.',
            });
        } finally {
            isLoading.value = false;
        }
    };

    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
    };

    // --- Handling File Upload ---
    const triggerFileInput = () => {
        if(fileInput.value) fileInput.value.click();
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file_excel', file);
        
        // Loading Swal saat upload
        Swal.fire({
            title: 'Sedang Mengunggah...',
            text: 'Mohon tunggu, sedang memproses data excel.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            await Api.post('/kelas/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchKelas(); // Refresh data

            // Sukses Upload
            Swal.fire({
                icon: 'success',
                title: 'Import Berhasil!',
                text: 'Data kelas berhasil ditambahkan dari Excel.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Pastikan format Excel sesuai.';
            
            // Gagal Upload
            Swal.fire({
                icon: 'error',
                title: 'Import Gagal',
                text: msg,
            });
        } finally {
            event.target.value = '';
        }
    };

    // --- Modal & CRUD Handlers ---
    const openModal = (data = null) => {
        if (data) {
            isEditMode.value = true;
            // Copy data agar reaktifitas aman
            form.value = { ...data };
        } else {
            isEditMode.value = false;
            // Reset Form
            form.value = { 
                id_kelas: null, kode_mk: '', nama_mk: '', nama_dosen: '', 
                nama_kelas: '', semester: '', sks: 1, 
                hari_jam: '', ruangan: '' 
            };
        }
        showModal.value = true;
    };

    const handleSubmit = async () => {
        // Loading Swal saat simpan
        Swal.fire({
            title: 'Menyimpan Data...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        try {
            if (isEditMode.value) {
                await Api.put(`/kelas/${form.value.id_kelas}`, form.value);
            } else {
                await Api.post('/kelas', form.value);
            }

            showModal.value = false;
            await fetchKelas(); 

            // Sukses Simpan
            Swal.fire({
                icon: 'success',
                title: 'Tersimpan!',
                text: `Data kelas berhasil ${isEditMode.value ? 'diperbarui' : 'ditambahkan'}.`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Terjadi kesalahan server.';
            
            // Gagal Simpan
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan',
                text: msg,
            });
        }
    };

    const handleDelete = (id) => {
        // Konfirmasi Hapus yang Bagus
        Swal.fire({
            title: 'Hapus Kelas?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Merah untuk bahaya
            cancelButtonColor: '#3085d6', // Biru untuk batal
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                
                // Loading saat menghapus
                Swal.fire({
                    title: 'Menghapus...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                try {
                    await Api.delete(`/kelas/${id}`);
                    await fetchKelas();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus!',
                        text: 'Data kelas telah dihapus.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) { 
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: 'Tidak dapat menghapus data ini.',
                    });
                }
            }
        });
    };

    const handleDeleteAll = () => {
        Swal.fire({
            title: 'HAPUS SEMUA KELAS?',
            text: "PERINGATAN! Semua data kelas akan dihapus permanen. Jadwal, asisten, dan laporan terkait kemungkinan besar akan ikut terhapus. Tindakan ini TIDAK BISA dibatalkan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Merah peringatan
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'YA, HAPUS SEMUA!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                
                Swal.fire({
                    title: 'Menghapus Semua Kelas...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                try {
                    // Tembak ke endpoint /clear-all yang baru dibuat
                    await Api.delete('/kelas/clear-all');
                    await fetchKelas(); // Refresh tabel
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Reset Berhasil!',
                        text: 'Seluruh data kelas telah dikosongkan.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (error) { 
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: 'Terjadi kesalahan saat menghapus semua data.',
                    });
                }
            }
        });
    };

    // ==========================================
    // 5. LIFECYCLE HOOKS
    // ==========================================
    onMounted(() => {
        fetchKelas();
    });

    // ==========================================
    // 6. RETURN (Agar bisa dipakai di Template)
    // ==========================================
    return {
        // State
        isSidebarOpen, kelasList, isLoading, showModal, isEditMode, 
        searchQuery, currentPage, itemsPerPage, fileInput, form,
        // Computed
        filteredKelas, paginatedKelas, totalPages,
        // Methods
        fetchKelas, nextPage, prevPage, triggerFileInput,
        handleFileUpload, openModal, handleSubmit, handleDelete,
        handleDeleteAll
    };
}