<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import { useAsistenDashboard } from '../../assets/script/asistenDashboardScript.js';
import '../../assets/css/asistenDashboardStyle.css';

const { isSidebarOpen, stats, isLoading, errorMessage } = useAsistenDashboard();
</script>

<template>
  <div class="app-container">
    
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="content-wrapper">
        
        <div class="dashboard-header">
            <h1 class="title">Dashboard Asisten Laboratorium</h1>
            <p class="subtitle">👋 Halo! Berikut adalah ringkasan aktivitas dan jadwal Anda.</p>
        </div>
        
        <div v-if="isLoading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Sedang memuat data terbaru...
        </div>
        
        <div v-else-if="errorMessage" class="error">
            <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
        </div>

        <div v-else>
            <h3 class="section-title">Aktivitas Saya</h3>
            <div class="stats-grid">
                
                <div class="stat-card type-info">
                    <div class="card-top">
                        <div class="icon-box">📅</div>
                        <span class="card-title-text">Jadwal<br>Praktikum Saya</span>
                    </div>
                    <div class="number-display">{{ stats.jadwal_saya }}</div>
                    <span class="card-desc">Kelas yang diampu semester ini</span>
                </div>

                <div class="stat-card type-success">
                    <div class="card-top">
                        <div class="icon-box">🕒</div>
                        <span class="card-title-text">Total Kehadiran<br>Absensi</span>
                    </div>
                    <div class="number-display">{{ stats.absensi_saya }}</div>
                    <span class="card-desc">Kehadiran tercatat di sistem</span>
                </div>

                <div class="stat-card type-purple">
                    <div class="card-top">
                        <div class="icon-box">📝</div>
                        <span class="card-title-text">Laporan Harian<br>Dikirim</span>
                    </div>
                    <div class="number-display">{{ stats.laporan_saya }}</div>
                    <span class="card-desc">Laporan yang telah disubmit</span>
                </div>

            </div>
        </div>

      </div>

      <Footer />

    </div>
  </div>
</template>