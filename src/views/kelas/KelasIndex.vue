<script setup>
// Import UI Components
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import '../../assets/css/KelasIndex.css';

// Import Logic yang baru dibuat
import { useKelasIndex } from '../../assets/script/kelasIndex.js';

// Destructuring Logic
const {
    // State
    isSidebarOpen, isLoading, showModal, isEditMode, form, fileInput, 
    searchQuery, currentPage, totalPages, paginatedKelas, itemsPerPage,

    // Methods
    nextPage, prevPage, triggerFileInput, handleFileUpload,
    openModal, handleSubmit, handleDelete, handleDeleteAll } = useKelasIndex();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      

        <div class="page-header">
          <h2>Manajemen Kelas (Master Data)</h2>
          <div class="button-group">
             <input type="file" ref="fileInput" @change="handleFileUpload" accept=".xlsx, .xls" style="display:none"/>
             
             <button @click="triggerFileInput" class="btn-success" style="margin-right: 10px;">
                📥 Import Excel
             </button>
             
             <button @click="openModal()" class="btn-primary">+ Tambah Manual</button>

             <button @click="handleDeleteAll" class="btn-danger">
                🗑️ Hapus Semua
             </button>
          </div>
        </div>

        <div class="card">
            <div class="search-container">
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="🔍 Cari MK, Kode, Ruang, Kelas, atau Dosen..." 
                    class="search-input"
                />
            </div>

          <div v-if="isLoading" class="loading">Memuat data...</div>
          
          <div v-else>
            <table class="table">
                <thead>
                <tr>
                    <th>No</th>
                    <th>MK / Kode</th>
                    <th>Kelas</th>
                    <th>Hari & Jam</th> 
                    <th>Ruang</th>       
                    <th>Dosen</th>
                    <th>Aksi</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in paginatedKelas" :key="item.id_kelas">
                    <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                    <td class="text-12px">
                        <strong>{{ item.nama_mk }}</strong>
                        <!-- <small class="text-muted">{{ item.nama_kelas }} - {{ item.hari_jam }}</small> -->
                    </td>
                    <td class="text-center">{{ item.nama_kelas }}</td>
                    
                    <td><span class="badge-time">{{ item.hari_jam || '-' }}</span></td>
                    <td>{{ item.ruangan || '-' }}</td>
                    
                    <td>{{ item.nama_dosen }}</td>
                    <td>
                    <button @click="openModal(item)" class="btn-sm btn-edit">Edit</button>
                    <button @click="handleDelete(item.id_kelas)" class="btn-sm btn-delete">Hapus</button>
                    </td>
                </tr>
                <tr v-if="paginatedKelas.length === 0">
                    <td colspan="7" class="text-center">Data tidak ditemukan.</td>
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
        <h3>{{ isEditMode ? 'Edit Kelas' : 'Tambah Kelas Manual' }}</h3>
        <form @submit.prevent="handleSubmit" class="form-grid">
            <div class="form-group"><label>Nama MK</label><input v-model="form.nama_mk" required /></div>
            <div class="form-group"><label>Kode MK</label><input v-model="form.kode_mk" /></div>
            <div class="form-group"><label>Dosen</label><input v-model="form.nama_dosen" required /></div>
            
            <div class="form-row">
                <div class="form-group"><label>Kelas</label><input v-model="form.nama_kelas" placeholder="A" required /></div>
                <div class="form-group"><label>SKS</label><input v-model="form.sks" type="number" /></div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Hari & Jam</label>
                    <input v-model="form.hari_jam" placeholder="Contoh: Senin 08:00 - 10:00" required />
                </div>
                <div class="form-group">
                    <label>Ruangan</label>
                    <input v-model="form.ruangan" placeholder="Lab 1" required />
                </div>

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
