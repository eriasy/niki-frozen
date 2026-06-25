import { ref, computed } from 'vue'

const items = ref([]) // [{ id, nama, harga, qty, gambar }]
const diskonPercent = ref(0)
const PPN_RATE = 0.11

export function useCart() {
  function addItem(product) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      if (existing.qty < product.stok) existing.qty += 1
    } else {
      if (product.stok > 0) {
        items.value.push({
          id: product.id,
          nama: product.nama,
          harga: product.harga,
          qty: 1,
          gambar: product.gambar,
          stokMax: product.stok
        })
      }
    }
  }

  function incrementItem(id) {
    const item = items.value.find(i => i.id === id)
    if (item && item.qty < item.stokMax) item.qty += 1
  }

  function decrementItem(id) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    if (item.qty <= 1) {
      removeItem(id)
    } else {
      item.qty -= 1
    }
  }

  function removeItem(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clearCart() {
    items.value = []
    diskonPercent.value = 0
  }

  function setDiskon(percent) {
    const val = Number(percent)
    diskonPercent.value = isNaN(val) ? 0 : Math.min(100, Math.max(0, val))
  }

  const totalItemCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))

  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.harga * i.qty, 0))

  const diskonAmount = computed(() => Math.round(subtotal.value * (diskonPercent.value / 100)))

  const afterDiskon = computed(() => subtotal.value - diskonAmount.value)

  const ppn = computed(() => Math.round(afterDiskon.value * PPN_RATE))

  const grandTotal = computed(() => afterDiskon.value + ppn.value)

  return {
    items,
    diskonPercent,
    totalItemCount,
    subtotal,
    diskonAmount,
    ppn,
    grandTotal,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    setDiskon
  }
}
