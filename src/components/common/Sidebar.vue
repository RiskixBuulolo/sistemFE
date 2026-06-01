<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRoute } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const route = useRoute()
const userRole = authStore.userRole?.toLowerCase()

/* =========================
   SCROLL LISTENER
========================= */
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 60
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

/* =========================
   SUBMENU STATE
========================= */
const openMenus = ref({})

const toggleMenu = (label) => {
  openMenus.value[label] = !openMenus.value[label]
}

/* =========================
   MENU CONFIG
========================= */
const menuItems = computed(() => [
  {
    label: 'Dashboard',
    path:
      userRole === 'kepala_labor'
        ? '/dashboard/kepala'
        : userRole === 'staff_labor'
        ? '/dashboard/staff'
        : '/dashboard/asisten',
    icon: '🏠'
  },

  ...(userRole === 'kepala_labor'
    ? [
        {
          label: 'Master Data',
          icon: '🗂️',
          children: [
            { label: 'Manajemen User', path: '/manajemen-staff', icon: '👥' },
            { label: 'Manajemen Kelas', path: '/kelas', icon: '🏫' },
            { label: 'Manajemen Jadwal', path: '/jadwal', icon: '📅' }
          ]
        },
        { label: 'Monitoring Absensi', path: '/monitoring-absensi', icon: '🔍' },
        { label: 'Laporan', path: '/laporan-masuk', icon: '📥' }
      ]
    : []),

  ...(userRole === 'kepala_labor'
    ? [{ label: 'Riwayat Kegiatan', path: '/riwayat-labor', icon: '📜' }]
    : []),

  ...(userRole === 'staff_labor'
    ? [
        { label: 'Manajemen User', path: '/manajemen-staff', icon: '👥' },
        { label: 'Manajemen Kelas', path: '/kelas', icon: '🏫' },
        { label: 'Manajemen Jadwal', path: '/jadwal', icon: '📅' },
        { label: 'Monitoring Absensi', path: '/monitoring-absensi', icon: '🔍' },
        { label: 'Laporan', path: '/laporan-masuk', icon: '📥' }
      ]
    : []),

  ...(userRole === 'asisten'
    ? [
        { label: 'Jadwal', path: '/jadwal-saya', icon: '📅' },
        { label: 'Absensi', path: '/absensi', icon: '📍' },
        { label: 'Laporan', path: '/laporan', icon: '📝' }
      ]
    : []),

  { label: 'Profil', path: '/profile', icon: '👤' }
])

