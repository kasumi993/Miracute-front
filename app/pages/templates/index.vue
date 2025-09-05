<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Top Bar with Search and Filters -->
    <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <!-- Breadcrumb Row -->
        <div class="py-3 border-b border-gray-100">
          <nav class="flex items-center space-x-2 text-sm">
            <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">Home</NuxtLink>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
            <span class="text-gray-900 font-medium">Templates</span>
            <span v-if="activeCategory" class="text-gray-500">
              <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400 inline mx-2" />
              {{ activeCategory.name }}
            </span>
          </nav>
        </div>

        <!-- Search and Filters Row -->
        <div class="py-4">
          <!-- Desktop Layout -->
          <div class="hidden lg:grid grid-cols-12 gap-4 items-center">
            <!-- Enhanced Search Bar - Fixed Width -->
            <div class="col-span-4">
              <div class="relative w-full">
                <input
                  ref="searchInput"
                  v-model="searchQuery"
                  @input="debouncedSearch"
                  @focus="showSearchSuggestions = true"
                  @keydown.enter="performSearch"
                  @keydown.escape="hideSearchSuggestions"
                  type="text"
                  placeholder="Search templates, categories, software..."
                  class="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm"
                >
                <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                
                <!-- Search Loading Indicator -->
                <div v-if="isSearching" class="absolute right-3 top-3">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 text-brand-sage animate-spin" />
                </div>
                
                <!-- Clear Search Button -->
                <button 
                  v-else-if="searchQuery"
                  @click="clearSearch"
                  class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>

                <!-- Search Suggestions Dropdown -->
                <div 
                  v-if="showSearchSuggestions && filteredSuggestions.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  <div class="p-2">
                    <div class="text-xs font-medium text-gray-500 mb-2">
                      {{ searchQuery ? 'Suggestions' : 'Popular searches' }}
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
            </div>

            <!-- Filter Buttons -->
            <div class="col-span-6 flex items-center space-x-3">
              <!-- Category Filter -->
              <div class="relative flex-shrink-0">
                <select 
                  v-model="filters.category" 
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
                  v-model="filters.minPrice"
                  type="number"
                  placeholder="Min"
                  class="w-16 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent"
                >
                <span class="text-gray-400">-</span>
                <input
                  v-model="filters.maxPrice"
                  type="number"
                  placeholder="Max"
                  class="w-16 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent"
                >
              </div>

              <!-- Sort Dropdown -->
              <div class="relative flex-shrink-0">
                <select 
                  v-model="sortBy" 
                  class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent min-w-[100px]"
                >
                  <option value="newest">Recent</option>
                  <option value="price_asc">Low Price</option>
                  <option value="price_desc">High Price</option>
                  <option value="popular">Popular</option>
                </select>
                <Icon name="heroicons:chevron-down" class="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <!-- Featured Toggle -->
              <label class="flex items-center space-x-2 cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-shrink-0">
                <input
                  v-model="filters.featured"
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

            <!-- Results Count with Search Info -->
            <div class="col-span-2 text-sm text-gray-600 whitespace-nowrap text-right">
              <span v-if="searchQuery">
                {{ totalProducts }} result{{ totalProducts !== 1 ? 's' : '' }} for "{{ searchQuery }}"
              </span>
              <span v-else>
                {{ totalProducts }} template{{ totalProducts !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Mobile/Tablet Layout -->
          <div class="lg:hidden space-y-4">
            <!-- Search Bar Row -->
            <div class="w-full">
              <div class="relative">
                <input
                  ref="searchInputMobile"
                  v-model="searchQuery"
                  @input="debouncedSearch"
                  @focus="showSearchSuggestions = true"
                  @keydown.enter="performSearch"
                  @keydown.escape="hideSearchSuggestions"
                  type="text"
                  placeholder="Search templates, categories, software..."
                  class="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm"
                >
                <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                
                <!-- Search Loading Indicator -->
                <div v-if="isSearching" class="absolute right-3 top-3">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 text-brand-sage animate-spin" />
                </div>
                
                <!-- Clear Search Button -->
                <button 
                  v-else-if="searchQuery"
                  @click="clearSearch"
                  class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>

                <!-- Search Suggestions Dropdown -->
                <div 
                  v-if="showSearchSuggestions && filteredSuggestions.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  <div class="p-2">
                    <div class="text-xs font-medium text-gray-500 mb-2">
                      {{ searchQuery ? 'Suggestions' : 'Popular searches' }}
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
            </div>

            <!-- Filters Row -->
            <div class="space-y-3">
              <!-- First Row: Category and Sort -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Category Filter -->
                <div class="relative flex-1 min-w-[120px] max-w-[180px]">
                  <select 
                    v-model="filters.category" 
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
                    v-model="sortBy" 
                    class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent w-full"
                  >
                    <option value="newest">Recent</option>
                    <option value="price_asc">Low Price</option>
                    <option value="price_desc">High Price</option>
                    <option value="popular">Popular</option>
                  </select>
                  <Icon name="heroicons:chevron-down" class="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <!-- Featured Toggle -->
                <label class="flex items-center space-x-2 cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2 flex-shrink-0">
                  <input
                    v-model="filters.featured"
                    type="checkbox"
                    class="text-brand-sage focus:ring-brand-sage rounded border-gray-300"
                  >
                  <span class="text-sm text-gray-700">Featured</span>
                </label>
              </div>

              <!-- Second Row: Price Range and Results -->
              <div class="flex flex-wrap items-center justify-between gap-2">
                <!-- Price Range -->
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600 whitespace-nowrap">Price:</span>
                  <div class="flex items-center space-x-1">
                    <input
                      v-model="filters.minPrice"
                      type="number"
                      placeholder="Min"
                      class="w-20 sm:w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent"
                    >
                    <span class="text-gray-400">-</span>
                    <input
                      v-model="filters.maxPrice"
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

                <!-- Results Count -->
                <div class="text-sm text-gray-600">
                  <span v-if="searchQuery">
                    {{ totalProducts }} result{{ totalProducts !== 1 ? 's' : '' }}
                  </span>
                  <span v-else>
                    {{ totalProducts }} templates
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Search Results Header -->
      <div v-if="searchQuery && products.length > 0" class="mb-6 p-4 bg-brand-sage/5 rounded-xl border border-brand-sage/20">
        <div class="flex items-center space-x-3">
          <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-brand-sage" />
          <div>
            <p class="text-sm font-medium text-gray-900">
              Showing {{ products.length }} of {{ totalProducts }} results for "{{ searchQuery }}"
            </p>
            <p class="text-xs text-gray-600 mt-1">
              Search completed in templates, descriptions, and categories
            </p>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <ProductGrid 
        :products="products"
        :is-loading="isLoading || isInitialLoad"
        :columns="{ sm: 2, md: 2, lg: 3, xl: 4, '2xl': 5 }"
        :gap="2"
        :skeleton-count="20"
        :empty-title="emptyTitle"
        :empty-message="emptyMessage"
      />


      <!-- Load More -->
      <div v-if="hasMore && !isLoading && !isInitialLoad" class="text-center mt-12">
        <button 
          @click="loadMore" 
          :disabled="isLoadingMore"
          class="bg-white border-2 border-gray-200 hover:border-brand-sage text-gray-700 hover:text-brand-sage px-8 py-3 rounded-xl transition-all font-medium shadow-sm hover:shadow-md"
        >
          <span v-if="!isLoadingMore">Show more templates</span>
          <span v-else class="flex items-center justify-center space-x-2">
            <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Website Templates | Professional Designs | Miracute',
  description: 'Browse our collection of beautiful, professional website templates. Perfect for businesses, weddings, portfolios, and more. Easy to customize, mobile-responsive.',
  keywords: 'website templates, web design, business templates, wedding websites, portfolio templates, canva templates, professional design',
  ogTitle: 'Website Templates | Professional Designs | Miracute',
  ogDescription: 'Browse our collection of beautiful, professional website templates. Perfect for businesses, weddings, portfolios, and more.',
  ogImage: '/images/og-templates.jpg'
})

