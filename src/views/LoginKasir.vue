<template>
  <div class="min-h-screen flex">
    <!-- Left panel - branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 to-brand-600 relative overflow-hidden flex-col justify-between p-12 text-white">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5"></div>
      <div class="absolute bottom-10 -left-10 w-56 h-56 rounded-full bg-white/5"></div>

      <div class="flex items-center gap-3 z-10">
        <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">❄</div>
        <div>
          <p class="font-bold leading-tight">NIKI Frozen</p>
          <p class="text-xs text-white/70 leading-tight">Point of Sale</p>
        </div>
      </div>

      <div class="z-10">
        <h1 class="text-3xl font-bold leading-tight mb-3">Kelola bisnis<br />frozen food<br />dengan mudah.</h1>
        <p class="text-sm text-white/80 mb-5">Sistem kasir modern yang cepat, akurat, dan bekerja bahkan saat offline.</p>
        
        <div class="flex gap-3">
          <div
            v-for="p in previewProducts"
            :key="p.nama"
            class="bg-white/10 rounded-xl p-2 w-28"
          >
            <img :src="p.gambar" class="w-full h-16 object-cover rounded-lg mb-1.5" :alt="p.nama"  @error="handleImgError" />
            <p class="text-xs font-medium truncate">{{ p.nama }}</p>
            <p class="text-xs text-white/70">{{ formatRupiahShort(p.harga) }}</p>
          </div>
        </div>
      </div>

      <div class="z-10"></div>
    </div>

    <!-- Right panel - form -->
    <div class="flex-1 flex items-center justify-center bg-cream-50 px-6 py-12">
      <div class="w-full max-w-sm">
        <h2 class="text-2xl font-bold text-gray-800 mb-1">Selamat datang!</h2>
        <p class="text-sm text-gray-400 mb-2">Masuk ke akun kasir Anda untuk melanjutkan.</p>

        <div class="flex items-center gap-1.5 text-xs text-brand-600 font-medium mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
          Online — Tersinkronisasi
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1.5">Username</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
              <input
                v-model="username"
                type="text"
                placeholder="Masukkan username"
                class="input-field pl-10"
                autocomplete="username"
              />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="input-field pl-10 pr-10"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
              >
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-gray-500">
              <input v-model="ingatSaya" type="checkbox" class="rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
              Ingat saya
            </label>
            <a href="#" class="text-orange-500 font-medium hover:underline">Lupa password?</a>
          </div>

          <p v-if="errorMsg" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ errorMsg }}</p>

          <button type="submit" :disabled="isLoading" class="btn-primary w-full flex items-center justify-center gap-2">
            → {{ isLoading ? 'Memproses...' : 'Masuk ke Kasir' }}
          </button>
        </form>

        <p class="text-center text-xs text-gray-400 mt-6">NIKI Frozen POS v2.4 · Offline Mode Ready</p>

        <div class="mt-4 bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-400">
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { formatRupiahShort } from '../composables/useFormat'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const ingatSaya = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

const previewProducts = [
  { nama: 'Bakso Sapi Premium', harga: 35000, gambar: '/images/bakso-sapi-premium.jpg' },
  { nama: 'Udang Kupas Beku', harga: 52000, gambar: '/images/udang-kupas-beku.jpg' },
  { nama: 'Nugget Ayam Crispy', harga: 28000, gambar: '/images/nugget-ayam-crispy.jpg' }
]

async function handleLogin() {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = 'Username dan password wajib diisi.'
    return
  }
  isLoading.value = true
  try {
    const result = await login(username.value.trim().toLowerCase(), password.value)
    if (result.success) {
      router.push('/')
    } else {
      errorMsg.value = result.message
    }
  } finally {
    isLoading.value = false
  }
}

function handleImgError(event) {
  event.target.src = '/images/placeholder.jpg'
}
</script>