/* =========================
   AUTO OPEN SUBMENU
========================= */
watch(
  () => route.path,
  (path) => {
    menuItems.value.forEach(menu => {
      if (menu.children) {
        openMenus.value[menu.label] =
          menu.children.some(child => child.path === path)
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <transition name="fade-btn">
      <button 
        v-if="isScrolled" 
        class="floating-btn" 
        :class="{ 'is-open': isOpen }"
        @click="emit('toggle-sidebar')"
        :title="isOpen ? 'Tutup Menu' : 'Buka Menu'"
      >
        <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline> </svg>
      </button>
    </transition>

    <aside class="sidebar" :class="{ closed: !isOpen }">
      <div class="sidebar-header">
        <div class="logo-circle">
            <img src="../../assets//img//1uir.png" alt="logo uir" class="logo-img">
        </div>
        <div class="header-text-group">
          <span class="header-text">Sistem Informasi</span>
          <span class="header-subtext">Asisten Laboratorium</span>
          <span class="header-subtext">(SIALAB)</span>
        </div>
      </div>

      <ul class="menu-list">
        <li v-for="(item, index) in menuItems" :key="index">
          <div v-if="item.children">
            <div
              class="menu-link submenu-title"
              :class="{ 'active-parent': openMenus[item.label] }"
              @click="toggleMenu(item.label)"
            >
              <span class="icon">{{ item.icon }}</span>
              <span class="label">{{ item.label }}</span>
              <span class="arrow" :class="{ rotate: openMenus[item.label] }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </span>
            </div>

            <transition name="expand">
              <ul v-show="openMenus[item.label]" class="submenu">
                <li v-for="(child, cIndex) in item.children" :key="cIndex">
                  <router-link
                    :to="child.path"
                    class="menu-link submenu-link"
                    active-class="active"
                  >
                    <span class="submenu-dot"></span>
                    <span class="label">{{ child.label }}</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </div>

          <router-link
            v-else
            :to="item.path"
            class="menu-link"
            active-class="active"
          >
            <span class="icon">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
/* =====================
   SIDEBAR BASE
===================== */
.sidebar {
  width: 260px;
  height: 100vh;
  background: #0f172a; 
  color: #94a3b8; 
  position: fixed;
  left: 0;
  top: 0;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 105;
  display: flex;
  flex-direction: column;
}

.sidebar.closed {
  transform: translateX(-270px);
}

/* =====================
   HEADER
===================== */
.sidebar-header {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 14px;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 10px;
}

.logo-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
.logo-img { width: 100%; height: 100%; object-fit: contain; }

.header-text-group { display: flex; flex-direction: column; justify-content: center; }
.header-text { font-size: 16px; font-weight: 700; color: #f8fafc; letter-spacing: 0.3px; }
.header-subtext { font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px; }

/* =====================
   MENU LIST & SCROLLBAR
===================== */
.menu-list { list-style: none; padding: 10px 0; margin: 0; overflow-y: auto; flex: 1; }
.menu-list::-webkit-scrollbar { width: 4px; }
.menu-list::-webkit-scrollbar-track { background: transparent; }
.menu-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
.menu-list::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

/* =====================
   MENU LINK & SUBMENU
===================== */
.menu-link {
  display: flex; align-items: center; padding: 12px 16px; margin: 4px 16px; 
  border-radius: 10px; color: #cbd5e1; text-decoration: none; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative; overflow: hidden;
}
.menu-link:hover { background: rgba(255, 255, 255, 0.05); color: #ffffff; transform: translateX(4px); }
.menu-link.active { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; font-weight: 600; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); }
.menu-link.active-parent { color: #ffffff; }

.icon { width: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 18px; transition: transform 0.3s ease; }
.menu-link.active .icon { transform: scale(1.1); }
.label { font-size: 14px; font-weight: 500; }

.submenu { list-style: none; margin: 4px 0 4px 34px; padding-left: 12px; border-left: 1px solid rgba(255, 255, 255, 0.1); }
.submenu-link { padding: 10px 14px; margin: 2px 0; font-size: 13px; color: #94a3b8; border-radius: 8px; }
.submenu-link:hover { background: rgba(255, 255, 255, 0.04); color: #f8fafc; transform: translateX(4px); }
.submenu-link.active { background: rgba(59, 130, 246, 0.1); color: #60a5fa; box-shadow: none; }
.submenu-dot { width: 6px; height: 6px; background-color: currentColor; border-radius: 50%; margin-right: 12px; opacity: 0.5; transition: opacity 0.3s ease; }
.submenu-link.active .submenu-dot { opacity: 1; box-shadow: 0 0 8px currentColor; }

.arrow { margin-left: auto; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; opacity: 0.5; }
.arrow.rotate { transform: rotate(90deg); opacity: 1; }

/* =====================
   FLOATING BUTTON (DINAMIS)
===================== */
.floating-btn {
  position: fixed;
  top: 50%;
  left: 0;
  /* Posisi default saat sidebar TERTUTUP (di ujung kiri layar) */
  transform: translateY(-50%) translateX(0);
  background: #0f172a;
  color: white;
  border: none;
  width: 36px;
  height: 64px;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 106; 
  /* Animasi tersinkronisasi persis dengan kecepatan sidebar */
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), 
              width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              background 0.3s ease;
}

.floating-btn:hover {
  width: 44px;
  background: #0f172a;
}

/* Posisi saat sidebar TERBUKA (Meluncur 260px ke kanan) */
.floating-btn.is-open {
  transform: translateY(-50%) translateX(260px);
  box-shadow: #0f172a;
}

/* Berubah merah saat disorot jika akan menutup */
.floating-btn.is-open:hover {
  background: #0f172a;
}

/* Animasi putar pada Ikon */
.toggle-icon {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Ikon memutar 180 derajat menjadi '<' saat Terbuka */
.floating-btn.is-open .toggle-icon {
  transform: rotate(180deg);
}

/* =====================
   ANIMASI VUE
===================== */
.expand-enter-active, .expand-leave-active { transition: all 0.3s ease-in-out; max-height: 200px; opacity: 1; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; margin-top: 0; margin-bottom: 0; }

/* Animasi fade in/out tombol saat scroll */
.fade-btn-enter-active,
.fade-btn-leave-active {
  transition: opacity 0.3s ease;
}

.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
}
</style>