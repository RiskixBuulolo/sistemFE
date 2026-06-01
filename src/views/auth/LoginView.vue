<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
// import '../../assets/css/LoginView.css'

const authStore = useAuthStore();

const email = ref(''); 
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

// Fitur UX Baru: Toggle lihat password
const showPassword = ref(false);
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({ 
        email: email.value, 
        password: password.value 
    });
  } catch (error) {
    if (error.message && !error.response) {
       errorMessage.value = error.message;
    } 
    else if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message || "Terjadi kesalahan pada server.";
    } 
    else {
      errorMessage.value = "Login gagal. Periksa koneksi internet Anda.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <img src="../../assets//img//1uir.png" alt="logo uir" class="logo-img">
        </div>
        <h2>Selamat Datang!</h2>
        <p>Sistem Informasi Asisten Laboratorium<br>(SIALAB)</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <div class="input-with-icon">
            <img src="../../assets/img/email-9-svgrepo-com.svg" alt="" class="input-icon" width="20" height="20">
            <input 
              v-model="email" 
              type="email" 
              placeholder="email@student.uir.ac.id" 
              autocomplete="email"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-with-icon">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Masukkan password..." 
              autocomplete="current-password"
              required
            >
            <button type="button" class="btn-toggle-pass" @click="togglePasswordVisibility">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <router-link :to="{ name: 'auth.forgot' }" class="forgot-link">Lupa Password?</router-link>
        </div>

        <transition name="fade">
          <div v-if="errorMessage" class="alert-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </transition>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="!isLoading">Masuk ke Sistem</span>
          <span v-else class="loading-state">
            <svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>
            Memproses...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
html, body, #app {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

/* =====================
   BACKGROUND & LAYOUT
===================== */
.login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    /* Gradien biru modern */
    background: linear-gradient(135deg, #f0f4f8 0%, #dbeafe 100%);
    position: relative;
    overflow: hidden;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  
  /* Dekorasi Background Bulatan Blur */
  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
  }
  .shape-1 {
    width: 400px;
    height: 400px;
    background: rgba(59, 130, 246, 0.3); /* Biru */
    top: -100px;
    left: -100px;
  }
  .shape-2 {
    width: 300px;
    height: 300px;
    background: rgba(147, 51, 234, 0.2); /* Ungu */
    bottom: -50px;
    right: -50px;
  }
  
  /* =====================
     LOGIN CARD (GLASSMORPHISM)
  ===================== */
  .login-card {
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
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .logo-container {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-img { width: 100%; height: 100%; object-fit: contain; }
  
  .login-header h2 {
    font-size: 24px;
    color: #1e293b;
    margin: 0 0 8px;
    font-weight: 700;
  }
  
  .login-header p {
    color: #64748b;
    margin: 0;
    font-size: 14px;
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
    padding: 12px 14px 12px 42px; /* Ruang untuk ikon di kiri */
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
    color: #3b82f6; /* Ikon menyala saat diketik/fokus */
  }
  
  /* Tombol Mata (Toggle Password) */
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
     LINKS & ALERTS
  ===================== */
  .form-options {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }
  
  .forgot-link {
    font-size: 13px;
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .forgot-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
  
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
  
  /* =====================
     BUTTON LOGIN
  ===================== */
  .btn-login {
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
  }
  
  .btn-login:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.4);
  }
  
  .btn-login:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .btn-login:disabled {
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  /* Animasi Loading */
  .loading-state {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .spinner {
    animation: rotate 2s linear infinite;
    width: 20px;
    height: 20px;
  }
  
  .spinner .path {
    stroke: #ffffff;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
  
  @keyframes rotate { 100% { transform: rotate(360deg); } }
  @keyframes dash {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
  }
  
  /* Animasi Fade Error */
  .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
