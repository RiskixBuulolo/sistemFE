<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import Api from '../../api';

// --- STATE ---
const isSidebarOpen = ref(true);
const isLoading = ref(false);
const riwayatList = ref([]);
const searchQuery = ref('');

// --- PAGINATION STATE ---
const currentPage = ref(1);
const itemsPerPage = 5;

// --- ARCHIVE & EXPORT STATE ---
const showArchiveModal = ref(false);
const hasExported = ref(false);
const deleteConfirmation = ref('');
const isDeleting = ref(false);

// --- FETCH DATA ---
const fetchRiwayat = async () => {
    isLoading.value = true;
    try {
        const response = await Api.get('/riwayat');
        if (Array.isArray(response.data)) {
            riwayatList.value = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            riwayatList.value = response.data.data;
        } else {
            riwayatList.value = [];
        }
    } catch (error) {
        console.error("Gagal ambil riwayat:", error);
    } finally {
        isLoading.value = false;
    }
};

// --- COMPUTED: FILTER SEARCH ---
const filteredRiwayat = computed(() => {
    if (!searchQuery.value) return riwayatList.value;
    const lowerQuery = searchQuery.value.toLowerCase();
    return riwayatList.value.filter(item => {
        const user = item.User?.nama_lengkap || item.user?.nama_lengkap || '';
        const activity = item.aktivitas || '';
        return user.toLowerCase().includes(lowerQuery) || 
               activity.toLowerCase().includes(lowerQuery);
    });
});

// --- COMPUTED: PAGINATION LOGIC ---
const totalPages = computed(() => {
    return Math.ceil(filteredRiwayat.value.length / itemsPerPage);
});

const paginatedRiwayat = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRiwayat.value.slice(start, end);
});

// --- METHODS: PAGINATION ---
const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};
watch(searchQuery, () => {
    currentPage.value = 1;
});

// --- METHODS: EXPORT & ARCHIVE ---
const openArchiveModal = () => {
    hasExported.value = false;
    deleteConfirmation.value = '';
    showArchiveModal.value = true;
};

const exportToCSV = () => {
    if (riwayatList.value.length === 0) return alert('Tidak ada data untuk diexport.');

    // Buat Header CSV
    const headers = ['No', 'Tanggal Aktivitas', 'Waktu Aktivitas', 'Nama Pengguna', 'Role', 'Detail Aktivitas'];
    
    // Mapping Data ke Baris CSV
    const rows = riwayatList.value.map((item, index) => [
        index + 1,
        formatDateTime(item.waktu_aktivitas),
        item.User?.nama_lengkap || item.user?.nama_lengkap || 'User Terhapus',
        formatRole(item.User?.role || item.user?.role),
        `"${item.aktivitas}"` // Kutip ganda agar koma di kalimat tidak memutus kolom CSV
    ]);

    // Gabungkan Header dan Baris
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Backup_Riwayat_Labor_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Izinkan pengguna untuk menghapus setelah export selesai
    hasExported.value = true;
};

const handleDeleteRiwayat = async () => {
    if (deleteConfirmation.value !== 'HAPUS') return;
    
    isDeleting.value = true;
    try {
        // UNCOMMENT KODE DI BAWAH INI JIKA ENDPOINT API SUDAH SIAP
        await Api.delete('/riwayat/clear-all'); 
        
        // Simulasi Hapus Data di Frontend:
        setTimeout(() => {
            riwayatList.value = [];
            showArchiveModal.value = false;
            isDeleting.value = false;
            alert('✅ Berhasil: Semua data riwayat telah dibersihkan dari sistem.');
        }, 1000);

    } catch (error) {
        console.error('Gagal menghapus riwayat:', error);
        alert('Gagal menghapus riwayat. Periksa koneksi atau server.');
        isDeleting.value = false;
    }
};

// --- FORMATTERS ---
const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date).replace('.', ':');
};

const getRoleClass = (role) => {
    if(role === 'kepala_labor') return 'role-kepala';
    if(role === 'staff_labor') return 'role-staff';
    if(role === 'asisten') return 'role-asisten';
    return 'role-default';
};

const formatRole = (role) => {
    if(!role) return '-';
    return role.replace('_', ' ').toUpperCase();
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
};

