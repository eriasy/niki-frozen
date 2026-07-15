<template>
  <header class="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
    <div>
      <h1 class="text-lg font-bold text-gray-800">{{ title }}</h1>
      <p class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
      <p v-if="shiftInfo" class="text-xs text-brand-600 mt-1">{{ shiftInfo }}</p>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative hidden md:block">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Cari produk, transaksi..."
          class="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <SyncIndicator />

      <NotificationBell />

      <div v-if="isCashierRole && currentUser.value?.shift" class="flex items-center gap-2">
        <span class="text-xs text-brand-600">Shift aktif</span>
        <button @click="handleCloseShift" class="px-3 py-1 rounded-full border border-brand-200 text-brand-600 text-xs hover:bg-brand-50">Close Shift</button>
      </div>
      <div
        @click="router.push('/profil')"
        class="w-9 h-9 rounded-full bg-orange-400 text-white flex items-center justify-center text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        title="Lihat profil"
      >
        {{ initials }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { formatRupiah } from '../composables/useFormat'
import SyncIndicator from './SyncIndicator.vue'
import NotificationBell from './NotificationBell.vue'

const route = useRoute()
const router = useRouter()
const { currentUser, clearShift } = useAuth()

const titles = {
  dashboard: { title: 'Dashboard', subtitle: `Selamat pagi, ${1}` },
  kasir: { title: 'Transaksi Kasir', subtitle: 'Mode kasir aktif' },
  produk: { title: 'Manajemen Produk', subtitle: 'Kelola katalog produk Anda' },
  stok: { title: 'Stok Barang', subtitle: 'Pantau ketersediaan stok' },
  riwayat: { title: 'Riwayat Penjualan', subtitle: 'Daftar transaksi yang sudah selesai' },
  laporan: { title: 'Laporan', subtitle: 'Ringkasan performa bisnis Anda' },
  profil: { title: 'Profil Saya', subtitle: 'Kelola informasi akun Anda' }
}

const title = computed(() => titles[route.name]?.title || 'NIKI Frozen')

const subtitle = computed(() => {
  if (route.name === 'dashboard') {
    return `Selamat pagi, ${currentUser.value?.nama || 'Kasir'}. Berikut ringkasan hari ini.`
  }
  return titles[route.name]?.subtitle || ''
})

const shiftInfo = computed(() => {
  if (!currentUser.value?.shift) return ''
  return `${currentUser.value.shift} · Kas Awal ${formatRupiah(currentUser.value.startingCash || 0)}`
})

const isCashierRole = computed(() => ['Kasir', 'Kasir Utama'].includes(currentUser.value?.role))

function handleCloseShift() {
  clearShift()
}

const initials = computed(() => {
  const name = currentUser.value?.nama || ''
  return name.charAt(0).toUpperCase() || 'R'
})
</script>