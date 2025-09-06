<template>
  <div class="relative w-full">
    <input
      ref="searchInput"
      v-model="searchQuery"
      @keyup.enter="performSearch"
      @input="handleInput"
      @focus="showSuggestions = true"
      @blur="hideSuggestions"
      @keydown="handleKeydown"
      type="text"
      placeholder="Search templates..."
      class="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-0 focus:outline-none focus:border-gray-400 bg-transparent hover:border-gray-400 transition-colors duration-200 placeholder-gray-500 text-gray-900"
      :class="{ 'rounded-b-none': showSuggestions && suggestions.length > 0 }"
    >
    <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
    <button v-if="searchQuery" 
            @click="clearSearch"
            class="absolute right-4 top-3.5 w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors">
      <Icon name="heroicons:x-mark" class="w-5 h-5" />
    </button>
    
    <!-- Suggestions Dropdown -->
    <div v-if="showSuggestions && suggestions.length > 0" 
         class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-xl shadow-lg z-50 max-h-60 overflow-y-auto">
      <div 
        v-for="(suggestion, index) in suggestions" 
        :key="suggestion"
        @mousedown="selectSuggestion(suggestion)"
        class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-2 transition-colors"
        :class="{ 'bg-gray-50': selectedIndex === index }"
      >
        <Icon name="heroicons:hashtag" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-700">{{ suggestion }}</span>
      </div>
    </div>
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

// Refs
const searchInput = ref(null)
const showSuggestions = ref(false)
const suggestions = ref([])
const selectedIndex = ref(-1)
const searchTimeout = ref(null)

// Reactive search query
const searchQuery = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    showSuggestions.value = false
    navigateTo(`/templates?search=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

const handleInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value && searchQuery.value.length > 1) {
      fetchSuggestions()
    } else {
      suggestions.value = []
    }
  }, 300)
}

const fetchSuggestions = async () => {
  try {
    const { data } = await $fetch('/api/tags', {
      query: { search: searchQuery.value }
    })
    suggestions.value = data || []
  } catch (error) {
    console.error('Failed to fetch suggestions:', error)
    suggestions.value = []
  }
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  selectedIndex.value = -1
  performSearch()
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
    selectedIndex.value = -1
  }, 150)
}

const handleKeydown = (event) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        selectSuggestion(suggestions.value[selectedIndex.value])
      } else {
        performSearch()
      }
      break
    case 'Escape':
      showSuggestions.value = false
      selectedIndex.value = -1
      searchInput.value?.blur()
      break
  }
}

// Cleanup
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>