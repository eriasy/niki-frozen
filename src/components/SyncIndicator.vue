<template>
  <div
    class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full"
    :class="isOnline ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'"
  >
    <span
      class="w-1.5 h-1.5 rounded-full"
      :class="isOnline ? 'bg-brand-500' : 'bg-gray-400'"
    ></span>
    <span class="hidden sm:inline">{{ isOnline ? 'Online' : 'Offline' }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

function updateStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>
