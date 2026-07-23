// =====================================================
// Aturan akses menu, routing, & fitur berdasarkan role user
// Role yang didukung: 'Kasir', 'Kasir Utama', 'Admin', 'Pemilik Toko'
// Sesuai matrix "Hak Akses Pengguna Sistem Kasir"
// =====================================================

// Halaman apa aja yang boleh dibuka tiap role (level menu/routing)
export const ROLE_ACCESS = {
  'Kasir': ['/kasir', '/riwayat', '/profil'],
  'Kasir Utama': ['/', '/kasir', '/stok', '/riwayat', '/profil'],
  'Admin': ['/', '/produk', '/stok', '/riwayat', '/laporan', '/pengguna', '/cabang', '/profil'],
  'Pemilik Toko': ['/', '/produk', '/stok', '/riwayat', '/laporan', '/pengguna', '/cabang', '/profil']
}

// Halaman yang dituju setelah login, sesuai role masing-masing
export const ROLE_DEFAULT_ROUTE = {
  'Kasir': '/kasir',
  'Kasir Utama': '/',
  'Admin': '/',
  'Pemilik Toko': '/'
}

// Level akses DI DALAM halaman yang sama (bukan cuma buka/tutup menu)
// dashboard: 'ringkas' | 'penuh'
// stok: 'lihat' | 'kelola'  -> 'lihat' = read-only, 'kelola' = boleh adjust/restock
// riwayat: 'sendiri' | 'semua'
// laporan: 'operasional' | 'penuh' -> 'penuh' nambahin data profit
// produk: 'edit' | 'penuh' -> 'penuh' boleh hapus produk, 'edit' cuma tambah/ubah
// pengguna: 'sendiri' | 'kelola' -> 'kelola' boleh atur akun staf lain
export const ROLE_FEATURES = {
  'Kasir': {
    dashboard: null,
    stok: null,
    riwayat: 'sendiri',
    laporan: null,
    produk: null,
    pengguna: 'sendiri'
  },
  'Kasir Utama': {
    dashboard: 'ringkas',
    stok: 'lihat',
    riwayat: 'semua',
    laporan: null,
    produk: null,
    pengguna: 'sendiri'
  },
  'Admin': {
    dashboard: 'penuh',
    stok: 'kelola',
    riwayat: 'semua',
    laporan: 'operasional',
    produk: 'edit',
    pengguna: 'kelola'
  },
  'Pemilik Toko': {
    dashboard: 'penuh',
    stok: 'kelola',
    riwayat: 'semua',
    laporan: 'penuh',
    produk: 'penuh',
    pengguna: 'kelola'
  }
}

export function canAccess(role, path) {
  const allowed = ROLE_ACCESS[role]
  if (!allowed) return false
  return allowed.includes(path)
}

export function defaultRouteForRole(role) {
  return ROLE_DEFAULT_ROUTE[role] || '/kasir'
}

export function featureLevel(role, feature) {
  return ROLE_FEATURES[role]?.[feature] ?? null
}

export function useRoleAccess() {
  return { ROLE_ACCESS, ROLE_DEFAULT_ROUTE, ROLE_FEATURES, canAccess, defaultRouteForRole, featureLevel }
}