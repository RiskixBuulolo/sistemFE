<script setup>
// 1. Import UI Components & CSS
import Navbar from '../../components/common/Navbar.vue';
import Sidebar from '../../components/common/Sidebar.vue';
import Footer from '../../components/common/Footer.vue';
import '../../assets/css/UserProfile.css';

// 2. Import Logic
import { useUserProfile } from '../../assets/script/UserProfile'; // Sesuaikan path

// 3. Destructure (Ambil variable yang dibutuhkan Template)
const {
    authStore,
    isSidebarOpen,
    isLoading,
    riwayatTerakhir,
    form,
    formatRole,
    formatDate,
    updateProfile
    // fetchProfile tidak perlu di-return ke template kalau tidak dipanggil lewat tombol
} = useUserProfile();
</script>

<template>
  <div class="app-container">
    <Sidebar :isOpen="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    
    <div class="main-content" :class="{ 'shifted': isSidebarOpen }">
      <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
      <div class="content-wrapper">
        <div class="page-header">
          <div>
            <h2>Profil Saya</h2>
            <p class="text-muted">Kelola informasi pribadi dan keamanan akun Anda.</p>
          </div>
        </div>

        <div v-if="isLoading && !form.nama_lengkap" class="loading-state">
            <div class="spinner"></div> Memuat data profil...
        </div>

        <div v-else class="profile-grid">
            <div class="left-col">
                <div class="card profile-card">
                    <div class="profile-header-bg"></div>
                    <div class="avatar-wrapper">
                        <div class="avatar-large">
                            {{ form.nama_lengkap ? form.nama_lengkap.charAt(0) : 'U' }}
                        </div>
                    </div>
                    
                    <div class="profile-body">
                        <h3 class="user-name">{{ form.nama_lengkap }}</h3>
                        <span class="badge-role">{{ formatRole(form.role) }}</span>
                        
                        <div class="info-list">
                            <div class="info-item">
                                <span class="label">Username</span>
                                <span class="val">{{ form.username }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Email</span>
                                <span class="val">{{ form.email || '-' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mt-4">
                    <div class="card-header-simple">
                        <h4>🕒 Aktivitas Terakhir</h4>
                    </div>
                    <div class="activity-scroll">
                        <ul class="timeline">
                            <li v-for="log in riwayatTerakhir" :key="log.id_riwayat">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <span class="time">{{ formatDate(log.waktu_aktivitas) }}</span>
                                    <p>{{ log.aktivitas }}</p>
                                </div>
                            </li>
                            <li v-if="riwayatTerakhir.length === 0" class="text-muted text-center py-3">
                                Belum ada aktivitas.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="right-col">
                <div class="card">
                    <div class="card-header">
                        <h3>✏️ Edit Profil</h3>
                    </div>
                    
                    <form @submit.prevent="updateProfile" class="form-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" v-model="form.nama_lengkap" class="modern-input" required />
                            </div>
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" v-model="form.username" class="modern-input" required />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" v-model="form.email" class="modern-input" />
                        </div>

                        <div v-if="form.role === 'asisten'" class="special-section">
                            <h4 class="section-title">🎓 Data Mahasiswa</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>NPM</label>
                                    <input type="text" v-model="form.npm" class="modern-input" placeholder="Masukkan NPM" />
                                </div>
                                <div class="form-group">
                                    <label>No. HP / WhatsApp</label>
                                    <input type="text" v-model="form.no_hp" class="modern-input" placeholder="08xxxxxxxx" />
                                </div>
                            </div>
                        </div>

                        <hr class="divider">

                        <div class="password-section">
                            <h4 class="section-title text-warning">🔒 Keamanan (Opsional)</h4>
                            <p class="text-hint">Kosongkan jika tidak ingin mengubah password.</p>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Password Baru</label>
                                    <input type="password" v-model="form.password" class="modern-input" placeholder="••••••" />
                                </div>
                                <div class="form-group">
                                    <label>Konfirmasi Password</label>
                                    <input type="password" v-model="form.confirmPassword" class="modern-input" placeholder="••••••" />
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-save" :disabled="isLoading">
                                {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
      
      <Footer />
    </div>
  </div>
</template>