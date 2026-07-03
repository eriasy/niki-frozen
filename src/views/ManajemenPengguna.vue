<template>
  <div class="max-w-5xl">
    <div class="flex items-center justify-between mb-5 gap-4">
      <div>
        <h2 class="text-lg font-bold text-gray-800">Manajemen Pengguna</h2>
        <p class="text-sm text-gray-400">Kelola akun staf & hak akses mereka</p>
      </div>
      <button @click="openAddModal" class="btn-primary whitespace-nowrap flex items-center gap-2">
        + Tambah Akun
      </button>
    </div>

    <div class="card !p-0 overflow-hidden">
      <div class="overflow-x-auto thin-scroll">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs text-gray-400 uppercase">
              <th class="px-5 py-3 font-medium">Nama</th>
              <th class="px-5 py-3 font-medium">Username</th>
              <th class="px-5 py-3 font-medium">Role</th>
              <th class="px-5 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in allUsers" :key="u.id" class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {{ u.nama.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-gray-800">{{ u.nama }}</span>
                  <span v-if="u.username === currentUser?.username" class="text-xs text-gray-400">(kamu)</span>
                </div>
              </td>
              <td class="px-5 py-3 text-gray-500">{{ u.username }}</td>
              <td class="px-5 py-3">
                <span class="badge" :class="roleBadgeClass(u.role)">{{ u.role }}</span>
              </td>
              <td class="px-5 py-3 text-right">
                <button @click="openEditModal(u)" class="text-gray-400 hover:text-brand-600 px-1.5">✏️</button>
                <button
                  v-if="u.username !== currentUser?.username"
                  @click="confirmDelete(u)"
                  class="text-gray-400 hover:text-red-500 px-1.5"
                >🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="allUsers.length === 0" class="text-center text-gray-400 py-10 text-sm">
          Belum ada akun staf.
        </p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="closeModal">
        <div class="bg-white rounded-2xl w-full max-w-md p-6">
          <h3 class="font-bold text-gray-800 text-lg mb-4">{{ editingUser ? 'Edit Akun' : 'Tambah Akun Staf' }}</h3>
          <form @submit.prevent="saveUser" class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
              <input v-model="form.nama" type="text" required class="input-field" placeholder="Contoh: Dewi" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Username</label>
              <input v-model="form.username" type="text" required class="input-field" placeholder="contoh: dewi" :disabled="!!editingUser" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">{{ editingUser ? 'Reset Password (opsional)' : 'Password' }}</label>
              <input v-model="form.password" type="text" :required="!editingUser" class="input-field" :placeholder="editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Role</label>
              <select v-model="form.role" required class="input-field">
                <option v-for="r in assignableRoles" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>

            <p v-if="errorMsg" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ errorMsg }}</p>

            <div class="flex gap-3 pt-3">
              <button type="button" @click="closeModal" class="btn-outline flex-1">Batal</button>
              <button type="submit" class="btn-primary flex-1">{{ editingUser ? 'Simpan' : 'Tambah' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete confirm -->
    <Transition name="modal">
      <div v-if="deletingUser" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="deletingUser = null">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
          <p class="text-3xl mb-2">🗑️</p>
          <h3 class="font-bold text-gray-800 mb-1">Hapus Akun?</h3>
          <p class="text-sm text-gray-400 mb-5">Akun "{{ deletingUser.nama }}" akan dihapus permanen.</p>
          <div class="flex gap-3">
            <button @click="deletingUser = null" class="btn-outline flex-1">Batal</button>
            <button @click="executeDelete" class="bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-4 py-2.5 flex-1">Hapus</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getAllUsers, addUser, updateUser, deleteUser } from '../db/LocalDb'

const { currentUser } = useAuth()

const allUsers = ref([])
const showModal = ref(false)
const editingUser = ref(null)
const deletingUser = ref(null)
const errorMsg = ref('')

const assignableRoles = ['Kasir', 'Kasir Utama', 'Admin', 'Pemilik Toko']

const form = ref({
  nama: '',
  username: '',
  password: '',
  role: 'Kasir'
})

async function loadUsers() {
  allUsers.value = await getAllUsers()
}

function roleBadgeClass(role) {
  if (role === 'Pemilik Toko') return 'bg-purple-50 text-purple-600'
  if (role === 'Admin') return 'bg-blue-50 text-blue-600'
  if (role === 'Kasir Utama') return 'badge-orange'
  return 'badge-green'
}

function openAddModal() {
  editingUser.value = null
  errorMsg.value = ''
  form.value = { nama: '', username: '', password: '', role: 'Kasir' }
  showModal.value = true
}

function openEditModal(user) {
  editingUser.value = user
  errorMsg.value = ''
  form.value = { nama: user.nama, username: user.username, password: '', role: user.role }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
  errorMsg.value = ''
}

async function saveUser() {
  errorMsg.value = ''
  try {
    if (editingUser.value) {
      const changes = { nama: form.value.nama, role: form.value.role }
      if (form.value.password) changes.password = form.value.password
      await updateUser(editingUser.value.id, changes)
    } else {
      if (form.value.password.length < 6) {
        errorMsg.value = 'Password minimal 6 karakter.'
        return
      }
      await addUser({
        username: form.value.username,
        password: form.value.password,
        nama: form.value.nama,
        role: form.value.role
      })
    }
    await loadUsers()
    closeModal()
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan akun.'
  }
}

function confirmDelete(user) {
  deletingUser.value = user
}

async function executeDelete() {
  if (!deletingUser.value) return
  await deleteUser(deletingUser.value.id)
  await loadUsers()
  deletingUser.value = null
}

onMounted(loadUsers)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>