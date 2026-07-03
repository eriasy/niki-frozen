import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { canAccess, defaultRouteForRole } from '../composables/useRoleAccess'

import LoginKasir from '../views/LoginKasir.vue'
import Dashboard from '../views/Dashboard.vue'
import TransaksiKasir from '../views/TransaksiKasir.vue'
import Produk from '../views/Produk.vue'
import StokBarang from '../views/StokBarang.vue'
import RiwayatPenjualan from '../views/RiwayatPenjualan.vue'
import Laporan from '../views/Laporan.vue'
import ManajemenPengguna from '../views/ManajemenPengguna.vue'
import Profil from '../views/Profil.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginKasir,
    meta: { public: true }
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/kasir',
    name: 'kasir',
    component: TransaksiKasir
  },
  {
    path: '/produk',
    name: 'produk',
    component: Produk
  },
  {
    path: '/stok',
    name: 'stok',
    component: StokBarang
  },
  {
    path: '/riwayat',
    name: 'riwayat',
    component: RiwayatPenjualan
  },
  {
    path: '/laporan',
    name: 'laporan',
    component: Laporan
  },
  {
    path: '/pengguna',
    name: 'pengguna',
    component: ManajemenPengguna
  },
  {
    path: '/profil',
    name: 'profil',
    component: Profil
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const { isAuthenticated, currentUser } = useAuth()

  // Belum login & mau buka halaman privat -> lempar ke login
  if (!to.meta.public && !isAuthenticated()) {
    return { name: 'login' }
  }

  // Udah login tapi buka /login -> lempar ke halaman default role-nya
  if (to.name === 'login' && isAuthenticated()) {
    return { path: defaultRouteForRole(currentUser.value?.role) }
  }

  // Sudah login, cek apakah role-nya emang boleh buka path ini
  // (mencegah akses langsung lewat URL, bukan cuma sembunyiin menu)
  if (!to.meta.public && isAuthenticated()) {
    const role = currentUser.value?.role
    if (!canAccess(role, to.path)) {
      return { path: defaultRouteForRole(role) }
    }
  }

  return true
})

export default router