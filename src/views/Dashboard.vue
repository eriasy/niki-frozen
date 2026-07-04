<template>
  <div class="space-y-5 max-w-6xl">
    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        label="Omset Hari Ini"
        :value="formatRupiahShort(stats.omsetHariIni)"
        icon="📈"
        trend="+12.4% vs kemarin"
        :trendUp="true"
        iconBg="bg-brand-50"
      />
      <DashboardCard
        label="Total Transaksi"
        :value="String(stats.totalTransaksiHariIni)"
        icon="🧾"
        subtext="Hari ini"
        iconBg="bg-orange-50"
      />
      <DashboardCard
        label="Produk Terlaris"
        :value="stats.produkTerlaris?.nama || '-'"
        icon="⭐"
        :subtext="`${stats.produkTerlaris?.terjual || 0} terjual`"
        subtextColor="text-gray-400"
        iconBg="bg-yellow-50"
      />
      <DashboardCard
        label="Stok Kritis"
        :value="String(stats.stokKritisCount)"
        icon="⚠️"
        subtext="Perlu restock segera"
        subtextColor="text-red-500"
        iconBg="bg-red-50"
      />
    </div>

    <!-- Chart: muncul buat semua yang punya akses dashboard (ringkas & penuh) -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-bold text-gray-800">Penjualan 7 Hari Terakhir</h3>
          <p class="text-xs text-gray-400">Omset gabungan harian (Rp)</p>
        </div>
        <span class="badge badge-green">Live dari transaksi</span>
      </div>
      <div class="h-64">
        <canvas ref="salesChartCanvas"></canvas>
      </div>
    </div>

    <div v-if="dashboardLevel === 'penuh'" class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-gray-800">Komparasi Antar Cabang</h3>
            <p class="text-xs text-gray-400">Omset per cabang</p>
          </div>
          <span class="badge badge-orange">Periode aktif</span>
        </div>
        <div class="h-64">
          <canvas ref="branchChartCanvas"></canvas>
        </div>
      </div>

      <div class="card">
        <h3 class="font-bold text-gray-800 mb-4">Ringkasan Operasional</h3>
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
            <span>Omset hari ini</span>
            <span class="font-semibold text-gray-800">{{ formatRupiahShort(stats.omsetHariIni) }}</span>
          </div>
          <div class="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
            <span>Transaksi hari ini</span>
            <span class="font-semibold text-gray-800">{{ stats.totalTransaksiHariIni }} trx</span>
          </div>
          <div class="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
            <span>Cabang paling aktif</span>
            <span class="font-semibold text-gray-800">{{ branchSeries.labels[0] || '-' }}</span>
          </div>
          <div class="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
            <span>Target pencapaian</span>
            <span class="font-semibold text-brand-600">{{ branchSeries.data[0] ? formatRupiahShort(branchSeries.data[0]) : 'Rp 0' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stok kritis & Transaksi terakhir -->
    <div v-if="dashboardLevel === 'penuh'" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="card">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="text-orange-500">⚠️</span> Stok Kritis
        </h3>
        <div class="space-y-4">
          <div v-for="p in stats.stokKritisList" :key="p.id" class="flex items-center gap-3">
            <img :src="p.gambar" class="w-10 h-10 rounded-lg object-cover shrink-0" :alt="p.nama" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-red-500 truncate">{{ p.nama }}</p>
              <div class="w-full h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  class="h-full bg-red-400 rounded-full"
                  :style="{ width: Math.min(100, (p.stok / 60) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <span class="text-sm font-semibold text-red-500 shrink-0">{{ p.stok }} pak</span>
          </div>
          <p v-if="stats.stokKritisList.length === 0" class="text-sm text-gray-400 text-center py-4">
            Tidak ada stok kritis saat ini 🎉
          </p>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-800">Transaksi Terakhir</h3>
          <router-link to="/riwayat" class="text-xs text-brand-600 font-medium hover:underline">Lihat Semua →</router-link>
        </div>
        <div class="overflow-x-auto thin-scroll">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-400 uppercase">
                <th class="pb-2 font-medium">ID Transaksi</th>
                <th class="pb-2 font-medium">Waktu</th>
                <th class="pb-2 font-medium">Item</th>
                <th class="pb-2 font-medium">Total</th>
                <th class="pb-2 font-medium">Metode</th>
                <th class="pb-2 font-medium">Kasir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in recentTransactions" :key="t.id" class="border-t border-gray-50">
                <td class="py-2.5 text-brand-600 font-medium">{{ t.kode }}</td>
                <td class="py-2.5 text-gray-500">{{ t.waktu }}</td>
                <td class="py-2.5 text-gray-500">{{ t.items }} produk</td>
                <td class="py-2.5 font-semibold text-gray-800">{{ formatRupiah(t.total) }}</td>
                <td class="py-2.5">
                  <span
                    class="badge"
                    :class="{
                      'badge-orange': t.metode === 'QRIS',
                      'badge-green': t.metode === 'Cash',
                      'bg-blue-50 text-blue-600': t.metode === 'Transfer'
                    }"
                  >
                    {{ t.metode }}
                  </span>
                </td>
                <td class="py-2.5 text-gray-500">{{ t.kasir }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Versi ringkas: pesan singkat pengganti tabel transaksi -->
    <div v-else class="card text-center py-6">
      <p class="text-sm text-gray-400">Detail transaksi terakhir hanya tersedia untuk Admin & Owner.</p>
      <router-link to="/riwayat" class="text-sm text-brand-600 font-medium hover:underline mt-2 inline-block">Lihat Riwayat Penjualan →</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import DashboardCard from '../components/DashboardCard.vue'
import { getDashboardStats, getRecentTransactions, getAllTransactions } from '../db/LocalDb'
import { formatRupiah, formatRupiahShort } from '../composables/useFormat'
import { useAuth } from '../composables/useAuth'
import { featureLevel } from '../composables/useRoleAccess'

const { currentUser } = useAuth()
const dashboardLevel = computed(() => featureLevel(currentUser.value?.role, 'dashboard'))

const stats = ref({
  omsetHariIni: 0,
  totalTransaksiHariIni: 0,
  produkTerlaris: null,
  stokKritisCount: 0,
  stokKritisList: []
})
const recentTransactions = ref([])
const transactions = ref([])
const salesChartCanvas = ref(null)
const branchChartCanvas = ref(null)
let salesChartInstance = null
let branchChartInstance = null

function buildSalesSeries(data) {
  const labels = []
  const values = []
  const start = new Date()
  start.setDate(start.getDate() - 6)

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const key = date.toISOString().slice(0, 10)
    labels.push(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))
    const total = data.filter(item => item.tanggal === key).reduce((sum, item) => sum + (item.total || 0), 0)
    values.push(total)
  }

  return { labels, values }
}

