import { ref, onMounted, computed, watch } from 'vue';
import Api from '../../api'; // Sesuaikan path ini dengan struktur folder Anda
import Swal from 'sweetalert2';

// 1. IMPORT AUTH STORE
import { useAuthStore } from '../../stores/authStore'; 

export function useJadwalIndex() {
    // 2. INISIALISASI STORE & CEK ROLE
    const authStore = useAuthStore();
    const isKepalaLabor = computed(() => authStore.userRole?.toLowerCase() === 'kepala_labor');
    
    // --- STATE UTAMA ---
    const isSidebarOpen = ref(true);
    const isLoading = ref(true);
    const showModal = ref(false);
    const isEditMode = ref(false);

    // Data API
    const rawJadwalList = ref([]); 
    const kelasOptions = ref([]);
    const asistenOptions = ref([]);

    // State Form
    const form = ref({
        id_jadwal: null,
        id_kelas: '',
        id_asisten: ''
    });

    // --- STATE FILTER & PAGINATION ---
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 5;

    // --- STATE SEARCHABLE DROPDOWN ---
    const searchKelas = ref('');
    const showKelasDropdown = ref(false);
    const searchAsisten = ref('');
    const showAsistenDropdown = ref(false);

    // --- COMPUTED: GROUPING DATA ---
    const groupedJadwal = computed(() => {
        const groups = {};
        rawJadwalList.value.forEach(item => {
            if (!item.Kelas) return;
            const classId = item.id_kelas;
            if (!groups[classId]) {
                groups[classId] = {
                    id_kelas: classId,
                    mk_info: item.Kelas, 
                    assistants: []       
                };
            }
            groups[classId].assistants.push({
                id_jadwal: item.id_jadwal, 
                user: item.DataAsisten?.User || { nama_lengkap: 'Data Error' }
            });
        });
        return Object.values(groups);
    });

    // --- COMPUTED: FILTER & PAGINATION ---
    const filteredJadwal = computed(() => {
        if (!searchQuery.value) return groupedJadwal.value;
        const query = searchQuery.value.toLowerCase();
        return groupedJadwal.value.filter(group => {
            const mkName = group.mk_info.nama_mk ? group.mk_info.nama_mk.toLowerCase() : '';
            const asisten1 = group.assistants[0]?.user?.nama_lengkap?.toLowerCase() || '';
            const asisten2 = group.assistants[1]?.user?.nama_lengkap?.toLowerCase() || '';
            return mkName.includes(query) || asisten1.includes(query) || asisten2.includes(query);
        });
    });

    const paginatedJadwal = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredJadwal.value.slice(start, end);
    });

    const totalPages = computed(() => {
        return Math.ceil(filteredJadwal.value.length / itemsPerPage);
    });

    // --- WATCHERS ---
    watch(searchQuery, () => { currentPage.value = 1; });

    // --- METHODS: PAGINATION ---
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
    const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

    // --- COMPUTED: DROPDOWN FILTER ---
    const filteredKelasOptions = computed(() => {
        if (!searchKelas.value) return kelasOptions.value;
        return kelasOptions.value.filter(k => 
            k.label.toLowerCase().includes(searchKelas.value.toLowerCase())
        );
    });

    const filteredAsistenOptions = computed(() => {
        if (!searchAsisten.value) return asistenOptions.value;
        return asistenOptions.value.filter(a => 
            a.label.toLowerCase().includes(searchAsisten.value.toLowerCase())
        );
    });

    // --- METHODS: DROPDOWN ACTIONS ---
    const selectKelas = (item) => {
        form.value.id_kelas = item.id;
        searchKelas.value = item.label;
        showKelasDropdown.value = false;
    };

    const selectAsisten = (item) => {
        form.value.id_asisten = item.id;
        searchAsisten.value = item.label;
        showAsistenDropdown.value = false;
    };

    const handleBlur = (type) => {
        setTimeout(() => {
            if (type === 'kelas') showKelasDropdown.value = false;
            if (type === 'asisten') showAsistenDropdown.value = false;
        }, 200);
    };

    // --- METHODS: API OPERATIONS ---
    const fetchData = async () => {
        try {
            isLoading.value = true;
            const [resJadwal, resKelas, resUsers] = await Promise.all([
                Api.get('/jadwal'),
                Api.get('/kelas'),
                Api.get('/users')
            ]);

            rawJadwalList.value = resJadwal.data.data || [];

            // Logic memfilter kelas yang sudah penuh (max 2 asisten)
            const usageMap = {};
            rawJadwalList.value.forEach(j => {
                if(j.id_kelas) usageMap[j.id_kelas] = (usageMap[j.id_kelas] || 0) + 1;
            });

            kelasOptions.value = (resKelas.data.data || [])
                .filter(k => (usageMap[k.id_kelas] || 0) < 2)
                .map(k => ({
                    id: k.id_kelas,
                    label: `${k.nama_mk} - ${k.nama_kelas} (${k.hari_jam || '-'})` 
                }));

            const users = resUsers.data.data || [];
            asistenOptions.value = users
                .filter(u => u.role === 'asisten' && u.DataAsisten)
                .map(u => ({
                    id: u.DataAsisten.id_asisten,
                    label: `${u.nama_lengkap} (${u.DataAsisten.npm || '-'})`
                }));

            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Memuat Data',
                    text: 'Terjadi kesalahan saat mengambil data jadwal.',
                });
        } finally {
            isLoading.value = false;
        }
    };

    const openModal = (jadwalData = null, kelasId = null) => {
        form.value = { id_jadwal: null, id_kelas: '', id_asisten: '' };
        
        searchKelas.value = '';
        searchAsisten.value = '';
        showKelasDropdown.value = false;
        showAsistenDropdown.value = false;

        if (jadwalData) {
            isEditMode.value = true;
            form.value.id_jadwal = jadwalData.id_jadwal;
            form.value.id_kelas = kelasId; 
            
            const existingKelas = kelasOptions.value.find(k => k.id === kelasId);
            if (existingKelas) {
                searchKelas.value = existingKelas.label;
            } else {
                searchKelas.value = "(Kelas Terpilih)"; 
            }

            const foundAsisten = asistenOptions.value.find(a => a.label.includes(jadwalData.user.nama_lengkap));
            if(foundAsisten) {
                form.value.id_asisten = foundAsisten.id;
                searchAsisten.value = foundAsisten.label;
            }

        } else {
            isEditMode.value = false;
        }
        showModal.value = true;
    };

    const closeModal = () => {
        showModal.value = false;
    }

    const handleSubmit = async () => {
        try {
            // Validasi Input
            if (!form.value.id_kelas || !form.value.id_asisten) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data Belum Lengkap',
                    text: 'Silakan pilih Kelas dan Asisten terlebih dahulu!',
                });
                return;
            }

            // Tampilkan Loading
        Swal.fire({
            title: 'Menyimpan Data...',
            text: 'Mohon tunggu sebentar.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
            
            if (isEditMode.value) {
                await Api.put(`/jadwal/${form.value.id_jadwal}`, form.value);
            } else {
                await Api.post('/jadwal', form.value);
            }
            
            showModal.value = false;
            await fetchData(); 

            // Notifikasi Sukses
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: `Jadwal asisten berhasil ${isEditMode.value ? 'diperbarui' : 'ditambahkan'}.`,
                timer: 1500,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Pastikan asisten belum terdaftar di kelas yang sama.';
            
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan',
                text: msg,
            });
        }
    };

    const handleDelete = (id_jadwal) => {
        Swal.fire({
            title: 'Hapus Asisten?',
            text: "Asisten akan dihapus dari jadwal kelas ini!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                
                // Loading Hapus
                Swal.fire({
                    title: 'Menghapus...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                try {
                    await Api.delete(`/jadwal/${id_jadwal}`);
                    await fetchData();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus!',
                        text: 'Asisten telah dihapus dari jadwal.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) { 
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: 'Terjadi kesalahan saat menghapus data.',
                    });
                }
            }
        });
    };

    // --- LIFECYCLE ---
    onMounted(() => {
        fetchData();
    });

    // --- RETURN OBJECT (Agar bisa dipakai di Vue) ---
    return {
        // State
        isSidebarOpen, isLoading, showModal, isEditMode, form,
        searchQuery, currentPage, totalPages,
        searchKelas, showKelasDropdown, searchAsisten, showAsistenDropdown,
        
        // Computed Data
        paginatedJadwal, 
        filteredKelasOptions, filteredAsistenOptions,
        
        // 3. EXPORT STATE ROLE
        isKepalaLabor,

        // Methods
        nextPage, prevPage,
        selectKelas, selectAsisten, handleBlur,
        openModal, closeModal, handleSubmit, handleDelete, fetchData
    };
}