<script setup>
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import Swal from 'sweetalert2'; // Menggunakan SweetAlert agar popup lebih elegan

const authStore = useAuthStore();
const router = useRouter();

const emit = defineEmits(['toggle-sidebar']);

// Data User
const namaUser = computed(() => authStore.user?.nama_lengkap || authStore.user?.username || 'User');
const roleUser = computed(() => authStore.userRole?.replace('_', ' ').toUpperCase() || 'GUEST');

// Mengambil 1 atau 2 huruf pertama untuk Avatar
const userInitials = computed(() => {
  return namaUser.value.substring(0, 2).toUpperCase();
});

const handleLogout = () => {
  // Mengganti confirm() bawaan dengan SweetAlert2
  Swal.fire({
    title: 'Keluar Aplikasi?',
    text: "Anda harus login kembali untuk mengakses sistem.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e74c3c', // Merah
    cancelButtonColor: '#94a3b8', // Abu-abu modern
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    reverseButtons: true // Tombol batal di kiri, aksi di kanan (Best Practice UX)
  }).then((result) => {
    if (result.isConfirmed) {
      authStore.logout();
    }
  });
};
</script>

<template>
  <nav class="modern-navbar">
    <div class="navbar-left">
      <button class="btn-icon hamburger" @click="$emit('toggle-sidebar')" title="Toggle Menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <div class="brand">
        <h3>Sistem Laboratorium</h3>
      </div>
    </div>

    <div class="navbar-right">
      <div class="user-profile">
        <div class="user-info">
          <span class="nama">{{ namaUser }}</span>
          <span class="role-badge">{{ roleUser }}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <button @click="handleLogout" class="btn-logout" title="Keluar Aplikasi">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span class="logout-text">Logout</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* =====================
   NAVBAR BASE (GLASSMORPHISM)
===================== */
.modern-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* Efek Glassmorphism */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  padding: 0 24px;
  min-height: 50px; /* Lebih lega, ideal untuk klik/tap */
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.navbar-left, .navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* =====================
   LEFT SIDE: ICON & BRAND
===================== */
.btn-icon.hamburger {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #475569; /* Slate 600 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon.hamburger:hover {
  background-color: #f1f5f9;
  color: #2563eb; /* Biru modern saat dihover */
  transform: scale(1.05);
}

.brand h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.3px;
}

/* =====================
   RIGHT SIDE: USER PROFILE & AVATAR
===================== */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nama {
  font-weight: 600;
  font-size: 14px;
  color: #334155;
  line-height: 1.2;
}

.role-badge {
  font-size: 11px;
  color: #2563eb; /* Warna teks senada tema */
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Garis Pemisah Vertikal */
.divider {
  width: 1px;
  height: 32px;
  background-color: #e2e8f0;
  margin: 0 4px;
}

/* =====================
   LOGOUT BUTTON
===================== */
.btn-logout {
  background-color: transparent;
  color: #ef4444; /* Soft Red */
  border: 1px solid transparent;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-logout:hover {
  background-color: #fef2f2; /* Merah super pudar */
  border-color: #fca5a5;
  color: #dc2626;
}

/* =====================
   RESPONSIVE (MOBILE)
===================== */
@media (max-width: 640px) {
  .brand h3 {
    display: none; /* Sembunyikan teks brand di layar sangat kecil */
  }
  
  .user-info {
    display: none; /* Sembunyikan nama, sisakan avatar saja */
  }
  
  .logout-text {
    display: none; /* Icon saja untuk tombol logout di HP */
  }
  
  .btn-logout {
    padding: 8px; /* Bentuk kotak kecil di HP */
  }
}
</style>