<template>
  <aside class="w-80 bg-white border-l border-gray-100 flex flex-col shrink-0 h-full">
    <div class="px-5 py-4 border-b border-gray-100">
      <h2 class="font-bold text-gray-800 text-base">Keranjang</h2>
      <p class="text-xs text-gray-400 mt-0.5">{{ cart.totalItemCount.value }} produk · {{ cart.items.value.length }} item</p>
    </div>

    <!-- Empty state -->
    <div v-if="cart.items.value.length === 0" class="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div class="text-4xl mb-2">🛒</div>
      <p class="text-sm font-medium text-gray-500">Keranjang kosong</p>
      <p class="text-xs text-gray-400 mt-1">Pilih produk dari katalog</p>
    </div>

    <!-- Cart items -->
    <div v-else class="flex-1 overflow-y-auto thin-scroll px-4 py-3 space-y-3">
      <div
        v-for="item in cart.items.value"
        :key="item.id"
        class="flex items-center gap-3"
      >
        <img :src="item.gambar" class="w-12 h-12 rounded-lg object-cover shrink-0" :alt="item.nama" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">{{ item.nama }}</p>
          <p class="text-xs text-gray-400">{{ formatRupiah(item.harga) }}</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button @click="cart.decrementItem(item.id)" class="w-6 h-6 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-xs">−</button>
          <span class="text-sm font-semibold w-5 text-center">{{ item.qty }}</span>
          <button @click="cart.incrementItem(item.id)" class="w-6 h-6 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-xs">+</button>
        </div>
      </div>
    </div>

    <!-- Summary & payment -->
    <div class="border-t border-gray-100 px-5 py-4 space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-xs text-gray-500">Diskon (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          :value="cart.diskonPercent.value"
          @input="cart.setDiskon($event.target.value)"
          class="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div class="space-y-1.5 text-sm">
        <div class="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{{ formatRupiah(cart.subtotal.value) }}</span>
        </div>
        <div v-if="cart.diskonAmount.value > 0" class="flex justify-between text-gray-500">
          <span>Diskon</span>
          <span>− {{ formatRupiah(cart.diskonAmount.value) }}</span>
        </div>
        <div class="flex justify-between text-gray-500">
          <span>PPN 11%</span>
          <span>{{ formatRupiah(cart.ppn.value) }}</span>
        </div>
        <div class="flex justify-between font-bold text-gray-800 text-base pt-1.5 border-t border-gray-100">
          <span>Grand Total</span>
          <span class="text-brand-600">{{ formatRupiah(cart.grandTotal.value) }}</span>
        </div>
      </div>

      <!-- Payment method -->
      <div class="grid grid-cols-3 gap-2 pt-1">
        <button
          v-for="m in metodeOptions"
          :key="m.value"
          @click="metode = m.value"
          class="border rounded-xl py-2 text-xs font-medium flex flex-col items-center gap-1 transition-colors"
          :class="metode === m.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
        >
          <span class="text-base">{{ m.icon }}</span>
          {{ m.label }}
        </button>
      </div>

      <input
        v-if="metode === 'Cash'"
        v-model.number="nominalBayar"
        type="number"
        placeholder="Nominal bayar"
        class="input-field text-sm"
      />

      <div v-if="metode === 'Cash' && nominalBayar > 0" class="flex justify-between text-xs text-gray-500 px-1">
        <span>Kembalian</span>
        <span class="font-semibold" :class="kembalian < 0 ? 'text-red-500' : 'text-gray-700'">
          {{ formatRupiah(Math.max(0, kembalian)) }}
        </span>
      </div>

      <div v-if="metode === 'Cash'" class="grid grid-cols-4 gap-1.5">
        <button
          v-for="quick in [50000, 100000, 150000, 200000]"
          :key="quick"
          @click="nominalBayar = quick"
          class="text-xs border border-gray-200 rounded-lg py-1.5 text-gray-600 hover:bg-gray-50"
        >
          {{ quick / 1000 }}rb
        </button>
      </div>

      <button
        @click="handleCheckout"
        :disabled="cart.items.value.length === 0 || isProcessing"
        class="btn-primary w-full flex items-center justify-center gap-2"
      >
        🖨️ {{ isProcessing ? 'Memproses...' : 'Cetak Struk' }}
      </button>

      <p v-if="errorMsg" class="text-xs text-red-500 text-center">{{ errorMsg }}</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCart } from '../composables/useCart'
import { formatRupiah } from '../composables/useFormat'
import { createTransaction, decrementStock } from '../db/LocalDb'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['checkout-success'])

const cart = useCart()
const { currentUser } = useAuth()

const metode = ref('Tunai')
const nominalBayar = ref(null)
const isProcessing = ref(false)
const errorMsg = ref('')

const metodeOptions = [
  { value: 'Tunai', label: 'Tunai', icon: '💵' },
  { value: 'QRIS', label: 'QRIS', icon: '📱' },
  { value: 'Transfer', label: 'Transfer', icon: '🔁' }
]

const kembalian = computed(() => (nominalBayar.value || 0) - cart.grandTotal.value)

async function handleCheckout() {
  errorMsg.value = ''
  if (cart.items.value.length === 0) return

  if (metode.value === 'Tunai' && (!nominalBayar.value || nominalBayar.value < cart.grandTotal.value)) {
    errorMsg.value = 'Nominal bayar belum cukup.'
    return
  }

  isProcessing.value = true
  try {
    const now = new Date()
    await createTransaction({
      tanggal: now.toISOString().slice(0, 10),
      waktu: now.toTimeString().slice(0, 5),
      items: cart.totalItemCount.value,
      subtotal: cart.subtotal.value,
      ppn: cart.ppn.value,
      diskon: cart.diskonAmount.value,
      total: cart.grandTotal.value,
      metode: metode.value === 'Tunai' ? 'Cash' : metode.value,
      kasir: currentUser.value?.nama || 'Kasir'
    })

    for (const item of cart.items.value) {
      await decrementStock(item.id, item.qty)
    }

    cart.clearCart()
    nominalBayar.value = null
    metode.value = 'Tunai'
    emit('checkout-success')
  } catch (e) {
    errorMsg.value = 'Gagal memproses transaksi. Coba lagi.'
  } finally {
    isProcessing.value = false
  }
}
</script>
