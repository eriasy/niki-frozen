<template>
  <div class="max-w-6xl">
    <div class="flex items-center justify-between mb-5 gap-4">
      <div class="relative max-w-md flex-1">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="Cari produk..." class="input-field pl-10" />
      </div>
      <button @click="openAddModal" class="btn-primary whitespace-nowrap flex items-center gap-2">
        + Tambah Produk
      </button>
    </div>

    <p class="text-sm text-gray-400 mb-3">{{ filteredProducts.length }} produk terdaftar</p>

    <div class="card !p-0 overflow-hidden">
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">Produk</th>
              <th class="px-5 py-3 font-medium">Kategori</th>
              <th class="px-5 py-3 font-medium">Harga</th>
              <th class="px-5 py-3 font-medium">Stok</th>
              <th class="px-5 py-3 font-medium">Terjual</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th class="px-5 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProducts" :key="p.id" class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <img :src="p.gambar" class="w-9 h-9 rounded-lg object-cover shrink-0" :alt="p.nama"  @error="handleImgError" />
                  <span class="font-medium text-gray-800">{{ p.nama }}</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="badge bg-gray-100 text-gray-500">{{ p.kategori }}</span>
              </td>
              <td class="px-5 py-3 text-gray-700">{{ formatRupiah(p.harga) }}</td>
              <td class="px-5 py-3" :class="p.stok <= 10 ? 'text-red-500 font-semibold' : 'text-gray-700'">
                {{ p.stok }} {{ p.satuan || 'pak' }}
              </td>
              <td class="px-5 py-3 text-gray-500">{{ p.terjual }}</td>
              <td class="px-5 py-3">
                <span class="badge" :class="p.status === 'Tersedia' ? 'badge-green' : 'badge-red'">
                  {{ p.status }}
                </span>
              </td>
              <td class="px-5 py-3 text-right">
                <button @click="openEditModal(p)" class="text-gray-400 hover:text-brand-600 px-1.5">✏️</button>
                <button @click="confirmDelete(p)" class="text-gray-400 hover:text-red-500 px-1.5">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="filteredProducts.length === 0" class="text-center text-gray-400 py-10 text-sm">
          Tidak ada produk yang cocok.
        </p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="closeModal">
        <div class="bg-white rounded-2xl w-full max-w-md p-6">
          <h3 class="font-bold text-gray-800 text-lg mb-4">{{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}</h3>
          <form @submit.prevent="saveProduct" class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Produk</label>
              <input v-model="form.nama" type="text" required class="input-field" placeholder="Contoh: Bakso Sapi Premium" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Kategori</label>
                <select v-model="form.kategori" required class="input-field">
                  <option v-for="k in ['Daging', 'Seafood', 'Sayuran', 'Dessert', 'Minuman']" :key="k" :value="k">{{ k }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Harga (Rp)</label>
                <input v-model.number="form.harga" type="number" min="0" required class="input-field" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Stok</label>
                <input v-model.number="form.stok" type="number" min="0" required class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">URL Gambar</label>
                <input v-model="form.gambar" type="text" class="input-field" placeholder="https://..." />
              </div>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" @click="closeModal" class="btn-outline flex-1">Batal</button>
              <button type="submit" class="btn-primary flex-1">{{ editingProduct ? 'Simpan' : 'Tambah' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete confirm -->
    <Transition name="modal">
      <div v-if="deletingProduct" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="deletingProduct = null">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
          <p class="text-3xl mb-2">🗑️</p>
          <h3 class="font-bold text-gray-800 mb-1">Hapus Produk?</h3>
          <p class="text-sm text-gray-400 mb-5">"{{ deletingProduct.nama }}" akan dihapus permanen.</p>
          <div class="flex gap-3">
            <button @click="deletingProduct = null" class="btn-outline flex-1">Batal</button>
            <button @click="executeDelete" class="bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-4 py-2.5 flex-1">Hapus</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../db/LocalDb'
import { formatRupiah } from '../composables/useFormat'

const allProducts = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const editingProduct = ref(null)
const deletingProduct = ref(null)

const defaultGambar = '/images/placeholder.jpg'

const form = ref({
  nama: '',
  kategori: 'Daging',
  harga: 0,
  stok: 0,
  gambar: ''
})

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return allProducts.value
  const q = searchQuery.value.trim().toLowerCase()
  return allProducts.value.filter(p => p.nama.toLowerCase().includes(q))
})

async function loadProducts() {
  allProducts.value = await getAllProducts()
}

function openAddModal() {
  editingProduct.value = null
  form.value = { nama: '', kategori: 'Daging', harga: 0, stok: 0, gambar: '' }
  showModal.value = true
}

function openEditModal(product) {
  editingProduct.value = product
  form.value = { ...product }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

function deriveStatus(stok) {
  if (stok === 0) return 'Habis'
  if (stok <= 10) return 'Kritis'
  return 'Tersedia'
}

async function saveProduct() {
  const payload = {
    ...form.value,
    gambar: form.value.gambar || defaultGambar,
    status: deriveStatus(form.value.stok)
  }

  if (editingProduct.value) {
    await updateProduct(editingProduct.value.id, payload)
  } else {
    await addProduct({ ...payload, terjual: 0 })
  }

  await loadProducts()
  closeModal()
}

function confirmDelete(product) {
  deletingProduct.value = product
}

async function executeDelete() {
  if (!deletingProduct.value) return
  await deleteProduct(deletingProduct.value.id)
  await loadProducts()
  deletingProduct.value = null
}

onMounted(loadProducts)

function handleImgError(event) {
  event.target.src = '/images/placeholder.jpg'
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>