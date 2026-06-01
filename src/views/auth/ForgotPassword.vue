<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
// import '../../assets/css/ForgotPassword.css'

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.forgotPassword(email.value);
    // Jika sukses, pindah ke halaman Verify OTP
    router.push({ name: 'auth.otp' });
  } catch (error) {
    if (error.response && error.response.data) {
        errorMessage.value = error.response.data.message;
    } else {
        errorMessage.value = "Gagal mengirim OTP. Cek email Anda.";
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

    <div class="auth-card">
      <div class="auth-header">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>Lupa Password? 🔒</h2>
        <p>Jangan khawatir. Masukkan email terdaftar Anda, dan kami akan mengirimkan kode OTP untuk mengatur ulang sandi.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>Email Terdaftar</label>
          <div class="input-with-icon">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
              <path d="m2 22 10-10L22 22"></path>
              <path d="m2 2 10 10L22 2"></path>
            </svg>
            <input 
              v-model="email" 
              type="email" 
              placeholder="contoh@uin-suska.ac.id" 
              required
            >
          </div>
        </div>

        <transition name="fade">
          <div v-if="errorMessage" class="alert-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </transition>

        <button type="submit" class="btn-forgot" :disabled="isLoading">
          <span v-if="!isLoading">Kirim Kode OTP</span>
          <span v-else class="loading-state">
            <svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>
            Mengirim...
          </span>
        </button>
        
        <div class="back-link">
          <router-link to="/login" class="link-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Halaman Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* =====================
   BACKGROUND & LAYOUT
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
  
  /* Dekorasi Background Bulatan Blur (Persis seperti Login) */
  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
  }
  .shape-1 {
    width: 400px;
    height: 400px;
    background: rgba(59, 130, 246, 0.3);
    top: -100px;
    left: -100px;
  }
  .shape-2 {
    width: 300px;
    height: 300px;
    background: rgba(147, 51, 234, 0.2);
    bottom: -50px;
    right: -50px;
  }
  
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
  
  .icon-container {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    /* Warna ikon sekunder (Sedikit beda dari Login agar fresh) */
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
    color: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
  }
  
  .auth-header h2 {
    font-size: 22px;
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
    margin-bottom: 24px;
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
    padding: 12px 14px 12px 42px;
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
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }
  
  .input-with-icon input:focus + .input-icon,
  .input-with-icon input:not(:placeholder-shown) ~ .input-icon {
    color: #6366f1;
  }
  
  /* =====================
     ALERTS & LINKS
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
  
  .back-link {
    margin-top: 24px;
    text-align: center;
  }
  
  .link-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .link-item:hover {
    color: #1e293b;
  }
  
  /* =====================
     BUTTON SUBMIT
  ===================== */
  .btn-forgot {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .btn-forgot:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.4);
  }
  
  .btn-forgot:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .btn-forgot:disabled {
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  /* Animasi Loading & Error (Sama dengan Login) */
  .loading-state {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .spinner { animation: rotate 2s linear infinite; width: 20px; height: 20px; }
  .spinner .path { stroke: #ffffff; stroke-linecap: round; animation: dash 1.5s ease-in-out infinite; }
  @keyframes rotate { 100% { transform: rotate(360deg); } }
  @keyframes dash { 0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } }
  .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>