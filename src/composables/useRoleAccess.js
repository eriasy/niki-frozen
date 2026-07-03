// =====================================================
// Aturan akses menu & routing berdasarkan role user
// Role yang didukung: 'Kasir', 'Kasir Utama', 'Admin', 'Pemilik Toko'
// =====================================================

export const ROLE_ACCESS = {
  'Kasir': ['/kasir', '/riwayat', '/profil'],
  'Kasir Utama': ['/', '/kasir', '/stok', '/riwayat', '/profil'],
  'Admin': ['/', '/produk', '/stok', '/riwayat', '/laporan', '/profil'],
  'Pemilik Toko': ['/', '/produk', '/stok', '/riwayat', '/laporan', '/profil']
}

// Halaman yang dituju setelah login, sesuai role masing-masing
export const ROLE_DEFAULT_ROUTE = {
  'Kasir': '/kasir',
  'Kasir Utama': '/',
  'Admin': '/',
  'Pemilik Toko': '/'
}

export function canAccess(role, path) {
  const allowed = ROLE_ACCESS[role]
  if (!allowed) return false
  return allowed.includes(path)
}

export function defaultRouteForRole(role) {
  return ROLE_DEFAULT_ROUTE[role] || '/kasir'
}

export function useRoleAccess() {
  return { ROLE_ACCESS, ROLE_DEFAULT_ROUTE, canAccess, defaultRouteForRole }
}