<template>
  <div class="relative w-full">
    <UISearchInput
      v-model="searchQuery"
      @search="handleSearch"
      @clear="clearSearch"
      placeholder="Search templates..."
      size="lg"
      class="rounded-xl focus:ring-0 focus:outline-none focus:border-gray-400 bg-transparent hover:border-gray-400"
      :debounce-ms="300"
    />

  </div>
</template>

<script setup>
// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Refs

// Reactive search query
const searchQuery = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const performSearch = async (query) => {
  const searchTerm = query || searchQuery.value
  if (searchTerm.trim()) {
    // Navigate to templates page with search query
    await navigateTo(`/templates?search=${encodeURIComponent(searchTerm.trim())}`)
  }
}


// Handle actual search execution
const handleSearch = (query) => {
  performSearch(query)
}

const clearSearch = () => {
  searchQuery.value = ''

  // If we're on templates page, clear the URL search param
  const route = useRoute()
  if (route.path === '/templates') {
    navigateTo('/templates')
  }
}


</script>