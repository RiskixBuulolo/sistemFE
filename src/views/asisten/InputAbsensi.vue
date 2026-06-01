<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import { useAsistenAbsensi } from '../../assets/script/asistenInputAbsensi.js';
import '../../assets/css/asistenInputAbsensi.css'; 

// Panggil Function Logic
const {
  isSidebarOpen, isInputMode, router,
  searchQuery, isLoadingTable, paginatedJadwal, totalPages, currentPage, nextPage, prevPage,
  gotoInput, deleteAbsen, canEditOrDelete,
  openHistoryModal, closeHistoryModal, isHistoryModalOpen, selectedMatkulName, selectedHistoryList,
  form, isLoadingForm, locationError, photoPreview, videoRef, canvasRef,
  takePhoto, retakePhoto, submitAbsensi
} = useAsistenAbsensi();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="content-wrapper">

        <div v-if="!isInputMode" class="mode-table">
          <div class="header-page">
            <h1 class="title">Manajemen Absensi</h1>
            <p class="subtitle">Daftar jadwal dan status absensi Anda.</p>
          </div>

          <div class="search-bar mb-3">
             <input 
               v-model="searchQuery" 
               type="text" 
               class="form-control search-input" 
               placeholder="🔍 Cari Mata Kuliah, Dosen, atau Hari..."
             />
          </div>

          <div v-if="isLoadingTable" class="loading-state">
            <div class="spinner"></div> Memuat data...
          </div>

          <div v-else class="table-container card">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Mata Kuliah / Jadwal</th>
                  <th>Status Hari Ini</th>
                  <th>Bukti Hari Ini</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedJadwal.length === 0">
                   <td colspan="4" class="text-center">
                     {{ searchQuery ? 'Tidak ada data yang cocok dengan pencarian.' : 'Tidak ada jadwal aktif.' }}
                   </td>
                </tr>

                <tr v-for="item in paginatedJadwal" :key="item.id_jadwal">
                  <td>
                    <div class="mk-info">
                      <span class="mk-name">{{ item.Kelas?.nama_mk || 'MK Unknown' }}</span>
                      
                      <span class="mk-time">
                        <strong>
                          {{ item.hari || (item.Kelas?.hari_jam ? item.Kelas.hari_jam.split(' ')[0] : '-') }},
                        </strong>
                          {{ item.hari || (item.Kelas?.hari_jam ? item.Kelas.hari_jam.split(' ').slice(1, 4).join(' ') : '-') }}
                      </span>

                      <span class="mk-dosen">{{ item.Kelas?.nama_dosen }}</span>
                    </div>
                  </td>

                  <td>
  <span v-if="item.absenData" 
        class="badge"
        :class="{
          'bg-success': item.absenData.status === 'Hadir',
          'bg-warning': item.absenData.status === 'Izin' || item.absenData.status === 'Hadir - Terlambat',
          'bg-danger': item.absenData.status === 'Sakit'
        }">
    {{ item.absenData.status }}
    ({{ item.absenData.waktu_absen }})
  </span>
  <span v-else class="badge bg-secondary">Belum Absen Hari Ini</span>
