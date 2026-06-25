<template>
  <div class="max-w-3xl space-y-5">
    <!-- Profile header card -->
    <div class="card flex items-center gap-5">
      <div class="w-16 h-16 rounded-full bg-orange-400 text-white flex items-center justify-center text-2xl font-semibold shrink-0">
        {{ initials }}
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-lg font-bold text-gray-800">{{ currentUser?.nama || '-' }}</h2>
        <p class="text-sm text-gray-400">{{ currentUser?.role || '-' }}</p>
        <p class="text-xs text-gray-400 mt-1">Username: {{ currentUser?.username || '-' }}</p>
      </div>
      <button @click="handleLogout" class="btn-outline text-red-500 border-red-200 hover:bg-red-50 shrink-0">
        ⏻ Keluar
      </button>
    </div>

    <!-- Today's activity summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Transaksi Hari Ini</p>
        <p class="text-2xl font-bold text-gray-800 mt-1.5">{{ myStats.totalTransaksi }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Total Omset Dilayani</p>
        <p class="text-2xl font-bold text-brand-600 mt-1.5">{{ formatRupiahShort(myStats.totalOmset) }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Item Terjual</p>
        <p class="text-2xl font-bold text-gray-800 mt-1.5">{{ myStats.totalItem }}</p>
      </div>
    </div>

    <!-- Account info / change password -->
    <div class="card">
      <h3 class="font-bold text-gray-800 mb-4">Ubah Password</h3>
      <form @submit.prevent="handleChangePassword" class="space-y-3 max-w-sm">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1.5">Password Saat Ini</label>
          <input v-model="oldPassword" type="password" class="input-field" placeholder="Masukkan password lama" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1.5">Password Baru</label>
          <input v-model="newPassword" type="password" class="input-field" placeholder="Minimal 6 karakter" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1.5">Konfirmasi Password Baru</label>
          <input v-model="confirmPassword" type="password" class="input-field" placeholder="Ulangi password baru" />
        </div>

        <p v-if="errorMsg" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-sm text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{{ successMsg }}</p>

        <button type="submit" class="btn-primary">Simpan Perubahan</button>
      </form>
    </div>

    <!-- Recent transactions by this cashier -->
    <div class="card !p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Transaksi Terbaru Saya</h3>
      </div>
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">ID Transaksi</th>
              <th class="px-5 py-3 font-medium">Tanggal</th>
              <th class="px-5 py-3 font-medium">Waktu</th>
              <th class="px-5 py-3 font-medium">Total</th>
              <th class="px-5 py-3 font-medium">Metode</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in myTransactions" :key="t.id" class="border-t border-gray-50">
              <td class="px-5 py-3 text-brand-600 font-medium">{{ t.kode }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.tanggal }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.waktu }}</td>
              <td class="px-5 py-3 font-semibold text-gray-800">{{ formatRupiah(t.total) }}</td>
              <td class="px-5 py-3">
                <span class="badge" :class="metodeBadgeClass(t.metode)">{{ t.metode }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="myTransactions.length === 0" class="text-center text-gray-400 py-10 text-sm">
          Belum ada transaksi yang kamu layani.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { getAllTransactions, getUserByUsername, updateUserPassword } from '../db/LocalDb'
import { formatRupiah, formatRupiahShort } from '../composables/useFormat'

const router = useRouter()
const { currentUser, logout } = useAuth()

const allTransactions = ref([])
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')

const initials = computed(() => {
  const name = currentUser.value?.nama || ''
  return name.charAt(0).toUpperCase() || 'R'
})

const myTransactions = computed(() =>
  allTransactions.value
    .filter(t => t.kasir === currentUser.value?.nama)
    .slice(0, 8)
)

const myStats = computed(() => {
  const mine = allTransactions.value.filter(t => t.kasir === currentUser.value?.nama)
  return {
    totalTransaksi: mine.length,
    totalOmset: mine.reduce((sum, t) => sum + t.total, 0),
    totalItem: mine.reduce((sum, t) => sum + t.items, 0)
  }
})

function metodeBadgeClass(metode) {
  if (metode === 'QRIS') return 'badge-orange'
  if (metode === 'Cash') return 'badge-green'
  return 'bg-blue-50 text-blue-600'
}

async function loadTransactions() {
  allTransactions.value = await getAllTransactions()
}

async function handleChangePassword() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    errorMsg.value = 'Semua kolom wajib diisi.'
    return
  }
  if (newPassword.value.length < 6) {
    errorMsg.value = 'Password baru minimal 6 karakter.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Konfirmasi password tidak cocok.'
    return
  }

  const user = await getUserByUsername(currentUser.value.username)
  if (!user || user.password !== oldPassword.value) {
    errorMsg.value = 'Password saat ini salah.'
    return
  }

  await updateUserPassword(user.id, newPassword.value)
  successMsg.value = 'Password berhasil diubah.'
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

function handleLogout() {
  logout()
  router.push('/login')
}

onMounted(loadTransactions)
</script>