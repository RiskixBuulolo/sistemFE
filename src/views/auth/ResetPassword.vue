<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; // Mengganti alert bawaan dengan SweetAlert
// import '../../assets/css/ResetPassword.css'

const authStore = useAuthStore();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Fitur UX: Toggle lihat password untuk masing-masing kolom
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePassword = () => showPassword.value = !showPassword.value;
const toggleConfirmPassword = () => showConfirmPassword.value = !showConfirmPassword.value;

// Cek keamanan menggunakan SweetAlert
onMounted(() => {
  if (!authStore.tempEmail || !authStore.tempOtp) {
    Swal.fire({
      icon: 'error',
      title: 'Akses Ditolak',
      text: 'Sesi tidak valid. Silakan ulangi proses dari awal.',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Kembali',
      allowOutsideClick: false
    }).then(() => {
      router.push({ name: 'auth.forgot' });
    });
  }
});

const handleReset = async () => {
  // Validasi kecocokan password di sisi Client
  if (password.value !== confirmPassword.value) {
      errorMessage.value = "Password konfirmasi tidak cocok!";
      return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.resetPassword(password.value);
    
    // Alert Sukses Elegan
    Swal.fire({
      icon: 'success',
      title: 'Password Diperbarui!',
      text: 'Silakan login menggunakan password baru Anda.',
      confirmButtonColor: '#10b981', // Hijau Sukses
      confirmButtonText: 'Login Sekarang',
      allowOutsideClick: false
    }).then(() => {
      router.push('/login');
    });
    
  } catch (error) {
    if (error.response && error.response.data) {
        errorMessage.value = error.response.data.message;
    } else {
        errorMessage.value = "Gagal mereset password. Silakan coba lagi.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>

    <div class="auth-card" v-if="authStore.tempEmail && authStore.tempOtp">
      <div class="auth-header">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
          </svg>
        </div>
        <h2>Buat Password Baru</h2>
        <p>Silakan buat password baru yang kuat dan mudah Anda ingat.</p>
      </div>

      <form @submit.prevent="handleReset" class="auth-form">
        <div class="form-group">
          <label>Password Baru</label>
          <div class="input-with-icon">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Masukkan password baru" 
              autocomplete="new-password" 
              required
            >
            <button type="button" class="btn-toggle-pass" @click="togglePassword" title="Lihat Password">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Konfirmasi Password</label>
          <div class="input-with-icon">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input 
              v-model="confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="Ulangi password baru" 
              autocomplete="new-password"
              required
            >
            <button type="button" class="btn-toggle-pass" @click="toggleConfirmPassword" title="Lihat Password">
              <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
        </div>

        <transition name="fade">
          <div v-if="errorMessage" class="alert-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </transition>

        <button type="submit" class="btn-resetPass" :disabled="isLoading">
          <span v-if="!isLoading">Simpan Password</span>
          <span v-else class="loading-state">
            <svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>
            Menyimpan...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* =====================
   BACKGROUND & LAYOUT (KONSISTEN)
===================== */
.auth-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f4f8 0%, #dbeafe 100%);
    position: relative;
    overflow: hidden;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    width: 100%;
  }
  
  .shape { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; }
  .shape-1 { width: 400px; height: 400px; background: rgba(59, 130, 246, 0.3); top: -100px; left: -100px; }
  .shape-2 { width: 300px; height: 300px; background: rgba(147, 51, 234, 0.2); bottom: -50px; right: -50px; }
  
  /* =====================
     CARD (GLASSMORPHISM)
  ===================== */
  .auth-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.5);
    width: 100%;
    max-width: 420px;
    z-index: 1;
  }
  
  .auth-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  /* Icon Gradient Biru (Kembali ke tema Login) */
  .icon-container {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    color: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  }
  
  .auth-header h2 {
    font-size: 24px;
    color: #1e293b;
    margin: 0 0 12px;
    font-weight: 700;
  }
  
  .auth-header p {
    color: #64748b;
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
  
  /* =====================
     FORM INPUTS
  ===================== */
  .form-group {
    margin-bottom: 20px;
    text-align: left;
  }
  
  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }
  
  .input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .input-icon {
    position: absolute;
    left: 14px;
    color: #94a3b8;
    transition: color 0.3s;
  }
  
  .input-with-icon input {
    width: 100%;
    padding: 12px 42px 12px 42px; /* Kiri untuk ikon gembok, Kanan untuk ikon mata */
    background: #f8fafc;
    border: 2px solid transparent;
    border-radius: 12px;
    font-size: 15px;
    color: #1e293b;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }
  
  .input-with-icon input:focus {
    outline: none;
    background: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  
  .input-with-icon input:focus + .input-icon,
  .input-with-icon input:not(:placeholder-shown) ~ .input-icon {
    color: #3b82f6;
  }
  
  /* Tombol Toggle Mata */
  .btn-toggle-pass {
    position: absolute;
    right: 14px;
    background: transparent;
    border: none;
    padding: 0;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  
  .btn-toggle-pass:hover {
    color: #475569;
  }
  
  /* =====================
     ALERTS & BUTTON
  ===================== */
  .alert-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #fef2f2;
    color: #b91c1c;
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #fecaca;
  }
  
  .btn-resetPass {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
  }
  
  .btn-resetPass:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.4);
  }
  
  .btn-resetPass:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .btn-resetPass:disabled {
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  /* Animasi */
  .loading-state { display: flex; align-items: center; gap: 8px; }
  .spinner { animation: rotate 2s linear infinite; width: 20px; height: 20px; }
  .spinner .path { stroke: #ffffff; stroke-linecap: round; animation: dash 1.5s ease-in-out infinite; }
  @keyframes rotate { 100% { transform: rotate(360deg); } }
  @keyframes dash { 0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } }
  .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>