// Composables
const { 
  products, 
  categories, 
  isLoading, 
  totalProducts, 
  hasMore, 
  fetchProducts, 
  fetchCategories,
  loadMore: loadMoreProducts,
  resetPagination 
} = useProducts()

const route = useRoute()

// State
const searchQuery = ref('')
const sortBy = ref('newest')
const isLoadingMore = ref(false)
const isSearching = ref(false)
const showSearchSuggestions = ref(false)
const searchInput = ref(null)
const isInitialLoad = ref(true)

const filters = reactive({
  category: '',
  minPrice: '',
  maxPrice: '',
  featured: false
})

// Search suggestions
const searchSuggestions = ref([
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
])

// Computed
const activeCategory = computed(() => {
  if (!filters.category) return null
  return categories.value.find(cat => cat.id === filters.category)
})

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) {
    return searchSuggestions.value.slice(0, 8)
  }
  
  return searchSuggestions.value
    .filter(suggestion => 
      suggestion.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .slice(0, 6)
})

// Helper methods for product data
const getReviewCount = (product) => {
  // Use actual review count if available, otherwise generate consistent fake data
  return product.review_count || Math.floor(Math.random() * 100) + 15
}

const getDownloadCount = (product) => {
  // Use actual download count if available, otherwise generate consistent fake data
  return product.download_count || Math.floor(Math.random() * 500) + 50
}

