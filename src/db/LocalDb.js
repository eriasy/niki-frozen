import Dexie from 'dexie'

// =====================================================
// NIKI Frozen — Local Database (IndexedDB via Dexie)
// Offline-first storage untuk produk, transaksi, & user
// =====================================================

export const db = new Dexie('niki_frozen_db')

db.version(1).stores({
  products: '++id, nama, kategori, harga, stok, terjual, status, gambar',
  transactions: '++id, kode, tanggal, waktu, items, subtotal, ppn, diskon, total, metode, kasir',
  users: '++id, username, password, nama, role'
})

// ---------- Helpers ----------
function formatKode(n) {
  return `TRX-${2400 + n}`
}

// ---------- Seed Data ----------
const seedProducts = [
  {
    nama: 'Bakso Sapi Premium',
    kategori: 'Daging',
    harga: 35000,
    stok: 48,
    terjual: 214,
    status: 'Tersedia',
    gambar: '/images/bakso-sapi-premium.jpg'
  },
  {
    nama: 'Udang Kupas Beku',
    kategori: 'Seafood',
    harga: 52000,
    stok: 32,
    terjual: 187,
    status: 'Tersedia',
    gambar: '/images/udang-kupas-beku.jpg'
  },
  {
    nama: 'Nugget Ayam Crispy',
    kategori: 'Daging',
    harga: 28000,
    stok: 5,
    terjual: 312,
    status: 'Kritis',
    gambar: '/images/nugget-ayam-crispy.jpg'
  },
  {
    nama: 'Edamame Beku',
    kategori: 'Sayuran',
    harga: 18000,
    stok: 60,
    terjual: 96,
    status: 'Tersedia',
    gambar: '/images/edamame-beku.jpg'
  },
  {
    nama: 'Es Krim Vanila',
    kategori: 'Dessert',
    harga: 45000,
    stok: 24,
    terjual: 156,
    status: 'Tersedia',
    gambar: '/images/es-krim-vanila.jpg'
  },
  {
    nama: 'Cumi Goreng Tepung',
    kategori: 'Seafood',
    harga: 42000,
    stok: 18,
    terjual: 143,
    status: 'Tersedia',
    gambar: '/images/cumi-goreng-tepung.jpg'
  },
  {
    nama: 'Kentang Goreng Beku',
    kategori: 'Sayuran',
    harga: 22000,
    stok: 3,
    terjual: 278,
    status: 'Kritis',
    gambar: '/images/kentang-goreng-beku.jpg'
  },
  {
    nama: 'Jus Jeruk Frozen',
    kategori: 'Minuman',
    harga: 15000,
    stok: 40,
    terjual: 89,
    status: 'Tersedia',
    gambar: '/images/jus-jeruk-frozen.jpg'
  },
  {
    nama: 'Sosis Sapi Jumbo',
    kategori: 'Daging',
    harga: 32000,
    stok: 55,
    terjual: 201,
    status: 'Tersedia',
    gambar: '/images/sosis-sapi-jumbo.jpg'
  },
  {
    nama: 'Ikan Dori Fillet',
    kategori: 'Seafood',
    harga: 48000,
    stok: 7,
    terjual: 121,
    status: 'Kritis',
    gambar: '/images/ikan-dori-fillet.jpg'
  },
  {
    nama: 'Wortel Beku Slice',
    kategori: 'Sayuran',
    harga: 16000,
    stok: 70,
    terjual: 64,
    status: 'Tersedia',
    gambar: '/images/wortel-beku-slice.jpg'
  },
  {
    nama: 'Puding Cokelat Cup',
    kategori: 'Dessert',
    harga: 12000,
    stok: 45,
    terjual: 132,
    status: 'Tersedia',
    gambar: '/images/puding-coklat-cup.jpg'
  }
]

const seedUsers = [
  { username: 'rina', password: 'rina123', nama: 'Rina', role: 'Kasir Utama' },
  { username: 'budi', password: 'budi123', nama: 'Budi', role: 'Kasir' },
  { username: 'sari', password: 'sari123', nama: 'Sari', role: 'Kasir' },
  { username: 'admin', password: 'admin123', nama: 'Admin', role: 'Pemilik Toko' }
]

