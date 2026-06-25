<template>
  <div id="app-root">
    <!-- Halaman login: fullscreen tanpa sidebar -->
    <router-view v-if="route.meta.public" />

    <!-- Halaman privat: sidebar + header + content -->
    <div v-else class="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarMenu />
      <div class="flex-1 flex flex-col overflow-hidden">
        <HeaderBar />
        <main class="flex-1 overflow-y-auto thin-scroll px-6 py-5">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import SidebarMenu from './components/SidebarMenu.vue'
import HeaderBar from './components/HeaderBar.vue'

const route = useRoute()
</script>
