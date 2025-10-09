<template>
  <div class="py-4 sm:py-6">
    <div class="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
      <!-- Search Bar with Mobile Filter Button -->
      <div v-if="config.searchEnabled" class="flex-1">
        <div class="flex items-center space-x-3">
          <div class="flex-1">
            <UISearchInput
              v-model="searchFilter.state.search"
              @search="handleSearch"
              @clear="handleClearSearch"
              :placeholder="searchPlaceholder"
              :is-loading="searchFilter.isLoading"
              :size="inputSize"
              :variant="inputVariant"
              :debounce-ms="config.searchDebounceMs"
            >
              <template v-if="$slots['search-dropdown']" #dropdown="{ suggestions, select }">
                <slot name="search-dropdown" :suggestions="suggestions" :select="select" ></slot>
              </template>
            </UISearchInput>
          </div>

          <!-- Mobile Filter Button -->
          <UIMobileFilterButton
            :has-filters="hasFilters"
            :has-active-filters="searchFilter.hasActiveFilters"
            @open="showFilterDrawer = true"
          />
        </div>
      </div>

      <!-- Desktop Filters Container -->
      <div v-if="hasFilters" class="hidden lg:flex lg:flex-wrap gap-3">
        <!-- Dynamic Filters -->
        <template v-for="(filterConfig, key) in config.filterOptions" :key="key">
          <!-- Select Category Filter -->
          <UIFilterSelect
            v-if="filterConfig.type === 'select'"
            :model-value="searchFilter.state.filters[key]"
            @update="(value: any) => handleFilterChange(String(key), value)"
            :options="filterConfig.options || []"
            :placeholder="filterConfig.placeholder || `All ${key}`"
            :size="inputSize"
            :variant="inputVariant"
            :option-value="filterConfig.optionValue"
            :option-label="filterConfig.optionLabel"
          />

          <!-- Price Range Filter -->
          <UIFilterRange
            v-else-if="filterConfig.type === 'range'"
            :model-value="searchFilter.state.filters[key]"
            @update="(value: any) => handleFilterChange(String(key), value)"
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

          <!-- Featured Toggle Filter -->
          <UIFilterToggle
            v-else-if="filterConfig.type === 'toggle'"
            :model-value="searchFilter.state.filters[key]"
            @update="(value: any) => handleFilterChange(String(key), value)"
            :label="filterConfig.label || key"
            :size="inputSize"
            :variant="inputVariant"
          />

          <!-- Sort Filter -->
          <UIFilterSelect
            v-else-if="filterConfig.type === 'sort'"
            :model-value="searchFilter.state.filters[key]"
            @update="(value: any) => handleFilterChange(String(key), value)"
            :options="filterConfig.options"
            :size="inputSize"
            :variant="inputVariant"
            :placeholder="filterConfig.placeholder || 'Sort by'"
          />
        </template>


        <!-- Clear Filters Button -->
        <button
          v-if="searchFilter.hasActiveFilters"
          @click="handleClearFilters"
          :class="clearButtonClass"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4 mr-1" />
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Results Summary -->
    <div v-if="showResultsSummary && (searchFilter.hasActiveSearch || searchFilter.hasActiveFilters)" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        {{ resultsText }}
      </div>
      <slot name="results-actions"></slot>
    </div>

    <!-- Custom Footer Slot -->
    <div v-if="$slots.footer" class="mt-4">
      <slot name="footer"></slot>
    </div>

    <!-- Filter Drawer -->
    <UIFilterDrawer
      :is-open="showFilterDrawer"
      :config="config"
      @close="showFilterDrawer = false"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  config: {
    searchEnabled?: boolean
    searchDebounceMs?: number
    filterOptions?: Record<string, any>
  }
  searchPlaceholder?: string
  resultCount?: number
  totalCount?: number
  showResultsSummary?: boolean
  inputSize?: string
  inputVariant?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  resultCount: 0,
  totalCount: 0,
  showResultsSummary: true,
  inputSize: 'md',
  inputVariant: 'default'
})

// Inject the search filter composable
const searchFilter = inject('searchFilter') as any

// Drawer state
const showFilterDrawer = ref(false)


// Computed properties
const hasFilters = computed(() => {
  return Object.keys(props.config.filterOptions || {}).length > 0
})


const resultsText = computed(() => {
  let text = `${props.resultCount} of ${props.totalCount} results`
  if (searchFilter.hasActiveSearch) {
    text += ` for "${searchFilter.state.search}"`
  }
  return text
})

const clearButtonClass = computed(() => {
  const baseClasses = 'btn-outline text-sm px-4 py-3 sm:px-3 sm:py-1.5 flex items-center'

  const sizeClasses: Record<string, string> = {
    sm: 'h-8',
    md: 'h-10 sm:h-auto',
    lg: 'h-12 sm:h-auto'
  }

  return `${baseClasses} ${sizeClasses[props.inputSize] || sizeClasses.md}`
})

// Event handlers - connect to injected composable
const handleSearch = (query: string) => {
  searchFilter.updateSearch(query, searchProducts)
}

const handleClearSearch = () => {
  searchFilter.clearSearch(searchProducts)
}

const handleFilterChange = (key: string, value: any) => {
  searchFilter.updateFilter(key, value, searchProducts)
}

const handleClearFilters = () => {
  searchFilter.clearFilters(searchProducts)
}

// Get searchProducts from parent scope
const searchProducts = inject('searchProducts')
</script>