<template>
  <NuxtLink
    :to="to"
    @click="$emit('click')"
    class="flex items-center space-x-3 px-3 py-2.5 sm:py-2 rounded-lg transition-colors min-h-[44px] sm:min-h-0"
    :class="active 
      ? 'text-gray-900 bg-gray-100 font-medium' 
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'"
  >
    <Icon :name="icon" class="w-5 h-5 flex-shrink-0" />
    <span class="text-sm sm:text-base"><slot /></span>
  </NuxtLink>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    required: true
  }
})

defineEmits(['click'])
</script>