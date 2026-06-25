<template>
  <div class="relative" ref="wrapperRef">
    <button
      @click="toggleOpen"
      class="relative text-gray-400 hover:text-gray-600 text-lg"
      title="Notifikasi"
    >
      🔔
      <span
        v-if="criticalProducts.length > 0"
        class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"
      ></span>
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-800 text-sm">Notifikasi Stok</h3>
          <span v-if="criticalProducts.length > 0" class="badge badge-red">{{ criticalProducts.length }} baru</span>
        </div>

        <div class="max-h-80 overflow-y-auto thin-scroll">
          <div v-if="criticalProducts.length === 0" class="px-4 py-8 text-center">
            <p class="text-2xl mb-1.5">🎉</p>
            <p class="text-sm text-gray-400">Semua stok aman.</p>
          </div>

          <div
            v-for="p in criticalProducts"
            :key="p.id"
            class="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center gap-3 hover:bg-gray-50/60 cursor-pointer"
            @click="goToStok"
          >
            <img :src="p.gambar" class="w-10 h-10 rounded-lg object-cover shrink-0" :alt="p.nama" @error="handleImgError" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ p.nama }}</p>
              <p class="text-xs" :class="p.status === 'Habis' ? 'text-red-500' : 'text-orange-500'">
                {{ p.status === 'Habis' ? 'Stok habis' : `Sisa ${p.stok} pak — segera restock` }}
              </p>
            </div>
            <span class="text-gray-300 shrink-0">›</span>
          </div>
        </div>

        <div v-if="criticalProducts.length > 0" class="px-4 py-3 border-t border-gray-100">
          <button @click="goToStok" class="text-xs font-medium text-brand-600 hover:underline w-full text-center">
            Lihat semua di Stok Barang →
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllProducts } from '../db/LocalDb'

const router = useRouter()
const isOpen = ref(false)
const wrapperRef = ref(null)
const allProducts = ref([])

const criticalProducts = computed(() =>
  allProducts.value.filter(p => p.status === 'Kritis' || p.status === 'Habis')
)

async function loadProducts() {
  allProducts.value = await getAllProducts()
}

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) loadProducts()
}

function goToStok() {
  isOpen.value = false
  router.push('/stok')
}

function handleImgError(event) {
  event.target.src = '/images/placeholder.jpg'
}

function handleClickOutside(event) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  loadProducts()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>