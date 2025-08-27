<template>
  <div class="relative w-full">
    <input
      v-model="searchQuery"
      @keyup.enter="performSearch"
      type="text"
      placeholder="Search templates..."
      class="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-0 focus:outline-none focus:border-gray-400 bg-transparent hover:border-gray-400 transition-colors duration-200 placeholder-gray-500 text-gray-900"
    >
    <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
    <button v-if="searchQuery" 
            @click="clearSearch"
            class="absolute right-4 top-3.5 w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors">
      <Icon name="heroicons:x-mark" class="w-5 h-5" />
    </button>
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
const emit = defineEmits(['update:modelValue', 'search'])

// Reactive search query
const searchQuery = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>