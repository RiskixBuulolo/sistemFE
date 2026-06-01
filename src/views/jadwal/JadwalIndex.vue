<script setup>
// Import Component UI
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import '../../assets/css/jadwalIndex.css';

// Import Logic yang baru kita buat
import { useJadwalIndex } from '../../assets/script/jadwalIndex.js';

// Destructuring semua logic agar bisa dipakai di template
const {
    isSidebarOpen, isLoading, showModal, isEditMode,
    form, searchQuery, currentPage, totalPages, paginatedJadwal,
    
    // Dropdown State
    searchKelas, showKelasDropdown, searchAsisten,
    showAsistenDropdown, filteredKelasOptions, filteredAsistenOptions,
    
    // Menambahkan isKepalaLabor hasil export dari composable
    isKepalaLabor,
    
    // Methods
    nextPage, prevPage, selectKelas, selectAsisten, handleBlur,
    openModal, closeModal, handleSubmit, handleDelete } = useJadwalIndex();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
        <div class="page-header">
          <h2>Jadwal & Penugasan Asisten</h2>
          <button v-if="!isKepalaLabor" @click="openModal()" class="btn-primary">+ Tugaskan Asisten</button>
        </div>

        <div class="card">
          <div class="search-container">
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="🔍 Cari Mata Kuliah atau Nama Asisten..." 
                class="search-input"
            />
          </div>

          <div v-if="isLoading" class="loading">Memuat...</div>
          
          <div v-else>
            <table class="table">
                <thead>
                <tr>
                    <th>Hari & Jam</th> 
                    <th>Mata Kuliah</th>
                    <th>Ruangan</th>
                    <th>Asisten 1</th>
                    <th>Asisten 2</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="group in paginatedJadwal" :key="group.id_kelas">
                    <td><span class="badge-time">{{ group.mk_info.hari_jam || '-' }}</span></td>
                    <td>
                        <strong>{{ group.mk_info.nama_mk }}</strong> - {{ group.mk_info.nama_kelas }}<br>
                        <small class="text-muted">{{ group.mk_info.nama_dosen }}</small>
                    </td>
                    <td>{{ group.mk_info.ruangan || '-' }}</td>
                    
                    <td>
                        <div v-if="group.assistants[0]" class="asisten-cell">
                            <span>{{ group.assistants[0].user.nama_lengkap }}</span>
                            <div class="action-mini" v-if="!isKepalaLabor">
                                <button @click="openModal(group.assistants[0], group.id_kelas)" class="btn-xs btn-edit">✏️</button>
                                <button @click="handleDelete(group.assistants[0].id_jadwal)" class="btn-xs btn-delete">🗑️</button>
                            </div>
                        </div>
                        <span v-else class="text-muted">- Kosong -</span>
                    </td>

                    <td>
                        <div v-if="group.assistants[1]" class="asisten-cell">
                            <span>{{ group.assistants[1].user.nama_lengkap }}</span>
                            <div class="action-mini" v-if="!isKepalaLabor">
                                <button @click="openModal(group.assistants[1], group.id_kelas)" class="btn-xs btn-edit">✏️</button>
                                <button @click="handleDelete(group.assistants[1].id_jadwal)" class="btn-xs btn-delete">🗑️</button>
                            </div>
                        </div>
                        <span v-else class="text-muted">- Kosong -</span>
                    </td>
                </tr>
                <tr v-if="paginatedJadwal.length === 0">
                    <td colspan="5" class="text-center">Data tidak ditemukan.</td>
                </tr>
                </tbody>
            </table>

            <div class="pagination-controls" v-if="totalPages > 1">
                <button @click="prevPage" :disabled="currentPage === 1" class="btn-page">Sebelumnya</button>
                <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-page">Selanjutnya</button>
            </div>
          </div>
        </div>
      <Footer />
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditMode ? 'Ganti Asisten' : 'Tugaskan Asisten' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="form-grid">
            
            <div class="form-group full-width relative">
                <label>Kelas</label>
                <input 
                    type="text" 
                    v-model="searchKelas" 
                    placeholder="Ketik Nama MK..." 
                    class="search-select-input"
                    @focus="showKelasDropdown = true"
                    @blur="handleBlur('kelas')"
                    :disabled="isEditMode"
                />
                <ul v-if="showKelasDropdown && !isEditMode" class="dropdown-list">
                    <li v-for="k in filteredKelasOptions" :key="k.id" @mousedown.prevent="selectKelas(k)">
                        {{ k.label }}
                    </li>
                    <li v-if="filteredKelasOptions.length === 0" class="no-result">
                        Kelas tidak ditemukan / sudah penuh.
                    </li>
                </ul>
                <small v-if="!isEditMode" class="text-hint">* Ketik untuk mencari kelas.</small>
            </div>

            <div class="form-group full-width relative">
                <label>Pilih Asisten</label>
                <input 
                    type="text" 
                    v-model="searchAsisten" 
                    placeholder="Ketik Nama Asisten..." 
                    class="search-select-input"
                    @focus="showAsistenDropdown = true"
                    @blur="handleBlur('asisten')"
                />
                <ul v-if="showAsistenDropdown" class="dropdown-list">
                    <li v-for="a in filteredAsistenOptions" :key="a.id" @mousedown.prevent="selectAsisten(a)">
                        {{ a.label }}
                    </li>
                    <li v-if="filteredAsistenOptions.length === 0" class="no-result">
                        Asisten tidak ditemukan.
                    </li>
                </ul>
                <small class="text-hint">* Ketik untuk mencari asisten.</small>
            </div>

            <div class="modal-actions full-width">
                <button type="button" @click="showModal = false" class="btn-secondary">Batal</button>
                <button type="submit" class="btn-primary">Simpan</button>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>