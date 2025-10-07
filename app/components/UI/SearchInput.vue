<template>
  <div class="relative" :class="wrapperClass">
    <input
      ref="searchInput"
      v-model="localValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="handleSearch"
      @keydown.escape="handleEscape"
      @keydown.arrow-down="handleArrowDown"
      @keydown.arrow-up="handleArrowUp"
      type="text"
      :placeholder="placeholder"
      :class="inputClass"
      :disabled="disabled"
    >

    <!-- Search Icon -->
    <Icon name="heroicons:magnifying-glass" :class="iconClass" />

    <!-- Loading State -->
    <div v-if="isLoading" :class="rightSlotClass">
      <Icon name="heroicons:arrow-path" class="w-4 h-4 text-brand-sage animate-spin" />
    </div>

    <!-- Clear Button -->
    <button
      v-else-if="localValue && showClear"
      @click="clearSearch"
      :class="clearButtonClass"
      type="button"
    >
      <Icon name="heroicons:x-mark" class="w-4 h-4" />
    </button>

    <!-- Suggestions/Results Dropdown -->
    <div
      v-if="showDropdown && (filteredSuggestions.length > 0 || $slots.dropdown)"
      :class="dropdownClass"
    >
      <!-- Custom dropdown content -->
      <slot name="dropdown" :suggestions="filteredSuggestions" :select="selectSuggestion" />

      <!-- Default suggestions -->
      <div v-if="!$slots.dropdown && filteredSuggestions.length > 0" class="p-2">
        <div v-if="showSuggestionLabel" class="text-xs font-medium text-gray-500 mb-2">
          {{ localValue ? 'Suggestions' : 'Popular searches' }}
        </div>
        <button
          v-for="(suggestion, index) in filteredSuggestions"
          :key="typeof suggestion === 'string' ? suggestion : suggestion.value || suggestion.id"
          @click="selectSuggestion(suggestion)"
          :class="[
            'w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2 touch-manipulation',
            { 'bg-gray-100': selectedIndex === index }
          ]"
        >
          <Icon :name="suggestionIcon" class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span class="truncate">{{ formatSuggestion(suggestion) }}</span>
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
  placeholder: {
    type: String,
    default: 'Search...'
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  debounceMs: {
    type: Number,
    default: 300
  },
  showClear: {
    type: Boolean,
    default: true
  },
  showSuggestionLabel: {
    type: Boolean,
    default: true
  },
  suggestionIcon: {
    type: String,
    default: 'heroicons:magnifying-glass'
  },
  // Styling props
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default', // default, rounded, minimal
    validator: (value) => ['default', 'rounded', 'minimal'].includes(value)
  },
  // Advanced props
  maxSuggestions: {
    type: Number,
    default: 8
  },
  minCharsForSuggestions: {
    type: Number,
    default: 0
  },
  autoComplete: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:modelValue',
  'search',
  'clear',
  'focus',
  'blur',
  'input'
])

const searchInput = ref(null)
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const localValue = ref(props.modelValue)

// Computed classes for different variants and sizes
const wrapperClass = computed(() => 'w-full')

const inputClass = computed(() => {
  const baseClasses = 'w-full border border-gray-300 focus:ring-2 focus:ring-brand-sage focus:border-transparent text-gray-900 placeholder-gray-500'

  const sizeClasses = {
    sm: 'pl-8 pr-10 py-1.5 text-sm',
    md: 'pl-10 pr-12 py-2.5 text-sm',
    lg: 'pl-12 pr-14 py-3 text-base'
  }

  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-xl',
    minimal: 'rounded-md border-gray-200 bg-gray-50 focus:bg-white'
  }

  const dropdownClasses = showDropdown.value && filteredSuggestions.value.length > 0 ? 'rounded-b-none' : ''

  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${dropdownClasses}`
})

const iconClass = computed(() => {
  const sizeClasses = {
    sm: 'absolute left-2 top-2 w-4 h-4 text-gray-400',
    md: 'absolute left-3 top-3 w-4 h-4 text-gray-400',
    lg: 'absolute left-4 top-3.5 w-5 h-5 text-gray-400'
  }
  return sizeClasses[props.size]
})

const rightSlotClass = computed(() => {
  const sizeClasses = {
    sm: 'absolute right-2 top-2',
    md: 'absolute right-3 top-3',
    lg: 'absolute right-4 top-3.5'
  }
  return sizeClasses[props.size]
})

const clearButtonClass = computed(() => {
  const sizeClasses = {
    sm: 'absolute right-2 top-2 text-gray-400 hover:text-gray-600',
    md: 'absolute right-3 top-3 text-gray-400 hover:text-gray-600',
    lg: 'absolute right-4 top-3.5 text-gray-400 hover:text-gray-600'
  }
  return sizeClasses[props.size]
})

const dropdownClass = computed(() => {
  const variantClasses = {
    default: 'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto',
    rounded: 'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto',
    minimal: 'absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-64 overflow-y-auto'
  }
  return variantClasses[props.variant]
})

const filteredSuggestions = computed(() => {
  if (!props.autoComplete) return []

  const query = localValue.value?.toLowerCase() || ''

  if (!query && props.minCharsForSuggestions === 0) {
    return props.suggestions.slice(0, props.maxSuggestions)
  }

  if (query.length < props.minCharsForSuggestions) {
    return []
  }

  return props.suggestions
    .filter(suggestion => {
      const text = formatSuggestion(suggestion).toLowerCase()
      return text.includes(query)
    })
    .slice(0, props.maxSuggestions)
})

const formatSuggestion = (suggestion) => {
  if (typeof suggestion === 'string') return suggestion
  return suggestion.label || suggestion.name || suggestion.value || String(suggestion)
}

// Debounced input handler
const debouncedEmit = debounce(() => {
  emit('input', localValue.value)
}, props.debounceMs)

const handleInput = () => {
  emit('update:modelValue', localValue.value)
  debouncedEmit()

  if (props.autoComplete) {
    showDropdown.value = localValue.value.length >= props.minCharsForSuggestions
    selectedIndex.value = -1
  }
}

const handleFocus = () => {
  if (props.autoComplete && localValue.value.length >= props.minCharsForSuggestions) {
    showDropdown.value = true
  }
  emit('focus')
}

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
    selectedIndex.value = -1
  }, 150)
  emit('blur')
}

const handleSearch = () => {
  if (selectedIndex.value >= 0) {
    selectSuggestion(filteredSuggestions.value[selectedIndex.value])
  } else {
    showDropdown.value = false
    emit('search', localValue.value)
  }
}

const handleEscape = () => {
  showDropdown.value = false
  selectedIndex.value = -1
  searchInput.value?.blur()
}

const handleArrowDown = (event) => {
  if (!showDropdown.value || filteredSuggestions.value.length === 0) return
  event.preventDefault()
  selectedIndex.value = Math.min(selectedIndex.value + 1, filteredSuggestions.value.length - 1)
}

const handleArrowUp = (event) => {
  if (!showDropdown.value || filteredSuggestions.value.length === 0) return
  event.preventDefault()
  selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
}

const selectSuggestion = (suggestion) => {
  const value = formatSuggestion(suggestion)
  localValue.value = value
  emit('update:modelValue', value)
  showDropdown.value = false
  selectedIndex.value = -1
  emit('search', value)
}

const clearSearch = () => {
  localValue.value = ''
  emit('update:modelValue', '')
  showDropdown.value = false
  selectedIndex.value = -1
  emit('clear')
}

const focus = () => {
  searchInput.value?.focus()
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

// Debounce utility
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Expose focus method
defineExpose({
  focus
})
</script>