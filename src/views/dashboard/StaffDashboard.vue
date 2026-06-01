<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import dashboardService from '../../api/dashboardService';

// Gunakan CSS milik kepala dashboard agar seragam dan rapi
import '../../assets/css/kepalaDashboard.css'

// State untuk toggle sidebar
const isSidebarOpen = ref(true);

// State Data
const stats = ref({
  total_kegiatan: 0,
  dokumen_pending: 0,
  asisten_aktif: 0, // Staff memantau jumlah asisten
  pesan_baru: 0
});

const isLoading = ref(true);
const errorMessage = ref('');

const fetchDashboardData = async () => {
  try {
    // === PANGGIL SERVICE STAFF ===
    const response = await dashboardService.getStaffSummary();
    stats.value = response.data.data; 
  } catch (error) {
    console.error("Gagal ambil data dashboard staff:", error);
    errorMessage.value = "Gagal memuat data server.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="app-container">
    
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="content-wrapper">
        
        <div class="dashboard-header">
            <h1 class="title">Dashboard Staff Laboratorium</h1>
            <p class="subtitle">👋 Halo! Berikut adalah ringkasan monitoring laboratorium hari ini.</p>
        </div>
        
        <div v-if="isLoading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Sedang memuat data terbaru...
        </div>
        
        <div v-else-if="errorMessage" class="error">
            <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
        </div>

        <div v-else>
            
            <h3 class="section-title">Monitoring Dokumen & Laporan</h3>
            <div class="stats-grid">
                
                <div class="stat-card type-purple">
                    <div class="card-top">
                        <div class="icon-box">📥</div>
                        <span class="card-title-text">File<br>Modul</span>
                    </div>
                    <div class="number-display">{{ stats.total_modul }}</div>
                    <span class="card-desc">Total laporan asisten</span>
                </div>

                <div class="stat-card type-purple">
                    <div class="card-top">
                        <div class="icon-box">📑</div>
                        <span class="card-title-text">File Absensi <br>dan Monitoring</span>
                    </div>
                    <div class="number-display">{{ stats.total_absmon}}</div>
                    <span class="card-desc">RPS/Kontrak perlu dicek</span>
                </div>

                <div class="stat-card type-purple">
                    <div class="card-top">
                        <div class="icon-box">🎓</div>
                        <span class="card-title-text">File RPS <br>(Rencana Pembelajaran Semester)</span>
                    </div>
                    <div class="number-display">{{ stats.total_rps }}</div>
                    <span class="card-desc">RPS/Kontrak perlu dicek</span>
                </div>

                <div class="stat-card type-purple">
                    <div class="card-top">
                        <div class="icon-box">✍️</div>
                        <span class="card-title-text">File Kontrak<br>Kuliah Asisten</span>
                    </div>
                    <div class="number-display">{{ stats.total_kontrak }}</div>
                    <span class="card-desc">RPS/Kontrak perlu dicek</span>
                </div>

            </div>

            <h3 class="section-title">Data Akademik & Kegiatan</h3>
            <div class="stats-grid">

                <div class="stat-card type-info">
                    <div class="card-top">
                        <div class="icon-box">📅</div>
                        <span class="card-title-text">Total Jadwal<br>Praktikum</span>
                    </div>
                    <div class="number-display">{{ stats.total_jadwal }}</div>
                    <span class="card-desc">Jadwal aktif semester ini</span>
                </div>

                <div class="stat-card type-info">
                    <div class="card-top">
                        <div class="icon-box">🏫</div>
                        <span class="card-title-text">Total Kelas<br>Terdaftar</span>
                    </div>
                    <div class="number-display">{{ stats.total_kelas }}</div>
                    <span class="card-desc">Kelas praktikum berjalan</span>
                </div>

            </div>

            <h3 class="section-title">Monitoring SDM & Info</h3>
            <div class="stats-grid">
                
                <div class="stat-card type-info">
                    <div class="card-top">
                        <div class="icon-box">👥</div>
                        <span class="card-title-text">Asisten<br>Aktif</span>
                    </div>
                    <div class="number-display">{{ stats.asisten_aktif }}</div>
                    <span class="card-desc">Jumlah asisten terdaftar</span>
                </div>

                <div class="stat-card type-info">
                    <div class="card-top">
                        <div class="icon-box">⏰</div>
                        <span class="card-title-text">Total Yang<br>Telah Absen</span>
                    </div>
                    <div class="number-display">{{ stats.total_absen}}</div>
                    <span class="card-desc">Notifikasi pesan masuk</span>
                </div>

            </div>
        </div>

      </div>

      <Footer />

    </div>
  </div>
</template>