import Api from './index';

export default {
  login(credentials) {
    return Api.post('/auth/login', credentials);
  },
  
  // --- TAMBAHKAN 3 INI ---
  forgotPassword(data) {
    // Mengirim { email: '...' }
    return Api.post('/auth/forgot-password', data);
  },
  
  verifyOtp(data) {
    // Mengirim { email: '...', otp: '...' }
    return Api.post('/auth/verify-otp', data);
  },
  
  resetPassword(data) {
    // Mengirim { email: '...', otp: '...', password: '...' }
    return Api.post('/auth/reset-password', data);
  }
};