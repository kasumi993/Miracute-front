<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50"
        @click="$emit('close')"
      ></div>
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-full bg-white flex flex-col shadow-2xl z-100"
        @click.stop
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Filters</h2>
          <div class="flex items-center space-x-4">
            <!-- Clear Filters Button -->
            <button
              v-if="hasActiveFilters"
              @click="handleClearFilters"
              class="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-300"
            >
              Clear all
            </button>
            <!-- Close Button -->
            <button
              @click="$emit('close')"
              class="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <!-- Filter Content - Scrollable -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <div class="space-y-8">
            <!-- Dynamic Filters -->
            <template v-for="(filterConfig, key) in config.filterOptions || {}" :key="key">
              <div class="space-y-4">
                <h3 class="text-base font-semibold text-gray-800 capitalize tracking-wide">
                  {{ filterConfig.label || key }}
                </h3>

                <!-- Select Filter -->
                <UIFilterSelect
                  v-if="filterConfig.type === 'select'"
                  :model-value="drawerFilters[key]"
                  @update="(value: any) => handleFilterChange(String(key), value)"
                  :options="filterConfig.options || []"
                  :placeholder="filterConfig.placeholder || `All ${key}`"
                  size="lg"
                  :option-value="filterConfig.optionValue"
                  :option-label="filterConfig.optionLabel"
                  class="w-full"
                />

                <!-- Range Filter -->
                <UIFilterRange
                  v-else-if="filterConfig.type === 'range'"
                  :model-value="drawerFilters[key]"
                  @update="(value: any) => handleFilterChange(String(key), value)"
                  :label="filterConfig.label"
                  :min-placeholder="filterConfig.minPlaceholder || 'Min'"
                  :max-placeholder="filterConfig.maxPlaceholder || 'Max'"
                  :min="filterConfig.min"
                  :max="filterConfig.max"
                  :step="filterConfig.step"
                  :debounce-ms="100"
                  size="lg"
                  class="w-full"
                />

                <!-- Toggle Filter -->
                <UIFilterToggle
                  v-else-if="filterConfig.type === 'toggle'"
                  :model-value="drawerFilters[key]"
                  @update="(value: any) => handleFilterChange(String(key), value)"
                  :label="filterConfig.label"
                  :description="filterConfig.description"
                  size="lg"
                  class="w-full"
                />

                <!-- Sort Filter -->
                <UIFilterSelect
                  v-else-if="filterConfig.type === 'sort'"
                  :model-value="drawerFilters[key]"
                  @update="(value: any) => handleFilterChange(String(key), value)"
                  :options="filterConfig.options || []"
                  :placeholder="filterConfig.placeholder || 'Sort by'"
                  size="lg"
                  class="w-full"
                />
              </div>
            </template>

          </div>
        </div>

        <!-- Footer - Apply Button -->
        <div class="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-5">
          <button
            @click="handleApplyFilters"
            class="w-full bg-neutral-600 hover:bg-neutral-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Apply Filters
            <span v-if="activeFilterCount > 0" class="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
              {{ activeFilterCount }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  config: {
    filterOptions?: Record<string, any>
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  clear: []
  apply: []
}>()

// Inject the search filter composable and search function
const searchFilter = inject('searchFilter') as any
const searchProducts = inject('searchProducts') as Function

// Local state for drawer filters
const drawerFilters = ref<Record<string, any>>({})

// Initialize drawer state when opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    drawerFilters.value = { ...searchFilter.state.filters }
  }
})

// Helper to check if a filter value is active
const isFilterActive = (key: string, value: any) => {
  const config = props.config.filterOptions?.[key]
  const defaultValue = config?.defaultValue

  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some(v => v != null && v !== '')
  }
  return defaultValue !== undefined ? value !== defaultValue : (value != null && value !== '' && value !== false)
}

// Computed properties
const activeFilterCount = computed(() => {
  return Object.keys(drawerFilters.value).filter(key =>
    isFilterActive(key, drawerFilters.value[key])
  ).length
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

// Event handlers
const handleFilterChange = (key: string, value: any) => {
  drawerFilters.value = { ...drawerFilters.value, [key]: value }
}

const handleClearFilters = () => {
  searchFilter.clearFilters(searchProducts)
  emit('close')
}

const handleApplyFilters = () => {
  // Apply all drawer changes at once
  Object.assign(searchFilter.state.filters, drawerFilters.value)
  searchFilter.search(searchProducts, true)
  emit('close')
}

// Escape key handler
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) =>
    e.key === 'Escape' && props.isOpen && emit('close')

  document.addEventListener('keydown', handleEscape)
  onUnmounted(() => document.removeEventListener('keydown', handleEscape))
})
</script>