// Simplified search methods
const performSearch = () => {
  showSearchSuggestions.value = false
  searchProducts()
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  showSearchSuggestions.value = false
  searchProducts()
}

const clearSearch = () => {
  searchQuery.value = ''
  showSearchSuggestions.value = false
  searchProducts()
}

const hideSearchSuggestions = () => {
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

// Debounced search
const debouncedSearch = debounce(() => {
  searchProducts()
}, 300)

// Search method
const searchProducts = async () => {
  try {
    isSearching.value = true
    resetPagination()
    
    const searchFilters = {
      search: searchQuery.value?.trim() || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      featured: filters.featured || undefined,
      sortBy: sortBy.value
    }

    await fetchProducts(searchFilters)
    
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isSearching.value = false
    isInitialLoad.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.category = ''
  filters.minPrice = ''
  filters.maxPrice = ''
  filters.featured = false
  searchProducts()
}

const loadMore = async () => {
  isLoadingMore.value = true
  
  try {
    const searchFilters = {
      search: searchQuery.value || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      featured: filters.featured || undefined,
      sortBy: sortBy.value
    }

    await loadMoreProducts(searchFilters)
  } finally {
    isLoadingMore.value = false
  }
}

// Watchers
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 0) {
    showSearchSuggestions.value = true
  } else {
    showSearchSuggestions.value = false
  }
})

watch([() => filters.category, () => filters.featured], () => {
  searchProducts()
})

watch([() => filters.minPrice, () => filters.maxPrice], debounce(() => {
  searchProducts()
}, 1000))

watch(sortBy, () => {
  searchProducts()
})

// Computed
const emptyTitle = computed(() => {
  return searchQuery.value ? `No results for "${searchQuery.value}"` : 'No templates found'
})

const emptyMessage = computed(() => {
  return searchQuery.value 
    ? `We couldn't find any templates matching "${searchQuery.value}". Try different keywords or browse our categories.`
    : 'We couldn\'t find any templates matching your criteria. Try adjusting your filters.'
})

// Click outside handler
const handleClickOutside = (event) => {
  if (searchInput.value && !searchInput.value.parentElement.contains(event.target)) {
    showSearchSuggestions.value = false
  }
}

// Initialize
onMounted(async () => {
  // Load categories
  await fetchCategories()
  
  // Handle URL search params
  const urlSearch = route.query.q
  if (urlSearch) {
    searchQuery.value = urlSearch
  }
  
  // Handle URL category filter
  const urlCategory = route.query.category
  if (urlCategory) {
    // Find the category by slug and set the filter
    const category = categories.value.find(cat => cat.slug === urlCategory)
    if (category) {
      filters.category = category.id
    }
  }
  
  // Initial load
  await searchProducts()
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})

// Helper function for debouncing
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}
</script>