</td>

                  <td>
                    <div v-if="item.absenData && item.absenData.foto_absensi">
                      <img :src="`http://localhost:5000/public/uploads/absensi/${item.absenData.foto_absensi}`" 
                           class="thumb-img" 
                           alt="Bukti"
                           @error="$event.target.src = 'https://via.placeholder.com/50?text=Err'">
                    </div>
                    <span v-else>-</span>
                  </td>

                  <td>
                    <button v-if="!item.absenData" 
                            @click="gotoInput(item.id_jadwal)" 
                            class="btn-action btn-primary">
                      📷 Absen Masuk
                    </button>

                    <div v-else>
                      <div v-if="canEditOrDelete(item.absenData.waktu_absen, item.absenData.tanggal)">
                        <button @click="deleteAbsen(item.absenData.id_absensi)" 
                                class="btn-action btn-danger-outline">
                          🗑️ Hapus
                        </button>
                        <small class="timer-info">Bisa dihapus dlm 10 mnt</small>
                      </div>
                      <div v-else>
                        <span class="text-locked">🔒 Terkunci</span>
                      </div>
                    </div>

                    <button @click="openHistoryModal(item)" class="btn-history-link mt-2">
                        📜 Lihat Riwayat
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="totalPages > 1" class="pagination-controls">
              <button @click="prevPage" :disabled="currentPage === 1" class="btn-page">
                &laquo; Prev
              </button>
              <span class="page-info">Hal {{ currentPage }} dari {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-page">
                Next &raquo;
              </button>
            </div>

          </div>
        </div>


        <div v-else class="mode-form">
          <div class="page-header">
            <button @click="router.push('/absensi')" class="btn-back">← Kembali ke Tabel</button>
            <h1 class="title">Input Absensi</h1>
          </div>

          <div class="grid-layout">
            <div class="card form-card">
              <div class="camera-box">
                <video v-show="!photoPreview" ref="videoRef" autoplay playsinline class="video-feed"></video>
                <img v-if="photoPreview" :src="photoPreview" class="photo-preview" />
                <canvas ref="canvasRef" style="display: none;"></canvas>
              </div>
              <div class="camera-controls">
                <button v-if="!photoPreview" @click="takePhoto" class="btn btn-primary btn-block">📸 Ambil Foto</button>
                <button v-else @click="retakePhoto" class="btn btn-secondary btn-block">🔄 Foto Ulang</button>
              </div>

              <div class="mt-3">
                <div class="location-box" :class="{'error': locationError}">
                  <span v-if="locationError">{{ locationError }}</span>
                  <span v-else-if="form.latitude">📍 Lokasi Terkunci: {{ form.latitude }}, {{ form.longitude }}</span>
                  <span v-else>Mencari GPS...</span>
                </div>
                
                <label class="section-label mt-3">Status Kehadiran</label>
                <select v-model="form.status" class="form-select">
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                </select>

                <button @click="submitAbsensi" 
                        :disabled="isLoadingForm || !form.latitude || !form.foto" 
                        class="btn btn-success btn-lg btn-block mt-4">
                  {{ isLoadingForm ? 'Mengirim...' : '✅ Kirim Absensi' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isHistoryModalOpen" class="modal-overlay" @click.self="closeHistoryModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Riwayat: {{ selectedMatkulName }}</h3>
              <button @click="closeHistoryModal" class="btn-close">×</button>
            </div>
            
            <div class="modal-body">
              <div v-if="selectedHistoryList.length === 0" class="empty-state">
                <p>Belum ada riwayat absensi.</p>
              </div>

              <ul v-else class="history-list">
                <li v-for="log in selectedHistoryList" :key="log.id_absensi" class="history-item">
                  <div class="history-info">
                    <div class="history-date">
                      <strong>{{ log.tanggal }}</strong>
                      <small> Pukul {{ log.waktu_absen }}</small>
                    </div>
                    <div class="history-status">
  <span class="badge" 
    :class="{
      'bg-success': log.status === 'Hadir',
      'bg-warning': log.status === 'Izin' || log.status === 'Hadir - Terlambat',
      'bg-danger': log.status === 'Sakit'
    }">
    {{ log.status }}
  </span>
</div>
                  </div>
                  <div class="history-photo">
                    <a :href="`http://localhost:5000/public/uploads/absensi/${log.foto_absensi}`" target="_blank">
                      <img :src="`http://localhost:5000/public/uploads/absensi/${log.foto_absensi}`" alt="Bukti">
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
    </div>
    <Footer />
  </div>
  </div>
</template>

<style scoped>
/* Tombol Back */
.btn-back {
  padding: 10px;
  border-radius: 12px;
  font-size: medium;
  font-weight: 700;
  /* border: 1px solid #ccc; */
  cursor: pointer;
  background-color: transparent;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background-color: rgb(81, 158, 176);
  color: white;
  /* border-color: rgb(81, 158, 176); */
}

/* 1. Perbaikan Layout Form agar tidak melebar di layar besar */
.grid-layout {
  display: flex;
  justify-content: center; /* Posisikan form di tengah layar */
  align-items: flex-start;
  width: 100%;
  padding: 20px 0;
}

/* Ganti background red Anda dengan styling card yang rapi */
.card.form-card {
  width: 100%;
  max-width: 500px; /* KUNCI: Batasi lebar form maksimal 500px */
  background-color: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Efek bayangan lembut */
}

/* 2. Perbaikan Wadah Kamera */
.camera-box {
  width: 100%;
  aspect-ratio: 4 / 3; /* Jaga rasio kamera tetap 4:3 (standar foto) */
  background-color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 3. Perbaikan Feed Video & Preview Foto agar tidak gepeng/distorsi */
.video-feed, 
.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover; /* KUNCI: Memotong gambar secara proporsional agar memenuhi wadah tanpa distorsi */
  border-radius: 12px;
  transform: scaleX(-1);
}

/* Penyesuaian tombol kamera */
.camera-controls .btn-block {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
}

/* Jarak antar elemen di dalam form */
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mb-3 { margin-bottom: 1rem; }
</style>