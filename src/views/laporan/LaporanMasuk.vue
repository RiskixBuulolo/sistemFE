<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import '../../assets/css/LaporanMasuk.css';
import { useLaporanMasuk } from '../../assets/script/laporanMasuk.js';

const {
    isSidebarOpen, activeTab, isLoading, isKepalaOrStaff,
    // Harian
    searchHarianInput, harianDropdownRef, isHarianDropdownOpen, filteredHarianOptions, 
    onSearchHarianInput, selectHarianItem, paginatedHarian, currentPageHarian, totalPageHarian, nextHarian, prevHarian, filteredHarianList,
    // Semester
    searchSemesterInput, semesterDropdownRef, isSemesterDropdownOpen, filteredSemesterOptions,
    onSearchSemesterInput, selectSemesterItem, paginatedSemester, currentPageSemester, totalPageSemester, nextSemester, prevSemester,
    // Common
    switchTab, downloadFile, formatDate, downloadRekapitulasi
} = useLaporanMasuk();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
              <h2>Rekap Laporan Masuk</h2>
              <p class="text-muted">Pantau laporan kegiatan harian dan kelengkapan dokumen semester.</p>
          </div>
          <button 
              v-if="isKepalaOrStaff" 
              @click="downloadRekapitulasi" 
              class="btn-primary" 
              style="display: flex; gap: 5px; align-items: center;"
          >
              ⬇️ Unduh Rekapitulasi
          </button>
        </div>

        <div class="tabs">
            <button :class="['tab-btn', { active: activeTab === 'harian' }]" @click="switchTab('harian')">📅 Laporan Harian</button>
            <button :class="['tab-btn', { active: activeTab === 'semester' }]" @click="switchTab('semester')">📂 Dokumen Semester</button>
        </div>

        <div v-if="activeTab === 'harian'" class="card">
            <div class="card-header-actions">
                <div class="search-container">
                    <div class="custom-dropdown" ref="harianDropdownRef">
                        <div class="input-wrapper">
                            
                            <input 
                                type="text" 
                                v-model="searchHarianInput" 
                                @input="onSearchHarianInput"
                                @focus="isHarianDropdownOpen = true"
                                placeholder="🔍 Cari Mata Kuliah / Kelas..." 
                                class="dropdown-input"
                            />
                            <span v-if="searchHarianInput" class="clear-icon" @click="searchHarianInput = ''; onSearchHarianInput()">✖</span>
                        </div>

                        <ul v-if="isHarianDropdownOpen" class="dropdown-list">
                            <li v-for="item in filteredHarianOptions" :key="item.id" @click="selectHarianItem(item)">
                                {{ item.label }}
                            </li>
                            <li v-if="filteredHarianOptions.length === 0" class="no-result">
                                Tidak ditemukan
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="p-3 text-center">Memuat data...</div>
            <div v-else>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Kelas / Mata Kuliah</th>
                            <th>Tanggal</th>
                            <th>Modul</th>
                            <th>File</th>
                            <th>Absensi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in paginatedHarian" :key="item.id_laporan">
                            <td>
                                <strong>{{ item.Jadwal?.Kelas?.nama_mk || '-' }}</strong><br/>
                                <small class="text-muted">{{ item.Jadwal?.Kelas?.nama_kelas }} - {{ item.Jadwal?.Kelas?.hari_jam }}</small>
                            </td>
                            <td>
                                <div class="badge">
                                    {{ formatDate(item.tanggal) }}
                                </div>
                            </td>
                            <td><span :class="['status-badge', item.pembuatan_modul !== 'Ya' ? 'bg-success' : 'bg-secondary']">{{ item.pembuatan_modul }}</span></td>
                            <td>
                                <div v-if="item.LaporanModuls?.length">
                                    <button v-for="modul in item.LaporanModuls" :key="modul.id_modul" @click="downloadFile(modul.file_modul)" class="btn-xs btn-outline-primary mb-1">⬇ {{ modul.no_modul }}</button>
                                </div>
                                <span v-else class="text-muted">-</span>
                            </td>
                            <td>
                                <button v-if="item.LaporanAbsensiMonitorings?.length" @click="downloadFile(item.LaporanAbsensiMonitorings[0].file_absmon)" class="btn-xs btn-outline-primary">Lihat ✅</button>
                                <span v-else class="text-muted">-</span>
                            </td>
                        </tr>
                        <tr v-if="filteredHarianList.length === 0"><td colspan="5" class="text-center">Data tidak ditemukan.</td></tr>
                    </tbody>
                </table>
                <div class="pagination-controls" v-if="totalPageHarian > 1">
                     <button @click="prevHarian" :disabled="currentPageHarian === 1" class="btn-page">Prev</button>
                     <span>Halaman {{ currentPageHarian }} dari {{ totalPageHarian }}</span>
                     <button @click="nextHarian" :disabled="currentPageHarian === totalPageHarian" class="btn-page">Next</button>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'semester'" class="card">
            <div class="card-header-actions">
                 <div class="search-container">
                    <div class="custom-dropdown" ref="semesterDropdownRef">
                        <div class="input-wrapper">
                            
                            <input 
                                type="text" 
                                v-model="searchSemesterInput" 
                                @input="onSearchSemesterInput"
                                @focus="isSemesterDropdownOpen = true"
                                placeholder="🔍 Cari Mata Kuliah..." 
                                class="dropdown-input"
                            />
                             <span v-if="searchSemesterInput" class="clear-icon" @click="searchSemesterInput = ''; onSearchSemesterInput()">✖</span>
                        </div>
                        <ul v-if="isSemesterDropdownOpen" class="dropdown-list">
                            <li v-for="item in filteredSemesterOptions" :key="item.id" @click="selectSemesterItem(item)">
                                {{ item.label }}
                            </li>
                            <li v-if="filteredSemesterOptions.length === 0" class="no-result">Tidak ditemukan</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="p-3 text-center">Memuat data...</div>
             <div v-else>
                <table class="table">
                    <thead><tr><th>Kelas / Mata Kuliah</th><th>RPS</th><th>Kontrak Kuliah</th></tr></thead>
                    <tbody>
                        <tr v-for="jadwal in paginatedSemester" :key="jadwal.id_kelas">
                            <td>
                                <strong>{{ jadwal.Kelas?.nama_mk }}</strong> <br/>
                                <small class="text-muted">{{ jadwal.Kelas?.nama_kelas }} - {{ jadwal.Kelas?.hari_jam }}</small>
                            </td>
                            <td>
                                <button v-if="jadwal.LaporanRps" @click="downloadFile(jadwal.LaporanRps.file_rps)" class="btn-xs btn-outline-primary">Lihat ✅</button>
                                <span v-else class="text-danger">❌ Belum</span>
                            </td>
                            <td>
                                <button v-if="jadwal.LaporanKontrak" @click="downloadFile(jadwal.LaporanKontrak.file_kontrak)" class="btn-xs btn-outline-primary">Lihat ✅</button>
                                <span v-else class="text-danger">❌ Belum</span>
                            </td>
                        </tr>
                        <tr v-if="paginatedSemester.length === 0"><td colspan="3" class="text-center">Data tidak ditemukan.</td></tr>
                    </tbody>
                </table>
                 <div class="pagination-controls" v-if="totalPageSemester > 1">
                     <button @click="prevSemester" :disabled="currentPageSemester === 1" class="btn-page">Prev</button>
                     <span>Halaman {{ currentPageSemester }} dari {{ totalPageSemester }}</span>
                     <button @click="nextSemester" :disabled="currentPageSemester === totalPageSemester" class="btn-page">Next</button>
                </div>
            </div>
        </div>

      <Footer />
    </div>
  </div>
</template>