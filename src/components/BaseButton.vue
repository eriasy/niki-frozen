<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[variantClass, sizeClass]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | outline | ghost | danger
  size: { type: String, default: 'md' }, // sm | md | lg
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])

const variantClass = computed(() => {
  const map = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    outline: 'border border-gray-200 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-50 text-gray-600',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600'
  }
  return map[props.variant] || map.primary
})

const sizeClass = computed(() => {
  const map = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  }
  return map[props.size] || map.md
})
</script>
