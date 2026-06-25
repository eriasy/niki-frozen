<template>
  <aside class="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
    <!-- Logo -->
    <div class="px-5 py-5 flex items-center gap-3 border-b border-gray-100">
      <div class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg shrink-0">
        ❄
      </div>
      <div class="leading-tight">
        <p class="font-bold text-gray-800 text-sm">NIKI Frozen</p>
        <p class="text-xs text-gray-400">Point of Sale</p>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto thin-scroll">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-link"
        :class="{ 'sidebar-link-active': isActive(item.path) }"
      >
        <span class="text-base">{{ item.icon }}</span>
        <span class="flex-1">{{ item.label }}</span>
        <span v-if="isActive(item.path)" class="text-brand-600">›</span>
      </router-link>
    </nav>

    <!-- User footer -->
    <div class="px-3 py-4 border-t border-gray-100">
      <div
        class="flex items-center gap-3 px-2 py-1.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
        @click="goToProfile"
      >
        <div class="w-9 h-9 rounded-full bg-orange-400 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {{ initials }}
        </div>
        <div class="leading-tight flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate">{{ currentUser?.nama || 'Tamu' }}</p>
          <p class="text-xs text-gray-400 truncate">{{ currentUser?.role || '-' }}</p>
        </div>
        <button
          @click.stop="handleLogout"
          title="Keluar"
          class="text-gray-400 hover:text-red-500 transition-colors text-sm shrink-0"
        >
          ⏻
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { currentUser, logout } = useAuth()

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/kasir', label: 'Transaksi Kasir', icon: '🛒' },
  { path: '/produk', label: 'Produk', icon: '📦' },
  { path: '/stok', label: 'Stok Barang', icon: '🗄️' },
  { path: '/riwayat', label: 'Riwayat Penjualan', icon: '🕒' },
  { path: '/laporan', label: 'Laporan', icon: '📈' }
]

const initials = computed(() => {
  const name = currentUser.value?.nama || ''
  return name.charAt(0).toUpperCase() || 'R'
})

function isActive(path) {
  return route.path === path
}

function goToProfile() {
  router.push('/profil')
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>