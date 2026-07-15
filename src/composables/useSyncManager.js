import { ref } from 'vue'
import http from '../services/http'
import { getUnsyncedTransactions, markTransactionSynced } from '../db/LocalDb'

// =====================================================
// Auto-Sync Engine (Backlog 2)
// Deteksi status jaringan & dorong transaksi yang dibuat
// offline ke backend Laravel begitu koneksi balik online.
// =====================================================

// State di-share ke seluruh app (bukan per-komponen), biar
// SyncIndicator.vue dkk semua liat status yang sama
const isOnline = ref(navigator.onLine)
const syncStatus = ref('idle') // 'idle' | 'syncing' | 'success' | 'error'
const pendingCount = ref(0)
const lastSyncError = ref('')

let syncInterval = null
let initialized = false

async function refreshPendingCount() {
  try {
    const unsynced = await getUnsyncedTransactions()
    pendingCount.value = unsynced.length
  } catch {
    // Gagal baca IndexedDB, biarin aja, gak fatal
  }
}

// Ubah 1 transaksi lokal jadi format payload yang diterima endpoint
// POST /transactions di backend (lihat TransactionController@store)
function toBackendPayload(trx) {
  return {
    items: (trx.itemsDetail || []).map(i => ({ product_id: i.productId, qty: i.qty })),
    diskon_percent: trx.diskonPercent || 0,
    metode: trx.metode,
    nominal_bayar: trx.nominalBayar || undefined
  }
}

async function syncNow() {
  if (!navigator.onLine) return
  if (syncStatus.value === 'syncing') return // hindari sync dobel bersamaan

  const unsynced = await getUnsyncedTransactions()
  if (unsynced.length === 0) {
    pendingCount.value = 0
    return
  }

  syncStatus.value = 'syncing'
  lastSyncError.value = ''

  for (const trx of unsynced) {
    // Transaksi lama (sebelum fitur sync ada) gak punya itemsDetail -> skip,
    // gak bisa direkonstruksi ulang ke backend
    if (!trx.itemsDetail || trx.itemsDetail.length === 0) {
      await markTransactionSynced(trx.id)
      continue
    }

    try {
      await http.post('/transactions', toBackendPayload(trx))
      await markTransactionSynced(trx.id)
    } catch (err) {
      // Kalau 1 transaksi gagal (misal koneksi putus di tengah jalan),
      // stop loop - sisanya dicoba lagi di kesempatan sync berikutnya
      lastSyncError.value = err.response?.data?.message || 'Gagal sync ke server.'
      syncStatus.value = 'error'
      await refreshPendingCount()
      return
    }
  }

  syncStatus.value = 'success'
  await refreshPendingCount()
}

function handleOnline() {
  isOnline.value = true
  syncNow()
}

function handleOffline() {
  isOnline.value = false
  syncStatus.value = 'idle'
}

// Inisialisasi sekali aja buat seluruh app (dipanggil dari main.js atau App.vue)
export function initSyncManager() {
  if (initialized) return
  initialized = true

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  refreshPendingCount()

  // Coba sync tiap kali app dibuka, kalau kebetulan lagi online & ada yang pending
  if (navigator.onLine) syncNow()

  // Fallback polling tiap 30 detik - jaga-jaga event 'online' gak ke-trigger
  // (misal di jaringan yang flaky/captive portal)
  syncInterval = setInterval(() => {
    if (navigator.onLine) syncNow()
  }, 30000)
}

export function useSyncManager() {
  return {
    isOnline,
    syncStatus,
    pendingCount,
    lastSyncError,
    syncNow,
    refreshPendingCount
  }
}