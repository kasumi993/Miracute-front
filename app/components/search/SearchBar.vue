<template>
  <div class="relative">
    <input
      ref="searchInput"
      v-model="localSearchQuery"
      @input="handleInput"
      @focus="showSuggestions = true"
      @keydown.enter="handleSearch"
      @keydown.escape="hideSuggestions"
      type="text"
      :placeholder="placeholder"
      :class="inputClass"
    >
    <Icon name="heroicons:magnifying-glass" :class="iconClass" />

    <div v-if="isSearching" :class="loadingClass">
      <Icon name="heroicons:arrow-path" class="w-4 h-4 text-brand-sage animate-spin" />
    </div>

    <button
      v-else-if="localSearchQuery"
      @click="clearSearch"
      :class="clearButtonClass"
    >
      <Icon name="heroicons:x-mark" class="w-4 h-4" />
    </button>

    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      :class="dropdownClass"
    >
      <div class="p-2">
        <div class="text-xs font-medium text-gray-500 mb-2">
          {{ localSearchQuery ? 'Suggestions' : 'Popular searches' }}
        </div>
        <button
          v-for="suggestion in filteredSuggestions"
          :key="suggestion"
          @click="selectSuggestion(suggestion)"
          class="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2 touch-manipulation"
        >
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span class="truncate">{{ suggestion }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Search templates, categories, software...'
  },
  suggestions: {
    type: Array,
    default: () => [
      'wedding templates',
      'business cards',
      'canva templates',
      'website templates',
      'instagram posts',
      'logo design',
      'presentation templates',
      'marketing materials',
      'social media templates',
      'brochure templates'
    ]
  },
  debounceMs: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const searchInput = ref(null)
const showSuggestions = ref(false)
const localSearchQuery = ref(props.modelValue)

const inputClass = computed(() =>
  'w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm'
)

const iconClass = computed(() =>
  'absolute left-3 top-3 w-4 h-4 text-gray-400'
)

const loadingClass = computed(() =>
  'absolute right-3 top-3'
)

const clearButtonClass = computed(() =>
  'absolute right-3 top-3 text-gray-400 hover:text-gray-600'
)

const dropdownClass = computed(() =>
  'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto'
)

const filteredSuggestions = computed(() => {
  if (!localSearchQuery.value) {
    return props.suggestions.slice(0, 8)
  }

  return props.suggestions
    .filter(suggestion =>
      suggestion.toLowerCase().includes(localSearchQuery.value.toLowerCase())
    )
    .slice(0, 6)
})

const debouncedEmit = debounce(() => {
  emit('search', localSearchQuery.value)
}, props.debounceMs)

const handleInput = () => {
  emit('update:modelValue', localSearchQuery.value)
  debouncedEmit()

  if (localSearchQuery.value.length > 0) {
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

const handleSearch = () => {
  showSuggestions.value = false
  emit('search', localSearchQuery.value)
}

const selectSuggestion = (suggestion) => {
  localSearchQuery.value = suggestion
  emit('update:modelValue', suggestion)
  showSuggestions.value = false
  emit('search', suggestion)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  emit('update:modelValue', '')
  showSuggestions.value = false
  emit('clear')
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleClickOutside = (event) => {
  if (searchInput.value && !searchInput.value.parentElement.contains(event.target)) {
    showSuggestions.value = false
  }
}

watch(() => props.modelValue, (newValue) => {
  localSearchQuery.value = newValue
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}
</script>