<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Top Bar with Search and Filters -->
    <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  <div class="p-2">
                    <div class="text-xs font-medium text-gray-500 mb-2">
                      {{ searchQuery ? 'Suggestions' : 'Popular searches' }}
                    </div>
                    <button
                      v-for="suggestion in filteredSuggestions"
                      :key="suggestion"
                      @click="selectSuggestion(suggestion)"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                    >
                      <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-gray-400" />
                      <span>{{ suggestion }}</span>
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
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  <div class="p-2">
                    <div class="text-xs font-medium text-gray-500 mb-2">
                      {{ searchQuery ? 'Suggestions' : 'Popular searches' }}
                    </div>
                    <button
                      v-for="suggestion in filteredSuggestions"
                      :key="suggestion"
                      @click="selectSuggestion(suggestion)"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                    >
                      <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-gray-400" />
                      <span>{{ suggestion }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Category Filter -->
              <div class="relative flex-shrink-0">
                <select 
                  v-model="filters.category" 
                  class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent min-w-[100px]"
                >
                  <option value="">Categories</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <Icon name="heroicons:chevron-down" class="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <!-- Sort Dropdown -->
              <div class="relative flex-shrink-0">
                <select 
                  v-model="sortBy" 
                  class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent min-w-[80px]"
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

              <!-- Results Count -->
              <div class="text-sm text-gray-600 ml-auto">
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

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading && products.length === 0" 
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <div v-for="i in 20" :key="i" class="animate-pulse">
          <div class="aspect-[4/5] bg-gray-200 rounded-2xl mb-3"></div>
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

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

      <!-- Products Grid - Etsy Style -->
      <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <div v-for="product in products" :key="product.id" class="group">
          <NuxtLink :to="`/templates/${product.slug}`" class="block">
            <!-- Large Image Card -->
            <div class="aspect-[4/5] bg-white rounded-2xl overflow-hidden mb-3 group-hover:shadow-xl transition-all duration-300 relative border border-gray-100">
              <img 
                v-if="product.preview_images?.[0]"
                :src="product.preview_images[0]" 
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              >
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                <Icon name="heroicons:photo" class="w-20 h-20" />
              </div>
              
              <!-- Software Type Badge -->
              <div class="absolute top-3 left-3">
                <span v-if="product.software_required?.length" class="bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur">
                  {{ product.software_required[0] }}
                </span>
              </div>
              
              <!-- Favorite Button -->
              <button class="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 shadow-lg">
                <Icon name="heroicons:heart" class="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
              </button>

              <!-- Quick Preview Badge (on hover) -->
              <div class="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div class="bg-white/95 backdrop-blur rounded-lg px-3 py-2 text-center">
                  <span class="text-xs font-medium text-gray-800">Quick Preview</span>
                </div>
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="space-y-2 px-1">
              <!-- Title and Price -->
              <div class="flex items-start justify-between">
                <h3 class="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-sage transition-colors flex-1 pr-2 leading-tight">
                  {{ product.name }}
                </h3>
              </div>
              
              <!-- Seller Info (Mock) -->
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <div class="w-4 h-4 rounded-full bg-gradient-to-br from-brand-sage to-brand-pink flex items-center justify-center">
                  <span class="text-[8px] text-white font-medium">M</span>
                </div>
                <span>Miracute</span>
              </div>
              
              <!-- Rating -->
              <div class="flex items-center space-x-2">
                <div class="flex items-center">
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                </div>
                <span class="text-xs text-gray-600">({{ getReviewCount(product) }})</span>
              </div>

              <!-- Price -->
              <div class="flex items-center space-x-2">
                <span class="text-lg font-bold text-gray-900">
                  ${{ parseFloat(product.price).toFixed(2) }}
                </span>
                <span v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                  ${{ parseFloat(product.compare_at_price).toFixed(2) }}
                </span>
                <span v-if="product.compare_at_price" class="text-xs text-green-600 font-medium">
                  {{ Math.round(((parseFloat(product.compare_at_price) - parseFloat(product.price)) / parseFloat(product.compare_at_price)) * 100) }}% OFF
                </span>
              </div>
              
              <!-- Category Tag -->
              <div v-if="product.category?.name" class="pt-1">
                <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {{ product.category.name }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="!isLoading" class="text-center py-20">
        <Icon name="heroicons:magnifying-glass" class="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h3 class="text-2xl font-medium text-gray-900 mb-4">
          <span v-if="searchQuery">No results for "{{ searchQuery }}"</span>
          <span v-else>No templates found</span>
        </h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          <span v-if="searchQuery">
            We couldn't find any templates matching "{{ searchQuery }}". Try different keywords or browse our categories below.
          </span>
          <span v-else>
            We couldn't find any templates matching your filters. Try adjusting your search criteria.
          </span>
        </p>
        
        <!-- Search Suggestions -->
        <div v-if="searchQuery" class="mb-8">
          <p class="text-sm text-gray-500 mb-4">Try searching for:</p>
          <div class="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            <button
              v-for="suggestion in searchSuggestions.slice(0, 6)"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              class="bg-gray-100 hover:bg-brand-sage hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
        
        <button @click="clearFilters" class="bg-brand-sage text-white px-6 py-3 rounded-lg hover:bg-brand-sage/90 transition-colors font-medium">
          <span v-if="searchQuery">Clear search</span>
          <span v-else>Clear all filters</span>
        </button>
      </div>

      <!-- Load More -->
      <div v-if="hasMore && !isLoading" class="text-center mt-12">
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
  console.log('Debounced search triggered with:', searchQuery.value)
  searchProducts()
}, 300)

// Search method
const searchProducts = async () => {
  try {
    console.log('searchProducts called with query:', searchQuery.value)
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

    console.log('Search filters:', searchFilters)
    await fetchProducts(searchFilters)
    console.log('Products fetched:', products.value.length)
    
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isSearching.value = false
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