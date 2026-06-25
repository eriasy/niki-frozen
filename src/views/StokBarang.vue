<template>
  <div class="max-w-6xl">
    <div class="flex items-center justify-between mb-5 gap-4">
      <div class="relative max-w-md flex-1">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="Cari produk..." class="input-field pl-10" />
      </div>
      <select v-model="filterStatus" class="input-field max-w-[180px]">
        <option value="Semua">Semua status</option>
        <option value="Tersedia">Tersedia</option>
        <option value="Kritis">Kritis</option>
        <option value="Habis">Habis</option>
      </select>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Total Produk</p>
        <p class="text-2xl font-bold text-gray-800 mt-1.5">{{ allProducts.length }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Stok Kritis</p>
        <p class="text-2xl font-bold text-red-500 mt-1.5">{{ kritisCount }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-medium text-gray-400 uppercase">Total Unit Stok</p>
        <p class="text-2xl font-bold text-gray-800 mt-1.5">{{ totalStok }} pak</p>
      </div>
    </div>

    <div class="card !p-0 overflow-hidden">
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">Produk</th>
              <th class="px-5 py-3 font-medium">Kategori</th>
              <th class="px-5 py-3 font-medium">Stok Saat Ini</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th class="px-5 py-3 font-medium text-right">Sesuaikan Stok</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProducts" :key="p.id" class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <img :src="p.gambar" class="w-9 h-9 rounded-lg object-cover shrink-0" :alt="p.nama" />
                  <span class="font-medium text-gray-800">{{ p.nama }}</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="badge bg-gray-100 text-gray-500">{{ p.kategori }}</span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="p.stok <= 10 ? 'bg-red-400' : 'bg-brand-500'"
                      :style="{ width: Math.min(100, (p.stok / 60) * 100) + '%' }"
                    ></div>
                  </div>
                  <span :class="p.stok <= 10 ? 'text-red-500 font-semibold' : 'text-gray-700'">{{ p.stok }} pak</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="badge" :class="statusBadgeClass(p.status)">{{ p.status }}</span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1.5 justify-end">
                  <button @click="adjustStock(p, -1)" class="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 flex items-center justify-center">−</button>
                  <button @click="adjustStock(p, 1)" class="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 flex items-center justify-center">+</button>
                  <button @click="openRestockModal(p)" class="text-xs text-brand-600 font-medium hover:underline ml-1">Restock</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="filteredProducts.length === 0" class="text-center text-gray-400 py-10 text-sm">
          Tidak ada produk yang cocok.
        </p>
      </div>
    </div>

    <!-- Restock modal -->
    <Transition name="modal">
      <div v-if="restockingProduct" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="restockingProduct = null">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6">
          <h3 class="font-bold text-gray-800 mb-1">Restock — {{ restockingProduct.nama }}</h3>
          <p class="text-sm text-gray-400 mb-4">Stok saat ini: {{ restockingProduct.stok }} pak</p>
          <label class="text-sm font-medium text-gray-700 block mb-1.5">Jumlah tambahan</label>
          <input v-model.number="restockQty" type="number" min="1" class="input-field mb-5" placeholder="Contoh: 50" />
          <div class="flex gap-3">
            <button @click="restockingProduct = null" class="btn-outline flex-1">Batal</button>
            <button @click="executeRestock" class="btn-primary flex-1">Simpan</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllProducts, updateProduct } from '../db/LocalDb'

const allProducts = ref([])
const searchQuery = ref('')
const filterStatus = ref('Semua')
const restockingProduct = ref(null)
const restockQty = ref(0)

const filteredProducts = computed(() => {
  let list = allProducts.value
  if (filterStatus.value !== 'Semua') {
    list = list.filter(p => p.status === filterStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p => p.nama.toLowerCase().includes(q))
  }
  return list
})

const kritisCount = computed(() => allProducts.value.filter(p => p.status === 'Kritis' || p.status === 'Habis').length)
const totalStok = computed(() => allProducts.value.reduce((sum, p) => sum + p.stok, 0))

function statusBadgeClass(status) {
  if (status === 'Tersedia') return 'badge-green'
  if (status === 'Kritis') return 'badge-orange'
  return 'badge-red'
}

function deriveStatus(stok) {
  if (stok === 0) return 'Habis'
  if (stok <= 10) return 'Kritis'
  return 'Tersedia'
}

async function loadProducts() {
  allProducts.value = await getAllProducts()
}

async function adjustStock(product, delta) {
  const newStok = Math.max(0, product.stok + delta)
  await updateProduct(product.id, { stok: newStok, status: deriveStatus(newStok) })
  await loadProducts()
}

function openRestockModal(product) {
  restockingProduct.value = product
  restockQty.value = 0
}

async function executeRestock() {
  if (!restockingProduct.value || restockQty.value <= 0) return
  const newStok = restockingProduct.value.stok + restockQty.value
  await updateProduct(restockingProduct.value.id, { stok: newStok, status: deriveStatus(newStok) })
  await loadProducts()
  restockingProduct.value = null
}

onMounted(loadProducts)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
