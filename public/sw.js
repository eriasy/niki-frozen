// =====================================================
// Service Worker - NIKI Frozen POS
// Bagian dari Auto-Sync Engine (Backlog 2).
//
// CATATAN JUJUR soal keterbatasan:
// Service Worker ini TIDAK langsung akses Dexie/IndexedDB atau
// kirim data sendiri ke backend. Alasannya: Dexie butuh proses
// bundling khusus biar bisa jalan di scope Service Worker, dan
// itu di luar setup Vite standar tanpa plugin PWA tambahan.
//
// Yang beneran terjadi: Service Worker ini pake Background Sync
// API buat MINTA IZIN ke browser "kabarin saya kalau koneksi balik
// online", walau tab appnya lagi gak fokus/di-minimize. Begitu event
// itu nyala, SW ini nge-relay pesan ke tab yang lagi kebuka biar
// logic sync (yang ada di useSyncManager.js, jalan di main thread)
// yang beneran eksekusi push data ke backend.
//
// Kalau SEMUA tab NIKI Frozen tertutup total, sync gak akan jalan
// sampai ada tab dibuka lagi - ini trade-off yang wajar buat POS
// app kayak gini (kasir realistisnya selalu punya tab kebuka
// sepanjang shift).
// =====================================================

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Background Sync API - browser bakal manggil ini begitu koneksi
// balik online, walau tab lagi di-minimize (di browser yang support,
// terutama Chrome/Edge berbasis Chromium)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(notifyClientsToSync())
  }
})

async function notifyClientsToSync() {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true })
  allClients.forEach((client) => {
    client.postMessage({ type: 'SYNC_TRANSACTIONS' })
  })
}