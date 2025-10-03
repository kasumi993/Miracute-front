<template>
  <div v-if="searchQuery && totalResults > 0" class="mb-6 p-4 bg-brand-sage/5 rounded-xl border border-brand-sage/20">
    <div class="flex items-center space-x-3">
      <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-brand-sage" />
      <div>
        <p class="text-sm font-medium text-gray-900">
          Showing {{ displayedResults }} of {{ totalResults }} result{{ totalResults !== 1 ? 's' : '' }} for "{{ searchQuery }}"
        </p>
        <p class="text-xs text-gray-600 mt-1">
          {{ searchDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  searchQuery: {
    type: String,
    required: true
  },
  totalResults: {
    type: Number,
    required: true
  },
  displayedResults: {
    type: Number,
    required: true
  },
  searchDescription: {
    type: String,
    default: 'Search completed in templates, descriptions, and categories'
  }
})
</script>