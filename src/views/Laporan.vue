<template>
  <div class="max-w-6xl space-y-5">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex gap-2">
        <button
          v-for="p in periodeOptions"
          :key="p"
          @click="periode = p"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="periode === p ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
        >
          {{ p }}
        </button>
      </div>
      <button @click="exportCsv" class="btn-outline flex items-center gap-2 text-sm">
        ⬇️ Export CSV
      </button>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard label="Total Omset" :value="formatRupiahShort(summary.totalOmset)" icon="💰" iconBg="bg-brand-50" />
      <DashboardCard label="Total Transaksi" :value="String(summary.totalTransaksi)" icon="🧾" iconBg="bg-orange-50" />
      <DashboardCard label="Item Terjual" :value="String(summary.totalItem)" icon="📦" iconBg="bg-blue-50" />
      <DashboardCard label="Rata-rata / Transaksi" :value="formatRupiahShort(summary.rataRata)" icon="📐" iconBg="bg-yellow-50" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Sales by category chart -->
      <div class="card">
        <h3 class="font-bold text-gray-800 mb-1">Penjualan per Kategori</h3>
        <p class="text-xs text-gray-400 mb-4">Berdasarkan jumlah terjual</p>
        <div class="h-64">
          <canvas ref="categoryChartRef"></canvas>
        </div>
      </div>

      <!-- Payment method breakdown -->
      <div class="card">
        <h3 class="font-bold text-gray-800 mb-1">Metode Pembayaran</h3>
        <p class="text-xs text-gray-400 mb-4">Distribusi transaksi</p>
        <div class="h-64">
          <canvas ref="metodeChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Top products table -->
    <div class="card !p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Produk Terlaris</h3>
      </div>
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">Produk</th>
              <th class="px-5 py-3 font-medium">Kategori</th>
              <th class="px-5 py-3 font-medium">Terjual</th>
              <th class="px-5 py-3 font-medium">Estimasi Omset</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in topProducts" :key="p.id" class="border-t border-gray-50">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <img :src="p.gambar" class="w-9 h-9 rounded-lg object-cover shrink-0" :alt="p.nama" />
                  <span class="font-medium text-gray-800">{{ p.nama }}</span>
                </div>
              </td>
              <td class="px-5 py-3"><span class="badge bg-gray-100 text-gray-500">{{ p.kategori }}</span></td>
              <td class="px-5 py-3 text-gray-700">{{ p.terjual }}</td>
              <td class="px-5 py-3 font-semibold text-gray-800">{{ formatRupiah(p.terjual * p.harga) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import Chart from 'chart.js/auto'
import DashboardCard from '../components/DashboardCard.vue'
import { getAllProducts, getAllTransactions } from '../db/LocalDb'
import { formatRupiah, formatRupiahShort } from '../composables/useFormat'

const allProducts = ref([])
const allTransactions = ref([])
const periode = ref('Minggu Ini')
const periodeOptions = ['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Semua']

const categoryChartRef = ref(null)
const metodeChartRef = ref(null)
let categoryChart = null
let metodeChart = null

const summary = computed(() => {
  const totalOmset = allTransactions.value.reduce((sum, t) => sum + t.total, 0)
  const totalTransaksi = allTransactions.value.length
  const totalItem = allTransactions.value.reduce((sum, t) => sum + t.items, 0)
  const rataRata = totalTransaksi ? Math.round(totalOmset / totalTransaksi) : 0
  return { totalOmset, totalTransaksi, totalItem, rataRata }
})

const topProducts = computed(() => [...allProducts.value].sort((a, b) => b.terjual - a.terjual).slice(0, 6))

const categoryBreakdown = computed(() => {
  const map = {}
  allProducts.value.forEach(p => {
    map[p.kategori] = (map[p.kategori] || 0) + p.terjual
  })
  return map
})

const metodeBreakdown = computed(() => {
  const map = { Cash: 0, QRIS: 0, Transfer: 0 }
  allTransactions.value.forEach(t => {
    map[t.metode] = (map[t.metode] || 0) + 1
  })
  return map
})

async function loadData() {
  allProducts.value = await getAllProducts()
  allTransactions.value = await getAllTransactions()
}

function renderCategoryChart() {
  if (categoryChart) categoryChart.destroy()
  const ctx = categoryChartRef.value.getContext('2d')
  categoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(categoryBreakdown.value),
      datasets: [{
        data: Object.values(categoryBreakdown.value),
        backgroundColor: '#1f8c4d',
        borderRadius: 8,
        maxBarThickness: 36
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { color: '#f3f4f6' } },
        x: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { display: false } }
      }
    }
  })
}

function renderMetodeChart() {
  if (metodeChart) metodeChart.destroy()
  const ctx = metodeChartRef.value.getContext('2d')
  metodeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Tunai', 'QRIS', 'Transfer'],
      datasets: [{
        data: [metodeBreakdown.value.Cash, metodeBreakdown.value.QRIS, metodeBreakdown.value.Transfer],
        backgroundColor: ['#1f8c4d', '#f97316', '#3b82f6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, color: '#6b7280' } }
      },
      cutout: '65%'
    }
  })
}

function exportCsv() {
  const headers = ['Kode', 'Tanggal', 'Waktu', 'Item', 'Subtotal', 'PPN', 'Diskon', 'Total', 'Metode', 'Kasir']
  const rows = allTransactions.value.map(t => [t.kode, t.tanggal, t.waktu, t.items, t.subtotal, t.ppn, t.diskon, t.total, t.metode, t.kasir])
  const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `laporan-niki-frozen-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await loadData()
  await nextTick()
  renderCategoryChart()
  renderMetodeChart()
})

watch([allProducts, allTransactions], async () => {
  await nextTick()
  if (categoryChartRef.value) renderCategoryChart()
  if (metodeChartRef.value) renderMetodeChart()
})
</script>
