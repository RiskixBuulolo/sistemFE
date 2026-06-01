<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import '../../assets/css/monitoringAbsensi.css'

import { useMonitoringAbsensi } from '../../assets/script/monitoringAbsensi.js';

const {
    isSidebarOpen, isLoading,
    filteredJadwalOptions, searchQuery, selectedJadwal, dropdownRef,
    isDropdownOpen, selectItem, onSearchInput,
    paginatedAbsensiList, currentPage, totalPages, nextPage, prevPage, itemsPerPage,
    formatTime, formatDate, viewPhoto, openMap
} = useMonitoringAbsensi();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
      <div class="content-wrapper">
        <div class="page-header-modern">
          <div class="header-content">
            <h2>Monitoring Absensi</h2>
            <p class="text-subtitle">Pantau kehadiran asisten praktikum secara real-time.</p>
          </div>
          </div>

        <div class="modern-card search-card">
            <div class="search-wrapper">
                <label class="search-label">Filter Jadwal / Asisten</label>
                <div class="searchable-dropdown" ref="dropdownRef">
                    <div class="input-icon-wrapper">
                        <span class="search-icon"></span>
                        <input 
                            type="text" 
                            v-model="searchQuery"
                            @input="onSearchInput"
                            @focus="isDropdownOpen = true"
                            placeholder="🔍 Cari Mata Kuliah, Kelas, atau Nama Asisten..."
                            class="modern-input"
                        />
                        <span v-if="isLoading" class="loading-spinner-small"></span>
                    </div>
                    
                    <transition name="fade-slide">
                        <ul v-if="isDropdownOpen" class="modern-dropdown-list">
                            <li v-if="filteredJadwalOptions.length === 0" class="dropdown-item empty">
                                Data tidak ditemukan
                            </li>
                            <li 
                                v-for="item in filteredJadwalOptions" 
                                :key="item.id" 
                                @click="selectItem(item)"
                                class="dropdown-item"
                            >
                                <span class="item-icon">📅</span>
                                {{ item.label }}
                            </li>
                        </ul>
                    </transition>
                </div>
            </div>
        </div>

        <div class="modern-card table-card">
            <div class="card-header-flex">
                <h4 class="card-title">
                    {{ selectedJadwal ? '📋 Data Terfilter' : '📋 Semua Riwayat' }}
                </h4>
                <div class="data-badge">
                    Total: {{ paginatedAbsensiList.length }} Data
                </div>
            </div>

            <div v-if="isLoading" class="loading-state">
                <div class="spinner"></div>
                <p>Sedang memuat data...</p>
            </div>
            
            <div v-else class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th width="5%" class="text-center">No</th>
                            <th width="10%" class="text-center">Nama Asisten</th>
                            <th width="20%" class="text-center">Mata Kuliah</th>
                            <th width="20%" class="text-center">Tanggal</th>
                            <th width="15%" class="text-center">Waktu</th>
                            <th width="15%" class="text-center">Status</th>
                            <th width="15%" class="text-center">Lokasi</th>
                            <th width="20%" class="text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        <tr v-for="(item, index) in paginatedAbsensiList" :key="item.id_absensi" class="hover-row">
                            <td class="fw-bold text-muted">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                            <td>
                                <span class="fw-bold">{{ item.Jadwal?.DataAsisten?.User?.nama_lengkap || 'Nama Asisten Tidak Ditemukan' }}</span>
                            </td>
                            <td>
                                <div class="d-flex flex-column text-center">
                                    <span class="fw-bold">{{ item.Jadwal?.Kelas?.nama_mk || 'Mata Kuliah Tidak Ditemukan' }}</span>
                                    
                                    <div class="text-muted" style="font-size: 0.85em;">
                                        <span class="badge bg-light text-dark border">
                                            {{ item.Jadwal?.Kelas?.nama_kelas || '-' }}
                                        </span>
                                        <span class="ms-1">
                                            <i class="bi bi-clock"></i> {{ item.Jadwal?.Kelas?.hari_jam || '-' }}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="date-cell">
                                    <span class="date-icon">🗓️</span> {{ formatDate(item.tanggal) }}
                                </div>
                            </td>
                            <td>
                                <div class="font-mono">
                                    {{ formatTime(item.waktu_absen) }} WIB
                                </div>
                            </td>
                            <td>
                                <span :class="['status-badge', `status-${item.status.toLowerCase()}`]">
                                    {{ item.status }}
                                </span>
                            </td>
                            <td>
                                <div :class="['location-indicator', item.lokasi_valid ? 'valid' : 'invalid']">
                                    <span class="dot"></span>
                                    {{ item.lokasi_valid ? 'Di Lab' : 'Luar Lab' }}
                                </div>
                            </td>
                            <td class="text-center">
                                <div class="action-buttons">
                                    <button @click="viewPhoto(item.foto_absensi)" class="btn-icon btn-blue" title="Lihat Foto">
                                        📷
                                    </button>
                                    <button @click="openMap(item.latitude, item.longitude)" class="btn-icon btn-green" title="Lihat Lokasi">
                                        🗺️
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="paginatedAbsensiList.length === 0">
                            <td colspan="6" class="empty-table">
                                <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="No Data" class="empty-img"/>
                                <p>Belum ada data absensi yang ditemukan.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination-container" v-if="totalPages > 1">
                <button 
                    @click="prevPage" 
                    :disabled="currentPage === 1"
                    class="btn-pagination"
                >
                    <span class="arrow">←</span> Prev
                </button>
                
                <div class="page-indicators">
                    <span class="page-pill active">{{ currentPage }}</span>
                    <span class="separator">/</span>
                    <span class="page-pill">{{ totalPages }}</span>
                </div>
                
                <button 
                    @click="nextPage" 
                    :disabled="currentPage === totalPages"
                    class="btn-pagination"
                >
                    Next <span class="arrow">→</span>
                </button>
            </div>
        </div>
      </div> <Footer />
    </div>
  </div>
</template>