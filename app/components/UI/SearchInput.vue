<template>
  <div class="relative w-full">
    <input
      ref="searchInput"
      v-model="localValue"
      @input="handleInput"
      @keydown.enter="handleSearch"
      @keydown.escape="handleEscape"
      type="text"
      :placeholder="placeholder"
      :class="inputClass"
      :disabled="disabled"
    >

    <!-- Search Icon -->
    <Icon name="heroicons:magnifying-glass" :class="iconClass" />

    <!-- Loading State -->
    <div v-if="isLoading.value" :class="rightSlotClass">
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
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  class: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'search',
  'clear'
])

const searchInput = ref(null)
const localValue = ref(props.modelValue)

// Computed classes
const inputClass = computed(() => {
  const baseClasses = 'w-full border border-gray-300 focus:ring-2 focus:ring-brand-sage focus:border-transparent text-gray-900 placeholder-gray-500 rounded-lg'

  const sizeClasses = {
    sm: 'pl-8 pr-10 py-1.5 text-sm',
    md: 'pl-10 pr-12 py-2.5 text-sm',
    lg: 'pl-12 pr-14 py-3 text-base'
  }

  return `${baseClasses} ${sizeClasses[props.size]} ${props.class}`
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


// Create debounced search function once
const debouncedEmitSearch = debounce(() => {
  emit('search', localValue.value)
}, props.debounceMs)

const handleInput = () => {
  debouncedEmitSearch()
}

const handleSearch = () => {
  emit('search', localValue.value)
}

const handleEscape = () => {
  searchInput.value?.blur()
}

const clearSearch = () => {
  localValue.value = ''
  emit('clear')
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
</script>