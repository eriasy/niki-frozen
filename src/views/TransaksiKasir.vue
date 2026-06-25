<template>
  <div class="flex h-full -m-6">
    <!-- Product catalog -->
    <div class="flex-1 overflow-y-auto thin-scroll px-6 py-5">
      <div class="relative mb-4 max-w-md">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari produk..."
          class="input-field pl-10"
        />
      </div>

      <div class="flex gap-2 mb-5 overflow-x-auto thin-scroll pb-1">
        <button
          v-for="kat in kategoriList"
          :key="kat"
          @click="selectedKategori = kat"
          class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="selectedKategori === kat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
        >
          {{ kat }}
        </button>
      </div>

      <div v-if="filteredProducts.length === 0" class="text-center py-16 text-gray-400">
        <p class="text-3xl mb-2">🔎</p>
        <p class="text-sm">Produk tidak ditemukan.</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @add="handleAdd"
        />
      </div>
    </div>

    <!-- Cart panel -->
    <CartPanel @checkout-success="handleCheckoutSuccess" />

    <!-- Success toast -->
    <Transition name="fade">
      <div
        v-if="showSuccessToast"
        class="fixed bottom-6 right-[21rem] bg-brand-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium z-50"
      >
        ✅ Transaksi berhasil! Struk telah dicetak.
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import CartPanel from '../components/CartPanel.vue'
import { useCart } from '../composables/useCart'
import { getAllProducts } from '../db/LocalDb'

const cart = useCart()
const allProducts = ref([])
const searchQuery = ref('')
const selectedKategori = ref('Semua')
const showSuccessToast = ref(false)

const kategoriList = ['Semua', 'Daging', 'Seafood', 'Sayuran', 'Dessert', 'Minuman']

const filteredProducts = computed(() => {
  let list = allProducts.value
  if (selectedKategori.value !== 'Semua') {
    list = list.filter(p => p.kategori === selectedKategori.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p => p.nama.toLowerCase().includes(q))
  }
  return list
})

async function loadProducts() {
  allProducts.value = await getAllProducts()
}

function handleAdd(product) {
  cart.addItem(product)
}

async function handleCheckoutSuccess() {
  showSuccessToast.value = true
  await loadProducts()
  setTimeout(() => {
    showSuccessToast.value = false
  }, 2500)
}

onMounted(loadProducts)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