function buildBranchSeries(data) {
  const totals = data.reduce((acc, item) => {
    const branch = item.cabang || 'Cabang Utama'
    acc[branch] = (acc[branch] || 0) + (item.total || 0)
    return acc
  }, {})

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1])
  return {
    labels: entries.map(([name]) => name),
    data: entries.map(([, total]) => total)
  }
}

const salesSeries = computed(() => buildSalesSeries(transactions.value))
const branchSeries = computed(() => buildBranchSeries(transactions.value))

async function loadData() {
  stats.value = await getDashboardStats()
  recentTransactions.value = await getRecentTransactions(5)
  transactions.value = await getAllTransactions()
}

function renderCharts() {
  if (salesChartInstance) salesChartInstance.destroy()
  if (branchChartInstance) branchChartInstance.destroy()

  if (!salesChartCanvas.value) return

  const salesCtx = salesChartCanvas.value.getContext('2d')

  const salesGradient = salesCtx.createLinearGradient(0, 0, 0, 250)
  salesGradient.addColorStop(0, 'rgba(31, 140, 77, 0.25)')
  salesGradient.addColorStop(1, 'rgba(31, 140, 77, 0)')

  salesChartInstance = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: salesSeries.value.labels,
      datasets: [
        {
          label: 'Omset Gabungan',
          data: salesSeries.value.values,
          borderColor: '#1f8c4d',
          backgroundColor: salesGradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#1f8c4d',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2937',
          padding: 10,
          callbacks: {
            label: (ctx) => `Omset: Rp ${ctx.parsed.y.toLocaleString('id-ID')}`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (val) => (val / 1000000).toFixed(1) + 'jt',
            color: '#9ca3af',
            font: { size: 11 }
          },
          grid: { color: '#f3f4f6' }
        },
        x: {
          ticks: { color: '#9ca3af', font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  })

  if (branchChartCanvas.value) {
    const branchCtx = branchChartCanvas.value.getContext('2d')

    branchChartInstance = new Chart(branchCtx, {
      type: 'bar',
      data: {
        labels: branchSeries.value.labels,
        datasets: [
          {
            label: 'Omset Cabang',
            data: branchSeries.value.data,
            backgroundColor: ['#1f8c4d', '#f59e0b', '#3b82f6'],
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1f2937',
            padding: 10,
            callbacks: {
              label: (ctx) => `Omset: Rp ${ctx.parsed.y.toLocaleString('id-ID')}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (val) => 'Rp ' + (val / 1000000).toFixed(1) + 'jt',
              color: '#9ca3af',
              font: { size: 11 }
            },
            grid: { color: '#f3f4f6' }
          },
          x: {
            ticks: { color: '#9ca3af', font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    })
  }
}

onMounted(async () => {
  await loadData()
  await nextTick()
  renderCharts()
})
</script>