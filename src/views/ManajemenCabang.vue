<template>
  <div class="max-w-5xl space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-gray-800">Manajemen Cabang</h2>
        <p class="text-sm text-gray-400">Kelola daftar cabang & pantau riwayat transfer stok</p>
      </div>
      <button @click="openAddModal" class="btn-primary whitespace-nowrap">+ Tambah Cabang</button>
    </div>

    <!-- Daftar Cabang -->
    <div class="card !p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Daftar Cabang</h3>
      </div>
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">Nama Cabang</th>
              <th class="px-5 py-3 font-medium">Kode</th>
              <th class="px-5 py-3 font-medium">Jumlah Staf</th>
              <th class="px-5 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in branches" :key="b.id" class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-5 py-3 font-medium text-gray-800">{{ b.nama }}</td>
              <td class="px-5 py-3"><span class="badge bg-gray-100 text-gray-500">{{ b.kode }}</span></td>
              <td class="px-5 py-3 text-gray-500">{{ staffCountByBranch(b.nama) }} orang</td>
              <td class="px-5 py-3 text-right">
                <button @click="openEditModal(b)" class="text-gray-400 hover:text-brand-600 px-1.5">✏️</button>
                <button @click="confirmDelete(b)" class="text-gray-400 hover:text-red-500 px-1.5">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="branches.length === 0" class="text-center text-gray-400 py-10 text-sm">Belum ada cabang.</p>
      </div>
    </div>

    <!-- Riwayat Transfer Stok -->
    <div class="card !p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Riwayat Transfer Stok</h3>
        <p class="text-xs text-gray-400 mt-0.5">Transfer stok dibuat dari halaman Produk</p>
      </div>
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">Produk</th>
              <th class="px-5 py-3 font-medium">Dari</th>
              <th class="px-5 py-3 font-medium">Ke</th>
              <th class="px-5 py-3 font-medium">Jumlah</th>
              <th class="px-5 py-3 font-medium">Tanggal</th>
              <th class="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in transfers" :key="t.id" class="border-t border-gray-50">
              <td class="px-5 py-3 font-medium text-gray-800">{{ t.productName }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.fromBranch }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.toBranch }}</td>
              <td class="px-5 py-3 text-gray-700">{{ t.qty }}</td>
              <td class="px-5 py-3 text-gray-500">{{ t.tanggal }}</td>
              <td class="px-5 py-3">
                <span class="badge" :class="t.status === 'Sent' ? 'badge-green' : 'badge-orange'">
                  {{ t.status === 'Sent' ? 'Terkirim' : 'Sebagian' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="transfers.length === 0" class="text-center text-gray-400 py-10 text-sm">
          Belum ada transfer stok. Buat transfer dari halaman Produk.
        </p>
      </div>
    </div>

    <!-- Modal Tambah/Edit Cabang -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="closeModal">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6">
          <h3 class="font-bold text-gray-800 text-lg mb-4">{{ editingBranch ? 'Edit Cabang' : 'Tambah Cabang' }}</h3>
          <form @submit.prevent="saveBranch" class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Cabang</label>
              <input v-model="form.nama" type="text" required class="input-field" placeholder="Contoh: Cabang Solo" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Kode Cabang</label>
              <input v-model="form.kode" type="text" required class="input-field" placeholder="Contoh: CAB-2" />
            </div>
            <p v-if="errorMsg" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ errorMsg }}</p>
            <div class="flex gap-3 pt-3">
              <button type="button" @click="closeModal" class="btn-outline flex-1">Batal</button>
              <button type="submit" class="btn-primary flex-1">{{ editingBranch ? 'Simpan' : 'Tambah' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Konfirmasi hapus -->
    <Transition name="modal">
      <div v-if="deletingBranch" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="deletingBranch = null">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
          <p class="text-3xl mb-2">🗑️</p>
          <h3 class="font-bold text-gray-800 mb-1">Hapus Cabang?</h3>
          <p class="text-sm text-gray-400 mb-5">Cabang "{{ deletingBranch.nama }}" akan dihapus permanen.</p>
          <p v-if="deleteErrorMsg" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">{{ deleteErrorMsg }}</p>
          <div class="flex gap-3">
            <button @click="deletingBranch = null" class="btn-outline flex-1">Batal</button>
            <button @click="executeDelete" class="bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-4 py-2.5 flex-1">Hapus</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBranches, addBranch, updateBranch, deleteBranch, getAllTransfers, getAllUsers } from '../db/LocalDb'

const branches = ref([])
const transfers = ref([])
const allUsers = ref([])

const showModal = ref(false)
const editingBranch = ref(null)
const deletingBranch = ref(null)
const errorMsg = ref('')
const deleteErrorMsg = ref('')

const form = ref({ nama: '', kode: '' })

async function loadAll() {
  branches.value = await getBranches()
  transfers.value = await getAllTransfers()
  allUsers.value = await getAllUsers()
}

function staffCountByBranch(namaCabang) {
  return allUsers.value.filter(u => (u.cabang || 'Cabang Utama') === namaCabang).length
}

function openAddModal() {
  editingBranch.value = null
  errorMsg.value = ''
  form.value = { nama: '', kode: '' }
  showModal.value = true
}

function openEditModal(branch) {
  editingBranch.value = branch
  errorMsg.value = ''
  form.value = { nama: branch.nama, kode: branch.kode }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingBranch.value = null
}

async function saveBranch() {
  errorMsg.value = ''
  try {
    if (editingBranch.value) {
      await updateBranch(editingBranch.value.id, { nama: form.value.nama, kode: form.value.kode })
    } else {
      await addBranch({ nama: form.value.nama, kode: form.value.kode })
    }
    await loadAll()
    closeModal()
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan cabang.'
  }
}

function confirmDelete(branch) {
  deleteErrorMsg.value = ''
  deletingBranch.value = branch
}

async function executeDelete() {
  if (!deletingBranch.value) return
  try {
    await deleteBranch(deletingBranch.value.id)
    await loadAll()
    deletingBranch.value = null
  } catch (err) {
    deleteErrorMsg.value = err.message || 'Gagal menghapus cabang.'
  }
}

onMounted(loadAll)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>