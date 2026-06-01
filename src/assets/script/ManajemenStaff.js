import { ref, onMounted, computed, watch } from 'vue';
import Api from '../../api';
import { useAuthStore } from '../../stores/authStore';
import Swal from 'sweetalert2';

export function useManajemenStaff() {
    const authStore = useAuthStore();
    
    // --- STATE ---
    const isSidebarOpen = ref(true);
    const userList = ref([]);
    const isLoading = ref(true);
    const showModal = ref(false);
    const isEditMode = ref(false);

    // Pagination & Search State
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 5;

    // Form State
    const form = ref({
        id: null,
        nama_lengkap: '',
        username: '',
        email: '',
        password: '',
        role: 'asisten',
        npm: '',
        no_hp: ''
    });

    // --- HELPER FUNCTIONS ---
    const formatRole = (role) => {
        if (!role) return '-';
        return role.replace('_', ' ').toUpperCase();
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'kepala_labor': return 'badge-kepala';
            case 'staff_labor': return 'badge-staff';
            case 'asisten': return 'badge-asisten';
            default: return 'badge-default';
        }
    };

    const getJumlahKelas = (user) => {
        if (user.role !== 'asisten') return '-';
        // Cek array Jadwals dari backend (sesuai perbaikan controller sebelumnya)
        if (user.DataAsisten?.Jadwals) {
            return user.DataAsisten.Jadwals.length;
        }
        return 0;
    };

    // --- FETCH DATA ---
    const fetchUsers = async () => {
        try {
            isLoading.value = true;
            const response = await Api.get('/users');
            userList.value = response.data.data || [];
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
                text: 'Terjadi kesalahan saat mengambil data user.',
                confirmButtonColor: '#d33',
            });
            userList.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    // --- COMPUTED LOGIC ---
    
    // 1. Filter Role
    const roleFilteredList = computed(() => {
        const currentRole = authStore.userRole;
        if (currentRole === 'staff_labor') {
            return userList.value.filter(user => user.role === 'asisten');
        }
        return userList.value;
    });

    // 2. Search
    const searchedList = computed(() => {
        if (!searchQuery.value) return roleFilteredList.value;
        const query = searchQuery.value.toLowerCase();
        
        return roleFilteredList.value.filter(user => {
            const nama = user.nama_lengkap ? user.nama_lengkap.toLowerCase() : '';
            const email = user.email ? user.email.toLowerCase() : '';
            const role = user.role ? user.role.toLowerCase() : '';
            const npm = user.DataAsisten?.npm ? user.DataAsisten.npm.toLowerCase() : '';
            
            return nama.includes(query) || 
                   email.includes(query) || 
                   role.includes(query) || 
                   npm.includes(query);
        });
    });

    // 3. Pagination Data
    const paginatedUsers = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return searchedList.value.slice(start, end);
    });

    // 4. Total Pages
    const totalPages = computed(() => {
        return Math.ceil(searchedList.value.length / itemsPerPage);
    });

    // --- WATCHERS ---
    watch(searchQuery, () => {
        currentPage.value = 1;
    });

    // --- ACTION METHODS ---
    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
    };

    const openModal = (data = null) => {
        if (data) {
            isEditMode.value = true;
            form.value = {
                id: data.id_users || data.id, 
                nama_lengkap: data.nama_lengkap,
                username: data.username,
                email: data.email,
                role: data.role,
                password: '', 
                npm: data.DataAsisten ? data.DataAsisten.npm : '',
                no_hp: data.DataAsisten ? data.DataAsisten.no_hp : ''
            };
        } else {
            isEditMode.value = false;
            form.value = { 
                id: null, nama_lengkap: '', username: '', email: '', 
                password: '', role: 'asisten', npm: '', no_hp: '' 
            };
            if (authStore.userRole === 'staff_labor') {
                form.value.role = 'asisten';
            }
        }
        showModal.value = true;
    };

    const handleSubmit = async () => {

        // <--- 3. Tambahkan Loading Swal saat proses simpan
        Swal.fire({
            title: 'Menyimpan Data...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            if (isEditMode.value) {
                await Api.put(`/users/${form.value.id}`, form.value);
            } else {
                await Api.post('/users', form.value);
            }
            showModal.value = false;
            fetchUsers();
// <--- 4. Alert Sukses Simpan
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: `Data berhasil ${isEditMode.value ? 'diperbarui' : 'ditambahkan'}!`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Terjadi kesalahan.';
            // <--- 5. Alert Gagal Simpan
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan',
                text: msg,
                confirmButtonColor: '#d33'
            });
        }
    };

    const handleDelete = (id) => {
        // <--- 6. Ganti confirm() dengan Swal.fire Confirm
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data user yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6', // Warna tombol Ya (Biru/Default)
            cancelButtonColor: '#d33',     // Warna tombol Batal (Merah)
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Tampilkan loading saat proses hapus
                Swal.fire({
                    title: 'Menghapus...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                try {
                    await Api.delete(`/users/${id}`);
                    await fetchUsers();

                    // Alert Sukses Hapus
                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus!',
                        text: 'Data user berhasil dihapus.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    // Alert Gagal Hapus
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan saat menghapus data.',
                    });
                }
            }
        });
    };

    // --- LIFECYCLE ---
    onMounted(() => {
        fetchUsers();
    });

    // --- RETURN OBJECT (Agar bisa dipakai di .vue) ---
    return {
        authStore,
        isSidebarOpen,
        userList,
        isLoading,
        showModal,
        isEditMode,
        searchQuery,
        currentPage,
        itemsPerPage,
        form,
        formatRole,
        getRoleBadgeClass,
        getJumlahKelas,
        paginatedUsers,
        totalPages,
        nextPage,
        prevPage,
        openModal,
        handleSubmit,
        handleDelete
    };
}