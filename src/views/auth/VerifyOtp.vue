<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; // Tambahkan SweetAlert2
// import '../../assets/css/VerifyOtp.css'

const authStore = useAuthStore();
const router = useRouter();

const otp = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Cek keamanan dengan UX yang lebih baik (menggunakan SweetAlert)
onMounted(() => {
  if (!authStore.tempEmail) {
    Swal.fire({
      icon: 'warning',
      title: 'Sesi Kedaluwarsa',
      text: 'Silakan masukkan email Anda kembali untuk meminta OTP.',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Kembali',
      allowOutsideClick: false
    }).then(() => {
      router.push({ name: 'auth.forgot' });
    });
  }
});

const handleVerify = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.verifyOtp(otp.value);
    // Jika sukses, pindah ke halaman Reset Password
    router.push({ name: 'auth.reset' });
  } catch (error) {
     if (error.response && error.response.data) {
        errorMessage.value = error.response.data.message;
    } else {
        errorMessage.value = "Kode OTP Salah atau Kedaluwarsa.";
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

    <div class="auth-card" v-if="authStore.tempEmail">
      <div class="auth-header">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        <h2>Verifikasi Kode</h2>
        <p>
          Kami telah mengirimkan 6 digit kode ke email:
          <br>
          <strong class="email-badge">{{ authStore.tempEmail }}</strong>
        </p>
      </div>

      <form @submit.prevent="handleVerify" class="auth-form">
        <div class="form-group">
          <label>Masukkan Kode OTP</label>
          <div class="otp-input-container">
            <input 
              v-model="otp" 
              type="text" 
              placeholder="••••••" 
              maxlength="6" 
              required 
              class="otp-input"
              autocomplete="one-time-code"
            >
          </div>
        </div>

        <transition name="fade">
          <div v-if="errorMessage" class="alert-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </transition>

        <button type="submit" class="btn-success" :disabled="isLoading">
          <span v-if="!isLoading">Verifikasi Sekarang</span>
          <span v-else class="loading-state">
            <svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>
            Memverifikasi...
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
  .shape-1 { width: 400px; height: 400px; background: rgba(16, 185, 129, 0.2); top: -100px; left: -100px; } /* Hijau pudar */
  .shape-2 { width: 300px; height: 300px; background: rgba(59, 130, 246, 0.2); bottom: -50px; right: -50px; } /* Biru pudar */
  
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
  
  /* Icon Emerald Green */
  .icon-container {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
    color: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.25);
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
    line-height: 1.6;
  }
  
  .email-badge {
    display: inline-block;
    margin-top: 6px;
    padding: 4px 12px;
    background-color: #f1f5f9;
    color: #0f172a;
    border-radius: 20px;
    font-weight: 600;
    font-size: 13px;
    border: 1px solid #e2e8f0;
  }
  
  /* =====================
     FORM & OTP INPUT
  ===================== */
  .form-group {
    margin-bottom: 24px;
    text-align: center;
  }
  
  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12px;
  }
  
  .otp-input-container {
    display: flex;
    justify-content: center;
  }
  
  .otp-input {
    width: 100%;
    max-width: 250px;
    padding: 14px;
    background: #f8fafc;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    letter-spacing: 12px; /* Memberi jarak antar angka */
    transition: all 0.3s ease;
    box-sizing: border-box;
  }
  
  /* Hilangkan panah di input number (jika tipe diganti ke number) */
  .otp-input::-webkit-outer-spin-button,
  .otp-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .otp-input:focus {
    outline: none;
    background: #ffffff;
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    letter-spacing: 14px; /* Sedikit membesar saat difokuskan */
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
    justify-content: center;
  }
  
  /* Tombol Gradient Hijau */
  .btn-success-otp {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .btn-success:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4);
  }
  
  .btn-success:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .btn-success:disabled {
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  /* Animasi (Konsisten) */
  .loading-state { display: flex; align-items: center; gap: 8px; }
  .spinner { animation: rotate 2s linear infinite; width: 20px; height: 20px; }
  .spinner .path { stroke: #ffffff; stroke-linecap: round; animation: dash 1.5s ease-in-out infinite; }
  @keyframes rotate { 100% { transform: rotate(360deg); } }
  @keyframes dash { 0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } }
  .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>