const seedTransactions = [
  { kode: 'TRX-2408', tanggal: today(), waktu: '14:32', items: 4, subtotal: 115315, ppn: 12685, diskon: 0, total: 128000, metode: 'QRIS', kasir: 'Rina' },
  { kode: 'TRX-2407', tanggal: today(), waktu: '14:18', items: 2, subtotal: 63063, ppn: 6937, diskon: 0, total: 70000, metode: 'Cash', kasir: 'Budi' },
  { kode: 'TRX-2406', tanggal: today(), waktu: '13:55', items: 7, subtotal: 220720, ppn: 24280, diskon: 0, total: 245000, metode: 'Transfer', kasir: 'Rina' },
  { kode: 'TRX-2405', tanggal: today(), waktu: '13:40', items: 1, subtotal: 31531, ppn: 3469, diskon: 0, total: 35000, metode: 'Cash', kasir: 'Sari' },
  { kode: 'TRX-2404', tanggal: today(), waktu: '13:12', items: 5, subtotal: 164865, ppn: 18135, diskon: 0, total: 183000, metode: 'QRIS', kasir: 'Budi' }
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

// ---------- Seeding Logic ----------
export async function seedDatabaseIfEmpty() {
  const productCount = await db.products.count()
  if (productCount === 0) {
    await db.products.bulkAdd(seedProducts)
  }

  const userCount = await db.users.count()
  if (userCount === 0) {
    await db.users.bulkAdd(seedUsers)
  }

  const trxCount = await db.transactions.count()
  if (trxCount === 0) {
    await db.transactions.bulkAdd(seedTransactions)
  }
}

// ---------- Product Queries ----------
export async function getAllProducts() {
  return db.products.toArray()
}

export async function getProductsByCategory(kategori) {
  if (!kategori || kategori === 'Semua') return db.products.toArray()
  return db.products.where('kategori').equals(kategori).toArray()
}

export async function addProduct(product) {
  return db.products.add(product)
}

export async function updateProduct(id, changes) {
  return db.products.update(id, changes)
}

export async function deleteProduct(id) {
  return db.products.delete(id)
}

export async function decrementStock(id, qty) {
  const product = await db.products.get(id)
  if (!product) return
  const newStok = Math.max(0, product.stok - qty)
  const newTerjual = product.terjual + qty
  let status = 'Tersedia'
  if (newStok <= 10) status = 'Kritis'
  if (newStok === 0) status = 'Habis'
  await db.products.update(id, { stok: newStok, terjual: newTerjual, status })
}

// ---------- Transaction Queries ----------
export async function getAllTransactions() {
  return db.transactions.orderBy('id').reverse().toArray()
}

export async function getRecentTransactions(limit = 5) {
  const all = await db.transactions.orderBy('id').reverse().limit(limit).toArray()
  return all
}

export async function createTransaction(transaction) {
  const count = await db.transactions.count()
  const kode = formatKode(count + 1)
  return db.transactions.add({ ...transaction, kode })
}

// ---------- User / Auth Queries ----------
export async function findUserByCredentials(username, password) {
  return db.users.where({ username, password }).first()
}

export async function getUserByUsername(username) {
  return db.users.where('username').equals(username).first()
}

export async function updateUserPassword(id, newPassword) {
  return db.users.update(id, { password: newPassword })
}

// ---------- Stats for Dashboard ----------
export async function getDashboardStats() {
  const transactions = await db.transactions.toArray()
  const products = await db.products.toArray()

  const todayStr = today()
  const todayTrx = transactions.filter(t => t.tanggal === todayStr)
  const omsetHariIni = todayTrx.reduce((sum, t) => sum + t.total, 0)
  const totalTransaksiHariIni = todayTrx.length

  const produkTerlaris = [...products].sort((a, b) => b.terjual - a.terjual)[0]
  const stokKritis = products.filter(p => p.status === 'Kritis' || p.status === 'Habis')

  return {
    omsetHariIni,
    totalTransaksiHariIni,
    produkTerlaris,
    stokKritisCount: stokKritis.length,
    stokKritisList: stokKritis
  }
}

export default db