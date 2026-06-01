import { ref, reactive, onMounted } from 'vue';
import Api from '../../api'; // Sesuaikan path jika folder berubah
import { useAuthStore } from '../../stores/authStore';

export function useUserProfile() {
    const authStore = useAuthStore();

    // --- STATE ---
    const isSidebarOpen = ref(true);
    const isLoading = ref(false);
    const riwayatTerakhir = ref([]);

    // Form State (Reactive)
    const form = reactive({
        nama_lengkap: '',
        username: '',
        email: '',
        role: '',      // Readonly
        npm: '',       // Khusus Asisten
        no_hp: '',     // Khusus Asisten
        password: '',
        confirmPassword: ''
    });

    // --- HELPER FUNCTIONS ---
    const formatRole = (role) => {
        return role ? role.replace('_', ' ').toUpperCase() : '';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute:'2-digit' 
        });
    };

    // --- FETCH DATA ---
    const fetchProfile = async () => {
        isLoading.value = true;
        try {
            const response = await Api.get('/profile/me');
            const data = response.data;

            // Isi Form
            form.nama_lengkap = data.nama_lengkap;
            form.username = data.username;
            form.email = data.email;
            form.role = data.role;
            
            // Jika Asisten, ambil data dari relasi DataAsisten
            // Perbaikan: Cek if data.DataAsisten valid (bukan null/undefined)
            if (data.DataAsisten) {
                form.npm = data.DataAsisten.npm || '';
                form.no_hp = data.DataAsisten.no_hp || '';
            }

            // Ambil riwayat
            if (data.Riwayats) {
                riwayatTerakhir.value = data.Riwayats;
            }

        } catch (error) {
            console.error("Error Fetch Profile:", error);
            // alert('Gagal memuat profil.'); 
        } finally {
            isLoading.value = false;
        }
    };

// --- UPDATE ACTION ---
// --- UPDATE ACTION ---
const updateProfile = async () => {
    // Validasi Password
    if (form.password && form.password !== form.confirmPassword) {
        alert("Konfirmasi password baru tidak cocok!");
        return;
    }

    try {
        isLoading.value = true;
        // Kirim data termasuk username
        await Api.put('/profile/me', {
            nama_lengkap: form.nama_lengkap,
            username: form.username, // <--- TAMBAHAN: Kirim username baru
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            npm: form.npm,
            no_hp: form.no_hp
        });

        alert("Profil berhasil diperbarui!");
        
        // Reset password field
        form.password = '';
        form.confirmPassword = '';
        
        // Refresh data untuk memastikan sinkronisasi
        await fetchProfile();
        
        // Update data di Pinia AuthStore (Update nama & username di state global)
        authStore.user.nama_lengkap = form.nama_lengkap;
        authStore.user.username = form.username;

    } catch (error) {
        console.error(error);
        // Tampilkan pesan error spesifik (misal: Username sudah dipakai)
        alert(error.response?.data?.message || 'Gagal update profil');
    } finally {
        isLoading.value = false;
    }
};

    // --- LIFECYCLE ---
    onMounted(() => {
        fetchProfile();
    });

    // --- RETURN OBJECT ---
    return {
        authStore,
        isSidebarOpen,
        isLoading,
        riwayatTerakhir,
        form,
        formatRole,
        formatDate,
        fetchProfile,
        updateProfile
    };
}