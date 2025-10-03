<template>
  <div>
    <!-- Desktop Layout -->
    <div v-if="!isMobile" class="flex items-center space-x-3">
      <!-- Category Filter -->
      <div class="relative flex-shrink-0">
        <select
          v-model="localFilters.category"
          @change="handleFilterChange"
          class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent min-w-[120px]"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <Icon name="heroicons:chevron-down" class="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <!-- Price Range -->
      <div class="flex items-center space-x-1 flex-shrink-0">
        <input
          v-model="localFilters.minPrice"
          @input="handlePriceChange"
          type="number"
          placeholder="Min"
          class="w-16 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent"
        >
        <span class="text-gray-400">-</span>
        <input
          v-model="localFilters.maxPrice"
          @input="handlePriceChange"
          type="number"
          placeholder="Max"
          class="w-16 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent"
        >
      </div>

      <!-- Sort Dropdown -->
      <div class="relative flex-shrink-0">
        <select
          v-model="localSortBy"
          @change="handleSortChange"
          class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent min-w-[100px]"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <Icon name="heroicons:chevron-down" class="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <!-- Featured Toggle -->
      <label class="flex items-center space-x-2 cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-shrink-0">
        <input
          v-model="localFilters.featured"
          @change="handleFilterChange"
          type="checkbox"
          class="text-brand-sage focus:ring-brand-sage rounded border-gray-300"
        >
        <span class="text-sm text-gray-700">Featured</span>
      </label>

      <!-- Clear Filters -->
      <button
        @click="clearFilters"
        class="text-sm text-gray-500 hover:text-gray-700 underline px-2 flex-shrink-0"
      >
        Clear
      </button>
    </div>

    <!-- Mobile Layout -->
    <div v-else class="space-y-3">
      <!-- First Row: Category and Sort -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Category Filter -->
        <div class="relative flex-1 min-w-[120px] max-w-[180px]">
          <select
            v-model="localFilters.category"
            @change="handleFilterChange"
            class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent w-full"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <Icon name="heroicons:chevron-down" class="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <!-- Sort Dropdown -->
        <div class="relative flex-1 min-w-[100px] max-w-[140px]">
          <select
            v-model="localSortBy"
            @change="handleSortChange"
            class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent w-full"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <Icon name="heroicons:chevron-down" class="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <!-- Featured Toggle -->
        <label class="flex items-center space-x-2 cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2 flex-shrink-0">
          <input
            v-model="localFilters.featured"
            @change="handleFilterChange"
            type="checkbox"
            class="text-brand-sage focus:ring-brand-sage rounded border-gray-300"
          >
          <span class="text-sm text-gray-700">Featured</span>
        </label>
      </div>

      <!-- Second Row: Price Range and Clear -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <!-- Price Range -->
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 whitespace-nowrap">Price:</span>
          <div class="flex items-center space-x-1">
            <input
              v-model="localFilters.minPrice"
              @input="handlePriceChange"
              type="number"
              placeholder="Min"
              class="w-20 sm:w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent"
            >
            <span class="text-gray-400">-</span>
            <input
              v-model="localFilters.maxPrice"
              @input="handlePriceChange"
              type="number"
              placeholder="Max"
              class="w-20 sm:w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent"
            >
          </div>
          <button
            @click="clearFilters"
            class="text-sm text-gray-500 hover:text-gray-700 underline px-2 whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  sortBy: {
    type: String,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  sortOptions: {
    type: Array,
    default: () => [
      { value: 'newest', label: 'Recent' },
      { value: 'price_asc', label: 'Low Price' },
      { value: 'price_desc', label: 'High Price' },
      { value: 'popular', label: 'Popular' }
    ]
  },
  priceDebounceMs: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['update:filters', 'update:sortBy', 'clear'])

const localFilters = ref({ ...props.filters })
const localSortBy = ref(props.sortBy)

const debouncedPriceEmit = debounce(() => {
  emit('update:filters', { ...localFilters.value })
}, props.priceDebounceMs)

const handleFilterChange = () => {
  emit('update:filters', { ...localFilters.value })
}

const handlePriceChange = () => {
  debouncedPriceEmit()
}

const handleSortChange = () => {
  emit('update:sortBy', localSortBy.value)
}

const clearFilters = () => {
  localFilters.value = {
    category: '',
    minPrice: '',
    maxPrice: '',
    featured: false
  }
  localSortBy.value = 'newest'
  emit('clear')
}

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

watch(() => props.sortBy, (newSortBy) => {
  localSortBy.value = newSortBy
})

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}
</script>