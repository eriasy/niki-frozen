import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { seedDatabaseIfEmpty, ensureDefaultRoles } from './db/LocalDb'
import { initSyncManager, useSyncManager } from './composables/useSyncManager'

const app = createApp(App)
app.use(router)

seedDatabaseIfEmpty()
  .then(ensureDefaultRoles)
  .finally(() => {
    app.mount('#app')
  })

// ---------- Auto-Sync Engine: Service Worker + Sync Manager ----------
initSyncManager()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    // Gagal register SW (misal browser gak support) - gak fatal,
    // fallback ke deteksi 'online'/'offline' + polling di useSyncManager tetep jalan
  })

  // Relay pesan dari Service Worker ('koneksi balik, tolong sync') ke Sync Manager
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_TRANSACTIONS') {
      const { syncNow } = useSyncManager()
      syncNow()
    }
  })
}