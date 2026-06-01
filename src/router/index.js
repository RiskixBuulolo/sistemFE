import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// === 1. VIEWS AUTH ===
import LoginView from '../views/auth/LoginView.vue';
import ForgotPassword from '../views/auth/ForgotPassword.vue';
import VerifyOtp from '../views/auth/VerifyOtp.vue';
import ResetPassword from '../views/auth/ResetPassword.vue';

// === 2. VIEWS DASHBOARD ===
import KepalaDashboard from '../views/dashboard/KepalaDashboard.vue';
import StaffDashboard from '../views/dashboard/StaffDashboard.vue';
import AsistenDashboard from '../views/dashboard/AsistenDashboard.vue';

// === 3. FEATURE VIEWS (KEPALA & STAFF) ===
import KelasIndex from '../views/kelas/KelasIndex.vue';
import ManajemenStaff from '../views/user/ManajemenStaff.vue';
// Note: Pastikan kamu membuat file-file di bawah ini nanti
import JadwalIndex from '../views/jadwal/JadwalIndex.vue'; 
import MonitoringAbsensi from '../views/absensi/MonitoringAbsensi.vue';
import LaporanMasuk from '../views/laporan/LaporanMasuk.vue';
import RiwayatLabor from '../views/riwayat/RiwayatLabor.vue';

// === 4. FEATURE VIEWS (ASISTEN) ===
import JadwalSaya from '../views/asisten/JadwalSaya.vue';
import InputAbsensi from '../views/asisten/InputAbsensi.vue';
import InputLaporan from '../views/asisten/InputLaporan.vue';

// === 5. COMMON VIEWS ===
import UserProfile from '../views/user/UserProfile.vue';

const routes = [
  // --- ROOT ---
  { 
    path: '/', 
    name: 'home', 
    redirect: '/login' 
  },

  // --- AUTH ---
  { path: '/login', name: 'login', component: LoginView },
  { path: '/forgot-password', name: 'auth.forgot', component: ForgotPassword },
  { path: '/verify-otp', name: 'auth.otp', component: VerifyOtp },
  { path: '/reset-password', name: 'auth.reset', component: ResetPassword },

  // --- DASHBOARDS ---
  { 
    path: '/dashboard/kepala', 
    name: 'dashboard.kepala',
    component: KepalaDashboard, 
    meta: { requiresAuth: true, roles: ['kepala_labor'] } 
  },
  { 
    path: '/dashboard/staff', 
    name: 'dashboard.staff',
    component: StaffDashboard, 
    meta: { requiresAuth: true, roles: ['staff_labor'] } 
  },
  { 
    path: '/dashboard/asisten', 
    name: 'dashboard.asisten',
    component: AsistenDashboard, 
    meta: { requiresAuth: true, roles: ['asisten'] } 
  },

  // --- FITUR MANAJEMEN (ADMIN/STAFF) ---
  { 
    path: '/manajemen-staff', 
    name: 'manajemen.staff', 
    component: ManajemenStaff,
    meta: { requiresAuth: true, roles: ['kepala_labor', 'staff_labor'] } // Hanya Kepala
  },
  { 
    path: '/kelas', 
    name: 'kelas.index', 
    component: KelasIndex,
    meta: { requiresAuth: true, roles: ['kepala_labor', 'staff_labor'] } // Kepala & Staff
  },
  { 
    path: '/jadwal', 
    name: 'jadwal.index', 
    component: JadwalIndex,
    meta: { requiresAuth: true, roles: ['kepala_labor', 'staff_labor'] } // Kepala & Staff
  },
  { 
    path: '/monitoring-absensi', 
    name: 'MonitoringAbsensi', 
    component: MonitoringAbsensi,
    meta: { requiresAuth: true, roles: ['kepala_labor', 'staff_labor'] } 
  },
  { 
    path: '/laporan-masuk', 
    name: 'laporan.masuk', 
    component: LaporanMasuk,
    meta: { requiresAuth: true, roles: ['kepala_labor', 'staff_labor'] } 
  },
  { 
    path: '/riwayat-labor', 
    name: 'riwayat.index', 
    component: RiwayatLabor,
    meta: { requiresAuth: true, roles: ['kepala_labor'] } 
  },

// --- FITUR ASISTEN ---
{ 
  path: '/jadwal-saya', 
  name: 'asisten.jadwal', 
  component: JadwalSaya,
  meta: { requiresAuth: true, roles: ['asisten'] } 
},

// PERBAIKAN DI SINI:
{ 
  path: '/absensi', 
  name: 'asisten.absensi.list', // Ubah nama agar unik (untuk mode Tabel)
  component: InputAbsensi,
  meta: { requiresAuth: true, roles: ['asisten'] } 
},
{
  path: '/absensi/:id', 
  name: 'asisten.absensi.input', // Ubah nama agar unik (untuk mode Form)
  component: InputAbsensi,
  // PERBAIKAN META: gunakan 'roles' (array), bukan 'role'
  meta: { requiresAuth: true, roles: ['asisten'] } 
},

{ 
  path: '/laporan', 
  name: 'asisten.laporan', 
  component: InputLaporan,
  meta: { requiresAuth: true, roles: ['asisten'] } 
},

  // --- UMUM ---
  { 
    path: '/profile', 
    name: 'user.profile', 
    component: UserProfile,
    meta: { requiresAuth: true, roles: ['kepala_labor', 'staff_labor', 'asisten'] } 
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// === NAVIGATION GUARD (Diperbarui untuk mendukung Multi-Role) ===
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    // 1. Cek Login
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login' });
    } 
    // 2. Cek Role (Jika route membatasi role tertentu)
    else if (to.meta.requiresAuth && to.meta.roles) {
      const userRole = authStore.userRole;
      
      // Jika role user TIDAK ada di dalam daftar roles yang diizinkan
      if (!to.meta.roles.includes(userRole)) {
         alert(`Akses Ditolak! Halaman ini tidak untuk ${userRole}.`);
         
         // Redirect balik ke dashboard masing-masing
         if(userRole === 'kepala_labor') next({ name: 'dashboard.kepala' });
         else if(userRole === 'staff_labor') next({ name: 'dashboard.staff' });
         else if(userRole === 'asisten') next({ name: 'dashboard.asisten' });
         else next({ name: 'login' });
      } else {
         next(); // Role cocok, silakan masuk
      }
    }
    // 3. Redirect Login Page jika sudah login
    else if (to.name === 'login' && authStore.isAuthenticated) {
      const role = authStore.userRole;
      if(role === 'kepala_labor') next({ name: 'dashboard.kepala' });
      else if(role === 'staff_labor') next({ name: 'dashboard.staff' });
      else if(role === 'asisten') next({ name: 'dashboard.asisten' });
      else next(); 
    }
    else {
      next();
    }
  });
  
  export default router;