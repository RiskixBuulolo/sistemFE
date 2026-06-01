<script setup>
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import '../../assets/css/ManajemenStaff.css';

import { useManajemenStaff } from '../../assets/script/ManajemenStaff'; // Pastikan path sesuai

// 3. Panggil fungsi dan destructure semua variabel/method yang dibutuhkan template
const { authStore, isSidebarOpen, isLoading, showModal, isEditMode, searchQuery,
        currentPage, itemsPerPage, form, paginatedUsers, totalPages,
       formatRole, getRoleBadgeClass, getJumlahKelas, nextPage, prevPage, openModal,
       handleSubmit, handleDelete } = useManajemenStaff();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
        <div class="page-header">
          <h2 v-if="authStore.userRole === 'staff_labor'">Manajemen Asisten</h2>
          <h2 v-else>Manajemen Staff & Asisten</h2>

          <button @click="openModal()" class="btn-primary">
            + Tambah {{ authStore.userRole === 'staff_labor' ? 'Asisten' : 'User' }}
          </button>
        </div>

        <div class="card">
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="🔍 Cari Nama, Email, Role, atau NPM..." 
              class="search-input"
            />
          </div>

          <div v-if="isLoading" class="loading">Memuat data...</div>
          
          <div v-else>
            <table class="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>Role</th>
                  <th>Jml. Kelas</th>
                  <th>Kontak</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, index) in paginatedUsers" :key="user.id_users">
                  <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td>
                    <div class="user-name">{{ user.nama_lengkap }}</div>
                    <small class="text-muted">@{{ user.username }}</small>
                  </td>
                  <td>
                    <span :class="['badge', getRoleBadgeClass(user.role)]">
                        {{ formatRole(user.role) }}
                    </span>
                    <div v-if="user.role === 'asisten' && user.DataAsisten" class="npm-tag">
                        NPM: {{ user.DataAsisten.npm }}
                    </div>
                  </td>
                  <td class="text-center">
                      <span v-if="user.role === 'asisten'" class="badge-count">
                          {{ getJumlahKelas(user) }} 
                      </span>
                      <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="contact-info">📧 {{ user.email }}</div>
                    <div v-if="user.DataAsisten?.no_hp" class="contact-info">📞 {{ user.DataAsisten.no_hp }}</div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="openModal(user)" class="btn-sm btn-edit">Edit</button>
                      <button @click="handleDelete(user.id_users)" class="btn-sm btn-delete">Hapus</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedUsers.length === 0">
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
        <h3>{{ isEditMode ? 'Edit User' : 'Tambah User Baru' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="form-grid">
            <div class="form-group">
                <label>Nama Lengkap</label>
                <input v-model="form.nama_lengkap" type="text" required />
            </div>
            <div class="form-group">
                <label>Username</label>
                <input v-model="form.username" type="text" required />
            </div>
            <div class="form-group">
                <label>Email</label>
                <input v-model="form.email" type="email" required />
            </div>
            
            <div class="form-group">
                <label>Role</label>
                <select v-model="form.role" class="select-input" :disabled="authStore.userRole === 'staff_labor'">
                    <option value="asisten">Asisten</option>
                    <option v-if="authStore.userRole !== 'staff_labor'" value="staff_labor">Staff Labor</option>
                    <option v-if="authStore.userRole !== 'staff_labor'" value="kepala_labor">Kepala Labor</option>
                </select>
            </div>

            <div v-if="!isEditMode" class="form-group full-width">
                <label>Password</label>
                <input v-model="form.password" type="password" placeholder="Masukkan password user" required />
            </div>

            <div v-if="form.role === 'asisten'" class="form-row full-width section-asisten">
                <div class="form-group">
                    <label>NPM (Mahasiswa)</label>
                    <input v-model="form.npm" type="text" placeholder="Contoh: 1195011xxxx" />
                </div>
                <div class="form-group">
                    <label>No HP / WA</label>
                    <input v-model="form.no_hp" type="text" placeholder="08xxxxxxxx" />
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