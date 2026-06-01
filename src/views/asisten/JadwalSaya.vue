<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import { useAsistenJadwal } from '../../assets/script/asistenJadwalSaya.js';
import '../../assets/css/asistenJadwalSaya.css'

const { 
  isSidebarOpen, isLoading, errorMessage, 
  searchQuery, currentPage, totalPages, paginatedJadwal, filteredJadwal,
  formatTime, nextPage, prevPage, 
  goToAbsensi, goToLaporan 
} = useAsistenJadwal();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="content-wrapper">
        <div class="header-page">
          <h1 class="title">Jadwal Praktikum Saya</h1>
          <p class="subtitle">Kelola kehadiran dan laporan praktikum Anda di sini.</p>
        </div>

        <div class="search-container">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="🔍 Cari Mata Kuliah, Dosen, Kelas, atau Hari..." 
            class="search-input"
          />
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat jadwal...</p>
        </div>

        <div v-else-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div v-else-if="filteredJadwal.length === 0" class="empty-state">
          <p v-if="searchQuery">Tidak ditemukan jadwal dengan kata kunci "<strong>{{ searchQuery }}</strong>".</p>
          <p v-else>Belum ada jadwal praktikum yang ditugaskan kepada Anda.</p>
        </div>

        <div v-else>
          <div class="jadwal-grid">
            <div v-for="jadwal in paginatedJadwal" :key="jadwal.id_jadwal" class="jadwal-card">
              
              <div class="card-header">
                <div class="day-badge">
                  📅 {{ jadwal.hari || (jadwal.Kelas?.hari_jam ? jadwal.Kelas.hari_jam.split(' ')[0] : '-') }}
                </div>
                <div class="time-badge">
                  🕒 <template v-if="jadwal.waktu_dimulai">
                    {{ formatTime(jadwal.waktu_dimulai) }} - {{ formatTime(jadwal.waktu_selesai) }}
                  </template>
                  <template v-else>
                    {{ jadwal.Kelas?.hari_jam || '-' }}
                  </template>
                </div>
              </div>

              <div class="card-body">
                <div class="mk-section">
                    <h3 class="mk-name">{{ jadwal.Kelas?.nama_mk || 'Mata Kuliah' }}</h3>
                    <p class="mk-kelas">Kelas: {{ jadwal.Kelas?.nama_kelas || '-' }}</p>
                </div>
                
                <hr class="divider">

                <div class="info-section">
                  <div class="info-item">
                    <span class="info-icon">👨‍🏫</span>
                    <div class="info-content">
                        <span class="info-label">Dosen Pengampu</span><br>
                        <span class="info-value">{{ jadwal.Kelas?.nama_dosen || '-' }}</span>
                    </div>
                  </div>
                  <div class="info-item" v-if="jadwal.Kelas?.ruangan">
                    <span class="info-icon">📍</span>
                    <div class="info-content">
                        <span class="info-label">Ruangan</span><br>
                        <span class="info-value">{{ jadwal.Kelas.ruangan }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button @click="goToAbsensi(jadwal.id_jadwal)" class="btn-action btn-absen">
                  📷 Absen
                </button>
                <button @click="goToLaporan(jadwal.id_jadwal)" class="btn-action btn-laporan">
                  📝 Laporan
                </button>
              </div>

            </div>
          </div>

          <div v-if="totalPages > 1" class="pagination-container">
            <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
              &laquo; Sebelumnya
            </button>
            <span class="pagination-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
              Selanjutnya &raquo;
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  </div>
</template>