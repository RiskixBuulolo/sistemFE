<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import { useAsistenLaporan } from '../../assets/script/asistenInputLaporan.js';
import '../../assets/css/asistenInputLaporan.css'; 

// Panggil Function Logic
const {
    isSidebarOpen, activeTab, jadwalList, isLoading,
    formHarian, formSemester,
    fileInputAbsRef, fileInputModulRef, fileInputRpsRef, fileInputKontrakRef,
    handleFileChange, submitLaporanHarian, submitRps, submitKontrak, 
    searchQuery, isDropdownOpen, filteredJadwalList, selectJadwal, toggleDropdown,
    searchQuerySemester, isDropdownOpenSemester, filteredJadwalSemester, selectJadwalSemester, toggleDropdownSemester,
    jadwalStatusList // Tambahan untuk tab status
} = useAsistenLaporan();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
      <div class="content-wrapper">
        <div class="page-header">
          <h1 class="title">Input Laporan Asisten</h1>
          <p class="subtitle">Laporan kegiatan harian, upload dokumen semester, dan status file.</p>
        </div>

        <div class="tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'harian' }" 
            @click="activeTab = 'harian'">
            📅 Laporan Harian
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'semester' }" 
            @click="activeTab = 'semester'">
            📂 Dokumen Semester
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'status' }" 
            @click="activeTab = 'status'">
            📊 Status Upload
          </button>
        </div>

        <div v-if="activeTab === 'harian'" class="card form-card">
          <h3 class="card-title">Form Kegiatan Harian</h3>
          
          <div class="form-group relative-container">
            <label>Pilih Jadwal Praktikum (Ketik untuk mencari)</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="-- Ketik Nama MK atau Hari --"
              v-model="searchQuery"
              @focus="isDropdownOpen = true"
              @click="toggleDropdown"
            />
            
            <div v-if="isDropdownOpen" class="custom-dropdown-list">
                <div v-for="j in filteredJadwalList" :key="j.id_jadwal" class="dropdown-item" @click="selectJadwal(j)">
                    <div class="item-title">{{ j.Kelas?.nama_mk || 'MK Tanpa Nama' }}</div>
                    <div class="item-subtitle">{{ j.hari }} • Kelas {{ j.Kelas?.nama_kelas }}</div>
                </div>
                <div v-if="filteredJadwalList.length === 0" class="dropdown-item empty">Jadwal tidak ditemukan.</div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Tanggal Kegiatan</label>
            <input type="date" v-model="formHarian.tanggal" class="form-control" />
          </div>

          <div class="form-group mt-3">
             <label>Upload Bukti Absensi & Monitoring (Foto/PDF/Excel)</label>
             <input type="file" ref="fileInputAbsRef" @change="(e) => handleFileChange(e, 'absmon')" class="form-control" />
             <small class="text-muted">Upload satu file yang mencakup bukti absensi dan monitoring kelas.</small>
          </div>

          <hr class="divider">

          <div class="form-group">
            <label>Siapa Yang Pembuatan Modul?</label>
            <div class="radio-group">
              <label><input type="radio" v-model="formHarian.pembuatan_modul" value="Asisten"> Asisten</label>
              <label><input type="radio" v-model="formHarian.pembuatan_modul" value="Dosen"> Dosen</label>
              <label><input type="radio" v-model="formHarian.pembuatan_modul" value="Asisten & Dosen"> Asisten & Dosen</label>
              <label><input type="radio" v-model="formHarian.pembuatan_modul" value="Tidak"> Tidak Ada</label>
            </div>
          </div>

          <div v-if="formHarian.pembuatan_modul !== 'Tidak'" class="sub-form">
            <div class="row">
              <div class="col-half">
                <label>Jumlah Modul</label>
                <input type="number" v-model="formHarian.jumlah_modul" class="form-control" min="1" />
              </div>
              <div class="col-half">
                <label>Nama/No Modul</label>
                <input type="text" v-model="formHarian.no_modul" class="form-control" placeholder="Cth: Modul 3" />
              </div>
            </div>
            <div class="form-group mt-2">
              <label>Upload File Modul</label>
              <input type="file" ref="fileInputModulRef" @change="(e) => handleFileChange(e, 'modul')" class="form-control" />
            </div>
          </div>

          <div class="form-actions">
            <button @click="submitLaporanHarian" :disabled="isLoading" class="btn btn-primary btn-lg">
              {{ isLoading ? 'Menyimpan...' : 'Simpan Laporan Harian' }}
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'semester'" class="card form-card">
          <h3 class="card-title">Upload Dokumen Semester</h3>
          
          <div class="form-group relative-container">
            <label>Pilih Jadwal / Mata Kuliah (Ketik untuk mencari)</label>
            <input type="text" class="form-control" placeholder="-- Ketik Nama MK --" v-model="searchQuerySemester" @focus="isDropdownOpenSemester = true" @click="toggleDropdownSemester" />
            
            <div v-if="isDropdownOpenSemester" class="custom-dropdown-list">
                <div v-for="j in filteredJadwalSemester" :key="j.id_jadwal" class="dropdown-item" @click="selectJadwalSemester(j)">
                    <div class="item-title">{{ j.Kelas?.nama_mk || 'MK?' }}</div>
                    <div class="item-subtitle">{{ j.Kelas?.nama_kelas }} • {{ j.hari }}</div>
                </div>
                <div v-if="filteredJadwalSemester.length === 0" class="dropdown-item empty">Jadwal tidak ditemukan.</div>
            </div>
          </div>

          <div class="upload-section">
            <div class="upload-item">
              <h4>1. Rencana Pembelajaran Semester (RPS)</h4>
              <p>Upload file RPS terbaru untuk mata kuliah ini.</p>
              <input type="file" ref="fileInputRpsRef" @change="(e) => handleFileChange(e, 'rps')" class="form-control mb-2" />
              <button @click="submitRps" :disabled="isLoading" class="btn btn-secondary">Upload RPS</button>
            </div>
            <hr>
            <div class="upload-item">
              <h4>2. Kontrak Kuliah</h4>
              <p>Upload dokumen kontrak kuliah yang telah disepakati.</p>
              <input type="file" ref="fileInputKontrakRef" @change="(e) => handleFileChange(e, 'kontrak')" class="form-control mb-2" />
              <button @click="submitKontrak" :disabled="isLoading" class="btn btn-secondary">Upload Kontrak</button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'status'" class="card form-card">
          <h3 class="card-title">Status File Terupload</h3>
          <p class="subtitle mb-4">Pantau kelengkapan dokumen yang telah dikumpulkan pada kelas yang Anda ampu.</p>

          <div class="table-responsive">
            <table class="status-table">
              <thead>
                <tr>
                  <th>Mata Kuliah & Kelas</th>
                  <th>RPS</th>
                  <th>Kontrak Kuliah</th>
                  <th>Laporan Harian (Terakhir)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="jadwal in jadwalStatusList" :key="jadwal.id_jadwal">
                  <td>
                    <strong>{{ jadwal.nama_mk }}</strong><br>
                    <span class="text-muted">Kelas {{ jadwal.nama_kelas }} | {{ jadwal.hari }}</span>
                  </td>
                  
                  <td>
                    <span v-if="jadwal.rps_uploaded" class="badge bg-success">✅ Selesai</span>
                    <span v-else class="badge bg-danger">❌ Belum</span>
                    <div v-if="jadwal.rps_uploaded" class="uploader-info">
                      Oleh: <strong>{{ jadwal.rps_uploader_role }}</strong><br>
                      ({{ jadwal.rps_uploader_nama }})
                    </div>
                  </td>
                  
                  <td>
                    <span v-if="jadwal.kontrak_uploaded" class="badge bg-success">✅ Selesai</span>
                    <span v-else class="badge bg-danger">❌ Belum</span>
                    <div v-if="jadwal.kontrak_uploaded" class="uploader-info">
                      Oleh: <strong>{{ jadwal.kontrak_uploader_role }}</strong><br>
                      ({{ jadwal.kontrak_uploader_nama }})
                    </div>
                  </td>
                  
                  <td>
                    <span class="badge bg-info">{{ jadwal.total_laporan }} Laporan</span>
                    <div v-if="jadwal.total_laporan > 0" class="uploader-info mt-1">
                      Terakhir oleh: <strong>{{ jadwal.last_laporan_role }}</strong><br>
                      ({{ jadwal.last_laporan_nama }})
                    </div>
                  </td>
                </tr>
                <tr v-if="jadwalStatusList.length === 0">
                  <td colspan="4" class="text-center text-muted">Belum ada data jadwal atau belum ada file yang di-upload.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div> 
      <Footer />
    </div>
  </div>
</template>