<template>
  <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card transition-shadow group">
    <div class="relative h-28 bg-gray-100 overflow-hidden">
      <img
        :src="product.gambar"
        :alt="product.nama"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <span
        v-if="product.status === 'Kritis'"
        class="absolute top-2 left-2 badge bg-orange-500 text-white"
      >
        Hampir habis
      </span>
      <span
        v-else-if="product.status === 'Habis'"
        class="absolute top-2 left-2 badge bg-red-500 text-white"
      >
        Stok habis
      </span>
    </div>
    <div class="p-3">
      <p class="text-sm font-semibold text-gray-800 truncate">{{ product.nama }}</p>
      <p class="text-xs text-gray-400 mt-0.5">Stok: {{ product.stok }} pak</p>
      <div class="flex items-center justify-between mt-2">
        <span class="text-sm font-bold text-brand-600">{{ formatRupiahShort(product.harga) }}</span>
        <button
          @click="$emit('add', product)"
          :disabled="product.stok === 0"
          class="w-7 h-7 rounded-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center text-base font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRupiahShort } from '../composables/useFormat'

defineProps({
  product: { type: Object, required: true }
})

defineEmits(['add'])
</script>
