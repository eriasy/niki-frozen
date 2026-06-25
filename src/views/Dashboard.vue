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

    <!-- Chart -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-bold text-gray-800">Penjualan Minggu Ini</h3>
          <p class="text-xs text-gray-400">Omset harian (Rp)</p>
        </div>
        <span class="badge badge-green">+18.2% minggu lalu</span>
      </div>
      <div class="h-64">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <!-- Stok kritis & Transaksi terakhir -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import DashboardCard from '../components/DashboardCard.vue'
import { getDashboardStats, getRecentTransactions } from '../db/LocalDb'
import { formatRupiah, formatRupiahShort } from '../composables/useFormat'

const stats = ref({
  omsetHariIni: 0,
  totalTransaksiHariIni: 0,
  produkTerlaris: null,
  stokKritisCount: 0,
  stokKritisList: []
})
const recentTransactions = ref([])
const chartCanvas = ref(null)
let chartInstance = null

const weeklyLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const weeklyData = [1900000, 2100000, 1700000, 2400000, 2900000, 3400000, 3100000]

async function loadData() {
  stats.value = await getDashboardStats()
  recentTransactions.value = await getRecentTransactions(5)
}

function renderChart() {
  if (chartInstance) chartInstance.destroy()
  const ctx = chartCanvas.value.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 0, 250)
  gradient.addColorStop(0, 'rgba(31, 140, 77, 0.25)')
  gradient.addColorStop(1, 'rgba(31, 140, 77, 0)')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeklyLabels,
      datasets: [
        {
          label: 'Omset',
          data: weeklyData,
          borderColor: '#1f8c4d',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
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
}

onMounted(async () => {
  await loadData()
  await nextTick()
  renderChart()
})
</script>
