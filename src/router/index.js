import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

import LoginKasir from '../views/LoginKasir.vue'
import Dashboard from '../views/Dashboard.vue'
import TransaksiKasir from '../views/TransaksiKasir.vue'
import Produk from '../views/Produk.vue'
import StokBarang from '../views/StokBarang.vue'
import RiwayatPenjualan from '../views/RiwayatPenjualan.vue'
import Laporan from '../views/Laporan.vue'
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
  const { isAuthenticated } = useAuth()
  if (!to.meta.public && !isAuthenticated()) {
    return { name: 'login' }
  }
  if (to.name === 'login' && isAuthenticated()) {
    return { name: 'dashboard' }
  }
  return true
})

export default router