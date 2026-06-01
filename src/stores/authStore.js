import { defineStore } from 'pinia';
import authService from '../api/authService';
import router from '../router';
import Api from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: sessionStorage.getItem('token') || '', 
    user: JSON.parse(sessionStorage.getItem('user')) || null, 
    role: sessionStorage.getItem('role') || '',
    // --- STATE BARU UNTUK FORGOT PASSWORD ---
    tempEmail: '', // Menyimpan email sementara
    tempOtp: '',   // Menyimpan OTP sementara (untuk validasi akhir)
  }),

  getters: {
    isAuthenticated: (state) => !!state.token, 
    userRole: (state) => state.role, 
  },

  actions: {
    // 1. TERIMA PAYLOAD OBJECT (credentials)
    async login(credentials) { 
        try {
          // credentials isinya { email: '...', password: '...' }
          const response = await authService.login(credentials);
          const paket = response.data; 
          
          console.log("📦 Paket Backend:", paket);
  
          // --- CEK STRUKTUR RESPONSE BACKEND ---
          // Backend authController.js Anda mengirim: { message, token, user: {...} }
          // Jadi user ada di paket.user, BUKAN paket.data
          
          const token = paket.token;
          
          // PERBAIKAN PENTING DISINI:
          // Jika backend kirim "res.json({ user: ... })", maka pakai paket.user
          const user = paket.user || paket.data; 
  
          if (!user) throw new Error("Data User tidak ditemukan.");
  
          const role = user.role; 
          if (!role) throw new Error("Role user tidak ditemukan.");
  
          // Simpan ke State
          this.token = token;
          this.user = user;
          this.role = role; 
  
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
          sessionStorage.setItem('role', role);
  
          this.redirectByRole(role);
          return true; 
        } catch (error) {
          console.error("Login Error:", error);
          
          // 2. PERBAIKAN TYPO DISINI
          this.logout(); // Panggil fungsi logout() yang benar
          
          throw error; 
        }
      },

      // --- FUNGSI INI YANG HILANG SEBELUMNYA ---
      redirectByRole(role) {
        // Normalisasi role ke huruf kecil untuk menghindari error typo (misal: "Kepala_Labor")
        const normalizedRole = role.toLowerCase(); 
        console.log("🔀 Mengarahkan user dengan role:", normalizedRole);
  
        // SESUAIKAN ROUTE INI DENGAN router/index.js ANDA
        if (normalizedRole === 'kepala_labor' || normalizedRole === 'kepala') {
          router.push('/dashboard/kepala');
        } else if (normalizedRole === 'staff_labor' || normalizedRole === 'staff') {
          router.push('/dashboard/staff');
        } else if (normalizedRole === 'asisten') {
          router.push('/dashboard/asisten');
        } else {
          // Default jika role tidak dikenali
          console.warn("⚠️ Role tidak dikenali, redirect ke dashboard umum");
          router.push('/dashboard'); 
        }
      },
      // ------------------------------------------

    logout() {
        this.token = '';
        this.user = null;
        this.role = '';
  
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
        
        // Hapus header axios jika ada
        if (Api.defaults.headers.common['Authorization']) {
            delete Api.defaults.headers.common['Authorization'];
        }
  
        router.push('/login');
      },
// --- 1. ACTION REQUEST OTP ---
async forgotPassword(email) {
    try {
      await authService.forgotPassword({ email });
      // Simpan email di state agar bisa dipakai di halaman selanjutnya
      this.tempEmail = email; 
      return true;
    } catch (error) {
      throw error;
    }
  },

  // --- 2. ACTION VERIFIKASI OTP ---
  async verifyOtp(otp) {
    try {
      // Kita butuh email yang tadi disimpan
      if (!this.tempEmail) throw new Error("Sesi habis, silakan input email ulang.");

      await authService.verifyOtp({ 
          email: this.tempEmail, 
          otp: otp 
      });
      
      // Simpan OTP jika valid, karena biasanya dibutuhkan saat reset password
      this.tempOtp = otp; 
      return true;
    } catch (error) {
      throw error;
    }
  },

  // --- 3. ACTION RESET PASSWORD BARU ---
 // --- 3. ACTION RESET PASSWORD BARU ---
 async resetPassword(newPasswordInput) {
    try {
      if (!this.tempEmail || !this.tempOtp) {
          throw new Error("Data sesi hilang. Silakan ulangi proses Forgot Password.");
      }

      // --- PERBAIKAN PAYLOAD (SESUAI BACKEND) ---
      const payload = {
        email: this.tempEmail,
        otp: this.tempOtp,
        
        // PENTING: Backend meminta 'newPassword', bukan 'password'
        newPassword: newPasswordInput,
        
        // Backend meminta 'confirmPassword'
        confirmPassword: newPasswordInput
      };

      console.log("🚀 Mengirim Payload Valid:", payload);

      await authService.resetPassword(payload);

      // Bersihkan data sementara
      this.tempEmail = '';
      this.tempOtp = '';
      return true;
    } catch (error) {
      console.error("❌ Error di Store:", error);
      throw error;
    }
  }
}
});