onMounted(() => {
    fetchRiwayat();
});
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
      <div class="content-wrapper">
        <div class="page-header">
          <div>
              <h2>Riwayat Aktivitas</h2>
              <p class="text-muted">Pantau log aktivitas pengguna dan keamanan sistem.</p>
          </div>
        </div>

        <div class="card">
            <div class="card-header-actions">
                <div class="header-left">
                    <div class="total-badge">
                        Total: <b>{{ filteredRiwayat.length }}</b> Aktivitas
                    </div>
                    <button @click="openArchiveModal" class="btn-export" :disabled="riwayatList.length === 0">
                        📥 Export & Arsip
                    </button>
                </div>

                <div class="search-wrapper">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Cari User atau Aktivitas..." 
                        class="modern-input"
                    />
                </div>
            </div>

            <div class="table-container">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th width="5%">No</th>
                            <th width="20%">Waktu</th>
                            <th width="30%">Pengguna</th>
                            <th>Detail Aktivitas</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoading">
                            <td colspan="4" class="text-center p-5">
                                <span class="loader"></span> Memuat data...
                            </td>
                        </tr>
                        
                        <tr v-else-if="paginatedRiwayat.length === 0">
                            <td colspan="4" class="text-center p-5 text-muted">
                                Tidak ada data yang ditemukan.
                            </td>
                        </tr>

                        <tr v-else v-for="(item, index) in paginatedRiwayat" :key="item.id_riwayat || index">
                            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                            <td>
                                <div class="time-pill">
                                    {{ formatDateTime(item.waktu_aktivitas) }}
                                </div>
                            </td>
                            <td>
                                <div class="user-profile">
                                    <div class="avatar">
                                        {{ getInitials(item.User?.nama_lengkap || item.user?.nama_lengkap) }}
                                    </div>
                                    <div class="user-details">
                                        <span class="user-name">
                                            {{ item.User?.nama_lengkap || item.user?.nama_lengkap || 'User Terhapus' }}
                                        </span>
                                        <span class="user-role" :class="getRoleClass(item.User?.role || item.user?.role)">
                                            {{ formatRole(item.User?.role || item.user?.role) }}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="activity-text">{{ item.aktivitas }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination-controls" v-if="totalPages > 1 && !isLoading">
                <button @click="prevPage" :disabled="currentPage === 1" class="btn-page">Sebelumnya</button>
                <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-page">Selanjutnya</button>
            </div>
        </div>
      </div>

      <Footer />
    </div>

    <div v-if="showArchiveModal" class="modal-overlay">
        <div class="modal-content archive-modal">
            <div class="modal-header">
                <h3>🗄️ Backup & Arsip Data Riwayat</h3>
                <button class="btn-close" @click="showArchiveModal = false">✖</button>
            </div>
            
            <div class="modal-body">
                <p class="text-muted mb-4">
                    Untuk meringankan beban database, sangat disarankan untuk melakukan backup (Export) data secara berkala sebelum menghapusnya dari sistem.
                </p>

                <div class="step-card">
                    <div class="step-number">1</div>
                    <div class="step-info">
                        <h4>Unduh Data (Wajib)</h4>
                        <p>Simpan data riwayat ke dalam format Excel/CSV ke perangkat Anda.</p>
                        <button @click="exportToCSV" class="btn-success mt-2">
                            📄 Download File CSV
                        </button>
                    </div>
                </div>

                <div class="step-card" :class="{ 'disabled-step': !hasExported }">
                    <div class="step-number">2</div>
                    <div class="step-info">
                        <h4>Hapus Data Sistem</h4>
                        <p v-if="!hasExported" class="text-warning text-sm">Silakan download data terlebih dahulu untuk membuka fitur ini.</p>
                        <p v-else class="text-danger text-sm">Peringatan: Data yang dihapus tidak dapat dikembalikan.</p>
                        
                        <div v-if="hasExported" class="danger-zone mt-2">
                            <label>Ketik <b>HAPUS</b> untuk konfirmasi:</label>
                            <input type="text" v-model="deleteConfirmation" class="modern-input1 danger-input" placeholder="HAPUS" />
                            <button 
                                @click="handleDeleteRiwayat" 
                                class="btn-danger mt-2" 
                                :disabled="deleteConfirmation !== 'HAPUS' || isDeleting">
                                {{ isDeleting ? 'Menghapus...' : '🗑️ Bersihkan Database' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

  </div>
</template> 

<style scoped>
/* ========================
   1. GLOBAL VARIABLES
   ======================== */
:root {
  --primary: #4f46e5;
  --bg-app: #f3f4f6;
  --bg-card: #ffffff;
  --text-main: #111827;
  --text-muted: #6b7280;
  --border: #e5e7eb;
}

/* ========================
   2. LAYOUT STRUCTURE
   ======================== */
.app-container {
    display: flex;
    min-height: 100vh;
    background-color: var(--bg-app);
    font-family: 'Inter', sans-serif;
    color: var(--text-main);
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
    margin-left: 0;
    width: 100%;
}

.shifted { margin-left: 260px; } /* Sesuaikan lebar sidebar */

.content-wrapper {
    padding: 2rem;
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

/* ========================
   3. HEADER & TYPOGRAPHY
   ======================== */
.page-header { margin-bottom: 2rem; }
.page-header h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 0.25rem;
    letter-spacing: -0.025em;
}
.page-header .text-muted { font-size: 0.95rem; color: #6b7280; }

/* ========================
   4. CARD COMPONENT
   ======================== */
.card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(255,255,255,0.7);
    overflow: hidden;
    padding-bottom: 1rem;
}

.card-header-actions {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    background-color: #fff;
}

.total-badge {
    font-size: 0.9rem;
    color: var(--text-muted);
    background: #f3f4f6;
    padding: 6px 12px;
    border-radius: 8px;
}

/* ========================
   5. SEARCH INPUT
   ======================== */
.search-wrapper {
    position: relative;
    width: 300px;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    opacity: 0.5;
}

.modern-input {
    width: 100%;
    padding: 10px 10px 10px 36px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 0.9rem;
    transition: all 0.2s;
    background: #f9fafb;
}

.modern-input:focus {
    background: #fff;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    outline: none;
}

.modern-input1 {
    width: 100%;
    padding: 10px 0px 10px 0px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 0.9rem;
    transition: all 0.2s;
    background: #f9fafb;
}

.modern-input1:focus {
    background: #fff;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    outline: none;
}

/* ========================
   6. MODERN TABLE
   ======================== */
.table-container { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }

.modern-table th {
    background: #f9fafb;
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border);
}

.modern-table td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
    font-size: 0.9rem;
    color: var(--text-main);
}

.modern-table tr:hover td { background-color: #fcfcfc; }
.modern-table tr:last-child td { border-bottom: none; }

/* ========================
   7. CONTENT STYLING
   ======================== */
/* Time Pill */
.time-pill {
    background: #eef2ff;
    color: #4338ca;
    padding: 4px 10px;
    border-radius: 6px;
    font-family: 'Monaco', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-block;
}

/* User Profile */
.user-profile { display: flex; align-items: center; gap: 12px; }

.avatar {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.user-details { display: flex; flex-direction: column; }
.user-name { font-weight: 300; color: #1f2937; font-size: 15px; }

/* Roles Badges (Pastel Colors) */
.user-role {
    font-size: 0.7rem;
    font-weight: 600;
    margin-top: 2px;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    width: fit-content;
}

.role-kepala { background: #dbeafe; color: #1e40af; } /* Blue */
.role-staff { background: #dcfce7; color: #166534; }  /* Green */
.role-asisten { background: #fae8ff; color: #86198f; } /* Purple */
.role-default { background: #f3f4f6; color: #4b5563; } /* Gray */

.activity-text { color: #374151; line-height: 1.5; }

/* ========================
   8. PAGINATION
   ======================== */
.pagination-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-top: 1px solid var(--border);
}

.page-info { font-size: 0.9rem; color: var(--text-muted); }

.pagination-buttons { display: flex; gap: 8px; }

.btn-nav {
    padding: 8px 16px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    color: var(--text-main);
}

.btn-nav:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
    background: #eef2ff;
}

.btn-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
    .shifted { margin-left: 0; }
    .card-header-actions { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .search-wrapper { width: 100%; }
    .pagination-footer { flex-direction: column; gap: 1rem; }
}

.header-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.btn-export {
    background-color: #10b981; /* Warna hijau sukses */
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-export:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-1px);
}
.btn-export:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
    box-shadow: none;
}

/* Modal Styling Khusus Archive */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center; z-index: 1000;
}

.archive-modal {
    background: white; width: 100%; max-width: 500px;
    border-radius: 16px; padding: 24px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;
}
.modal-header h3 { margin: 0; font-size: 1.25rem; color: #1f2937; }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }

.step-card {
    display: flex; gap: 15px; background: #f9fafb;
    padding: 15px; border-radius: 12px; margin-bottom: 15px;
    border: 1px solid #e5e7eb; transition: opacity 0.3s;
}
.disabled-step { opacity: 0.5; pointer-events: none; }

.step-number {
    width: 30px; height: 30px; background: var(--primary, #4f46e5);
    color: white; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;
}

.step-info h4 { margin: 0 0 5px 0; font-size: 1rem; color: #374151; }
.step-info p { margin: 0; font-size: 0.85rem; color: #6b7280; }

.btn-success {
    background: #10b981; color: white; border: none; padding: 8px 16px;
    border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%;
}
.btn-success:hover { background: #059669; }

.danger-zone { border-top: 1px dashed #d1d5db; padding-top: 10px; }
.danger-input { border-color: #ef4444; margin-top: 5px; }
.danger-input:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); border-color: #ef4444;}

.btn-danger {
    background: #ef4444; color: white; border: none; padding: 8px 16px;
    border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%;
}
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { background: #fca5a5; cursor: not-allowed; }

.text-warning { color: #d97706 !important; }
.text-danger { color: #dc2626 !important; font-weight: 500; }
.mt-2 { margin-top: 10px; }
.mb-4 { margin-bottom: 20px; }

</style>