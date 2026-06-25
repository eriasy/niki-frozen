<template>
  <div class="card flex items-start justify-between">
    <div>
      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">{{ label }}</p>
      <p class="text-2xl font-bold text-gray-800 mt-2">{{ value }}</p>
      <p v-if="trend" class="text-xs mt-1.5 flex items-center gap-1" :class="trendUp ? 'text-brand-600' : 'text-red-500'">
        <span>{{ trendUp ? '↗' : '↘' }}</span>
        <span>{{ trend }}</span>
      </p>
      <p v-else-if="subtext" class="text-xs mt-1.5" :class="subtextColor">{{ subtext }}</p>
    </div>
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
      :class="iconBg"
    >
      {{ icon }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
  icon: { type: String, default: '📊' },
  trend: String,
  trendUp: { type: Boolean, default: true },
  subtext: String,
  subtextColor: { type: String, default: 'text-gray-400' },
  iconBg: { type: String, default: 'bg-brand-50' }
})
</script>
