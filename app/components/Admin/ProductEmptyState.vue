<template>
  <div class="p-8 text-center text-gray-500">
    <!-- No Products State -->
    <div v-if="type === 'empty'">
      <Icon name="heroicons:squares-2x2" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-medium mb-2">No products found</p>
      <div class="space-y-3">
        <NuxtLink to="/dashboard/products/create" class="block text-brand-brown hover:text-brand-brown/80 font-medium">
          Create your first template →
        </NuxtLink>
        <button
          @click="$emit('createSamples')"
          class="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Create sample products for testing
        </button>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else-if="type === 'no-results'">
      <Icon name="heroicons:magnifying-glass-minus" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-medium mb-2">No templates found</p>
      <p class="mb-4">Try adjusting your search or filters</p>
      <button
        @click="$emit('clearAll')"
        class="btn-outline"
      >
        Clear all filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'empty' | 'no-results'
}

interface Emits {
  (e: 'createSamples'): void
  (e: 'clearAll'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>