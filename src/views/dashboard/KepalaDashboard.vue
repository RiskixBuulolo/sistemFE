<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import '../../assets/css/kepalaDashboard.css'

// Import Logic
import { useKepalaDashboard } from '../../assets/script/kepalaDashboard.js';

// Gunakan Logic
const { isSidebarOpen, stats, isLoading, errorMessage } = useKepalaDashboard();
</script>

<template>
  <div class="app-container">
    
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="content-wrapper">
        
        <div class="dashboard-header">
            <h1 class="title">Dashboard Kepala Laboratorium</h1>
            <p class="subtitle">👋 Selamat datang, Bapak/Ibu! Berikut adalah ringkasan kinerja laboratorium hari ini.</p>
        </div>
        
        <div v-if="isLoading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Sedang memuat data terbaru...
        </div>
        
        <div v-else-if="errorMessage" class="error">
            <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
        </div>

        <div v-else>
            <h3 class="section-title">Dokumen Yang Telah Terkumpul</h3>
            <div class="stats-grid">
                
                <div class="stat-card type-warning">
                    <div class="card-top">
                        <div class="icon-box">📄</div>
                        <span class="card-title-text">Laporan RPS<br>Rencana Pembalajaran Semester</span>
                    </div>
                    <div class="number-display">{{ stats.total_rps }}</div>
                    <span class="card-desc">Dokumen Rencana Pembalajaran Semester</span>
                </div>

                <div class="stat-card type-warning">
                    <div class="card-top">
                        <div class="icon-box">✍️</div>
                        <span class="card-title-text">Laporan Kontrak<br>Asisten Labor</span>
                    </div>
                    <div class="number-display">{{ stats.total_kontrak }}</div>
                    <span class="card-desc">Dokumen Kontrak Asisten Labor</span>
                </div>

                <div class="stat-card type-warning">
                    <div class="card-top">
                        <div class="icon-box">⏰</div>
                        <span class="card-title-text">Laporan Absensi<br>Harian</span>
                    </div>
                    <div class="number-display">{{ stats.total_absensi }}</div>
                    <span class="card-desc">Data Kehadiran Asisten</span>
                </div>

            </div>

            <h3 class="section-title">Data Akademik & Kegiatan</h3>
            <div class="stats-grid">
                
                <div class="stat-card type-info">
                    <div class="card-top">
                        <div class="icon-box">🛠️</div>
                        <span class="card-title-text">Pembuatan Modul<br>Pembelajaran</span>
                    </div>
                    <div class="number-display">{{ stats.total_modul }}</div>
                    <span class="card-desc">Total Pembuatan Modul</span>
                </div>

                <div class="stat-card type-info">
                    <div class="card-top">
                        <div class="icon-box">📝</div>
                        <span class="card-title-text">Total Absensi &<br>Monitoring</span>
                    </div>
                    <div class="number-display">{{ stats.total_absmon }}</div>
                    <span class="card-desc">Data Absensi & Penilaian Mahasiswa</span>
                </div>

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

            <h3 class="section-title">Sumber Daya Manusia (SDM)</h3>
            <div class="stats-grid">
                
                <div class="stat-card type-success">
                    <div class="card-top">
                        <div class="icon-box">👥</div>
                        <span class="card-title-text">Staff Labor<br>Aktif</span>
                    </div>
                    <div class="number-display">{{ stats.staff_aktif }}</div>
                    <span class="card-desc">Personil Staff</span>
                </div>

                <div class="stat-card type-success">
                    <div class="card-top">
                        <div class="icon-box">🎓</div>
                        <span class="card-title-text">Asisten Labor<br>Aktif</span>
                    </div>
                    <div class="number-display">{{ stats.asisten_aktif }}</div>
                    <span class="card-desc">Mahasiswa Asisten</span>
                </div>

            </div>
        </div>

      </div>

      <Footer />

    </div>
  </div>
</template>