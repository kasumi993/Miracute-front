<template>
  <button
    v-if="hasFilters"
    @click="$emit('open')"
    class="lg:hidden relative p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    :class="props.hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white text-gray-600'"
  >
    <Icon name="heroicons:adjustments-horizontal" class="w-5 h-5" />
    <!-- Active filter indicator -->
    <span
      v-if="props.hasActiveFilters"
      class="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"
    ></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  hasFilters?: boolean
  hasActiveFilters?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  open: []
}>()
</script>