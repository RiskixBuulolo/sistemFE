<template>
  <footer class="modern-footer">
    <div class="footer-content">
      <div class="footer-left">
        <span class="copyright">
          &copy; {{ new Date().getFullYear() }}
        </span>
        <span class="brand-text"> Sistem Informasi Asisten Labor (SIALAB)</span>
        <span class="divider"> • </span>
        <span class="tagline">All rights reserved.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* =====================
   FOOTER BASE (GLASSMORPHISM)
===================== */
.modern-footer {
  /* Efek Kaca Buram (Glassmorphism) */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto; /* Memastikan footer selalu di bawah */
  padding: 16px 28px;
  color: #64748b; /* Warna teks Slate yang lebih modern dari abu-abu biasa */
  font-size: 13px;
  transition: all 0.3s ease;
  text-align: center;
}

/* =====================
   LEFT SIDE TYPOGRAPHY
===================== */


.brand-text {
  font-weight: 600;
  color: #2563eb;
  letter-spacing: 0.3px;
}

.divider {
  color: #cbd5e1;
  font-size: 14px;
}

.tagline {
  color: #94a3b8;
}

</style>