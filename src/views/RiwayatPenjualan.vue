<template>
  <div class="max-w-6xl">
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="relative max-w-md flex-1 min-w-[200px]">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="Cari ID transaksi, kasir..." class="input-field pl-10" />
      </div>
      <select v-model="filterMetode" class="input-field max-w-[160px]">
        <option value="Semua">Semua metode</option>
        <option value="Cash">Tunai</option>
        <option value="QRIS">QRIS</option>
        <option value="Transfer">Transfer</option>
      </select>
      <input v-model="filterTanggal" type="date" class="input-field max-w-[180px]" />
      <button v-if="filterTanggal || filterMetode !== 'Semua' || searchQuery" @click="resetFilters" class="text-sm text-gray-400 hover:text-gray-600">
        Reset
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Total Transaksi</p>
        <p class="text-2xl font-bold text-gray-800 mt-1.5">{{ filteredTransactions.length }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Total Omset</p>
        <p class="text-2xl font-bold text-brand-600 mt-1.5">{{ formatRupiahShort(totalOmset) }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Rata-rata / Transaksi</p>
        <p class="text-2xl font-bold text-gray-800 mt-1.5">{{ formatRupiahShort(rataRata) }}</p>
      </div>
    </div>

    <div class="card !p-0 overflow-hidden">
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">ID Transaksi</th>
              <th class="px-5 py-3 font-medium">Tanggal</th>
              <th class="px-5 py-3 font-medium">Waktu</th>
              <th class="px-5 py-3 font-medium">Item</th>
              <th class="px-5 py-3 font-medium">Total</th>
              <th class="px-5 py-3 font-medium">Metode</th>
              <th class="px-5 py-3 font-medium">Kasir</th>
              <th class="px-5 py-3 font-medium text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filteredTransactions" :key="t.id" class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-5 py-3 text-brand-600 font-medium">{{ t.kode }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.tanggal }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.waktu }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.items }} produk</td>
              <td class="px-5 py-3 font-semibold text-gray-800">{{ formatRupiah(t.total) }}</td>
              <td class="px-5 py-3">
                <span class="badge" :class="metodeBadgeClass(t.metode)">{{ t.metode }}</span>
              </td>
              <td class="px-5 py-3 text-gray-500">{{ t.kasir }}</td>
              <td class="px-5 py-3 text-right">
                <button @click="selectedTransaction = t" class="text-gray-400 hover:text-brand-600">👁</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="filteredTransactions.length === 0" class="text-center text-gray-400 py-10 text-sm">
          Tidak ada transaksi yang cocok.
        </p>
      </div>
    </div>

    <!-- Detail modal -->
    <Transition name="modal">
      <div v-if="selectedTransaction" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="selectedTransaction = null">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6">
          <h3 class="font-bold text-gray-800 mb-4">Struk {{ selectedTransaction.kode }}</h3>
          <div class="space-y-2 text-sm text-gray-600 border-b border-dashed border-gray-200 pb-3 mb-3">
            <div class="flex justify-between"><span>Tanggal</span><span>{{ selectedTransaction.tanggal }}</span></div>
            <div class="flex justify-between"><span>Waktu</span><span>{{ selectedTransaction.waktu }}</span></div>
            <div class="flex justify-between"><span>Kasir</span><span>{{ selectedTransaction.kasir }}</span></div>
            <div class="flex justify-between"><span>Jumlah Item</span><span>{{ selectedTransaction.items }} produk</span></div>
            <div class="flex justify-between"><span>Metode Bayar</span><span>{{ selectedTransaction.metode }}</span></div>
          </div>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between text-gray-500"><span>Subtotal</span><span>{{ formatRupiah(selectedTransaction.subtotal) }}</span></div>
            <div v-if="selectedTransaction.diskon" class="flex justify-between text-gray-500"><span>Diskon</span><span>− {{ formatRupiah(selectedTransaction.diskon) }}</span></div>
            <div class="flex justify-between text-gray-500"><span>PPN 11%</span><span>{{ formatRupiah(selectedTransaction.ppn) }}</span></div>
            <div class="flex justify-between font-bold text-gray-800 text-base pt-1.5 border-t border-gray-100">
              <span>Total</span><span class="text-brand-600">{{ formatRupiah(selectedTransaction.total) }}</span>
            </div>
          </div>
          <button @click="selectedTransaction = null" class="btn-outline w-full mt-5">Tutup</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllTransactions } from '../db/LocalDb'
import { formatRupiah, formatRupiahShort } from '../composables/useFormat'

const allTransactions = ref([])
const searchQuery = ref('')
const filterMetode = ref('Semua')
const filterTanggal = ref('')
const selectedTransaction = ref(null)

const filteredTransactions = computed(() => {
  let list = allTransactions.value
  if (filterMetode.value !== 'Semua') {
    list = list.filter(t => t.metode === filterMetode.value)
  }
  if (filterTanggal.value) {
    list = list.filter(t => t.tanggal === filterTanggal.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(t => t.kode.toLowerCase().includes(q) || t.kasir.toLowerCase().includes(q))
  }
  return list
})

const totalOmset = computed(() => filteredTransactions.value.reduce((sum, t) => sum + t.total, 0))
const rataRata = computed(() => filteredTransactions.value.length ? Math.round(totalOmset.value / filteredTransactions.value.length) : 0)

function metodeBadgeClass(metode) {
  if (metode === 'QRIS') return 'badge-orange'
  if (metode === 'Cash') return 'badge-green'
  return 'bg-blue-50 text-blue-600'
}

function resetFilters() {
  searchQuery.value = ''
  filterMetode.value = 'Semua'
  filterTanggal.value = ''
}

async function loadTransactions() {
  allTransactions.value = await getAllTransactions()
}

onMounted(loadTransactions)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
