<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 no-print-backdrop">
    <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
      <!-- Header modal (gak ikut ke-print) -->
      <div class="no-print flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Struk Transaksi</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>

      <!-- Area yang beneran di-print -->
      <div class="struk-print-area px-6 py-5 font-mono text-[13px] text-gray-800 leading-relaxed">
        <div class="text-center mb-3">
          <p class="font-bold text-base">NIKI Frozen</p>
          <p class="text-xs text-gray-500">Point of Sale - Frozen Food</p>
        </div>

        <div class="border-t border-dashed border-gray-400 my-2"></div>

        <div class="text-xs space-y-0.5">
          <div class="flex justify-between"><span>No</span><span>{{ transaksi.kode }}</span></div>
          <div class="flex justify-between"><span>Tanggal</span><span>{{ formattedTanggal }}</span></div>
          <div class="flex justify-between"><span>Waktu</span><span>{{ transaksi.waktu }}</span></div>
          <div class="flex justify-between"><span>Kasir</span><span>{{ transaksi.kasir }}</span></div>
        </div>

        <div class="border-t border-dashed border-gray-400 my-2"></div>

        <div class="space-y-1.5">
          <div v-for="(item, idx) in transaksi.items" :key="idx">
            <p>{{ item.nama }}</p>
            <div class="flex justify-between text-gray-600">
              <span>{{ item.qty }} x {{ formatRupiah(item.harga) }}</span>
              <span>{{ formatRupiah(item.qty * item.harga) }}</span>
            </div>
          </div>
        </div>

        <div class="border-t border-dashed border-gray-400 my-2"></div>

        <div class="text-xs space-y-0.5">
          <div class="flex justify-between"><span>Subtotal</span><span>{{ formatRupiah(transaksi.subtotal) }}</span></div>
          <div v-if="transaksi.diskonAmount > 0" class="flex justify-between">
            <span>Diskon ({{ transaksi.diskonPercent }}%)</span><span>− {{ formatRupiah(transaksi.diskonAmount) }}</span>
          </div>
          <div class="flex justify-between"><span>PPN 11%</span><span>{{ formatRupiah(transaksi.ppn) }}</span></div>
        </div>

        <div class="border-t border-dashed border-gray-400 my-2"></div>

        <div class="flex justify-between font-bold text-sm">
          <span>TOTAL</span><span>{{ formatRupiah(transaksi.total) }}</span>
        </div>

        <div class="text-xs space-y-0.5 mt-2">
          <div class="flex justify-between"><span>Metode</span><span>{{ transaksi.metode }}</span></div>
          <template v-if="transaksi.metode === 'Cash'">
            <div class="flex justify-between"><span>Tunai</span><span>{{ formatRupiah(transaksi.nominalBayar) }}</span></div>
            <div class="flex justify-between"><span>Kembalian</span><span>{{ formatRupiah(transaksi.kembalian) }}</span></div>
          </template>
        </div>

        <div class="border-t border-dashed border-gray-400 my-3"></div>

        <div class="text-center text-xs text-gray-500 space-y-0.5">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
        </div>
      </div>

      <!-- Tombol aksi (gak ikut ke-print) -->
      <div class="no-print flex gap-3 px-5 py-4 border-t border-gray-100">
        <button @click="$emit('close')" class="btn-outline flex-1">Tutup</button>
        <button @click="handlePrint" class="btn-primary flex-1 flex items-center justify-center gap-2">
          🖨️ Print
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatRupiah } from '../composables/useFormat'

const props = defineProps({
  transaksi: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const formattedTanggal = computed(() => {
  const d = new Date(props.transaksi.tanggal)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

function handlePrint() {
  window.print()
}
</script>

<style>
/* Non-scoped biar rule "body *" di bawah beneran ke-apply pas print */
@media print {
  body * {
    visibility: hidden;
  }
  .struk-print-area,
  .struk-print-area * {
    visibility: visible;
  }
  .struk-print-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  .no-print,
  .no-print-backdrop {
    background: none !important;
  }
}
</style>