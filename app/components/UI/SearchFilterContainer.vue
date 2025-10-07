<template>
  <div class="py-4 sm:py-6">
    <div class="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
      <!-- Search Bar -->
      <div v-if="config.searchEnabled" class="flex-1">
        <UISearchInput
          v-model="searchModel"
          @search="handleSearchChange"
          @clear="handleSearchClear"
          :placeholder="searchPlaceholder"
          :suggestions="searchSuggestions"
          :is-loading="isSearching"
          :size="inputSize"
          :variant="inputVariant"
          :debounce-ms="config.searchDebounceMs"
        >
          <template v-if="$slots['search-dropdown']" #dropdown="{ suggestions, select }">
            <slot name="search-dropdown" :suggestions="suggestions" :select="select" />
          </template>
        </UISearchInput>
      </div>

      <!-- Filters Container -->
      <div v-if="hasFilters" class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
        <!-- Dynamic Filters -->
        <template v-for="(filterConfig, key) in config.filters" :key="key">
          <!-- Select Filter -->
          <UIFilterSelect
            v-if="filterConfig.type === 'select'"
            v-model="filterModels[key]"
            @change="(value) => handleFilterChange(key, value)"
            :options="filterConfig.options || []"
            :placeholder="filterConfig.placeholder || `All ${key}`"
            :size="inputSize"
            :variant="inputVariant"
            :option-value="filterConfig.optionValue"
            :option-label="filterConfig.optionLabel"
          />

          <!-- Range Filter -->
          <UIFilterRange
            v-else-if="filterConfig.type === 'range'"
            v-model="filterModels[key]"
            @change="(value) => handleFilterChange(key, value)"
            :label="filterConfig.label"
            :min-placeholder="filterConfig.minPlaceholder || 'Min'"
            :max-placeholder="filterConfig.maxPlaceholder || 'Max'"
            :min="filterConfig.min"
            :max="filterConfig.max"
            :step="filterConfig.step"
            :debounce-ms="filterConfig.debounceMs || 1000"
            :size="inputSize"
            :variant="inputVariant"
          />

          <!-- Toggle Filter -->
          <UIFilterToggle
            v-else-if="filterConfig.type === 'toggle'"
            v-model="filterModels[key]"
            @change="(value) => handleFilterChange(key, value)"
            :label="filterConfig.label || key"
            :size="inputSize"
            :variant="inputVariant"
          />

          <!-- Multi-select Filter -->
          <UIFilterSelect
            v-else-if="filterConfig.type === 'multiselect'"
            v-model="filterModels[key]"
            @change="(value) => handleFilterChange(key, value)"
            :options="filterConfig.options || []"
            :placeholder="filterConfig.placeholder || `Select ${key}`"
            :size="inputSize"
            :variant="inputVariant"
            multiple
          />
        </template>

        <!-- Sort Dropdown -->
        <UIFilterSelect
          v-if="config.sortEnabled && config.sortOptions"
          v-model="sortModel"
          @change="handleSortChange"
          :options="config.sortOptions"
          :size="inputSize"
          :variant="inputVariant"
          placeholder="Sort by"
        />

        <!-- Clear Filters Button -->
        <button
          v-if="hasActiveFilters"
          @click="handleClearFilters"
          :class="clearButtonClass"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4 mr-1" />
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Results Summary -->
    <div v-if="showResultsSummary && (hasActiveSearch || hasActiveFilters)" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        {{ resultsText }}
      </div>
      <slot name="results-actions" />
    </div>

    <!-- Custom Footer Slot -->
    <div v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  // Search props
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  searchSuggestions: {
    type: Array,
    default: () => []
  },
  // State props
  search: {
    type: String,
    default: ''
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  sort: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  // Results props
  resultCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  showResultsSummary: {
    type: Boolean,
    default: true
  },
  // Styling props
  inputSize: {
    type: String,
    default: 'md'
  },
  inputVariant: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits([
  'update:search',
  'update:filters',
  'update:sort',
  'search',
  'filter-change',
  'sort-change',
  'clear-filters',
  'clear-search'
])

// Reactive models
const searchModel = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value)
})

const sortModel = computed({
  get: () => props.sort,
  set: (value) => emit('update:sort', value)
})

// Initialize filter models
const filterModels = reactive({})
for (const [key, filterConfig] of Object.entries(props.config.filters || {})) {
  filterModels[key] = props.filters[key] ?? filterConfig.defaultValue ?? ''
}

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  for (const [key, value] of Object.entries(newFilters)) {
    if (filterModels[key] !== value) {
      filterModels[key] = value
    }
  }
}, { deep: true })

// Computed properties
const hasFilters = computed(() => {
  return Object.keys(props.config.filters || {}).length > 0 || props.config.sortEnabled
})

const hasActiveFilters = computed(() => {
  return Object.values(filterModels).some(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== '' && value !== null && value !== undefined && value !== false
  }) || (props.sort && props.sort !== props.config.defaultSort)
})

const hasActiveSearch = computed(() => {
  return props.search && props.search.trim().length > 0
})

const resultsText = computed(() => {
  let text = `${props.resultCount} of ${props.totalCount} results`
  if (hasActiveSearch.value) {
    text += ` for "${props.search}"`
  }
  return text
})

const clearButtonClass = computed(() => {
  const baseClasses = 'btn-outline text-sm px-4 py-3 sm:px-3 sm:py-1.5 flex items-center'

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10 sm:h-auto',
    lg: 'h-12 sm:h-auto'
  }

  return `${baseClasses} ${sizeClasses[props.inputSize]}`
})

// Event handlers
const handleSearchChange = (value) => {
  emit('search', value)
}

const handleSearchClear = () => {
  emit('clear-search')
}

const handleFilterChange = (key, value) => {
  const newFilters = { ...filterModels }
  newFilters[key] = value
  emit('update:filters', newFilters)
  emit('filter-change', { key, value, filters: newFilters })
}

const handleSortChange = (value) => {
  emit('sort-change', value)
}

const handleClearFilters = () => {
  // Reset all filter models
  for (const [key, filterConfig] of Object.entries(props.config.filters || {})) {
    filterModels[key] = filterConfig.defaultValue ?? ''
  }

  emit('clear-filters')
}

// Initialize filter models on mount
onMounted(() => {
  emit('update:filters', { ...filterModels })
})
</script>