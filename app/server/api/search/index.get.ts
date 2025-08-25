<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Search Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <h1 class="text-3xl font-heading font-medium text-gray-900 mb-4">
          <span v-if="searchQuery">Search Results for "{{ searchQuery }}"</span>
          <span v-else>Search Templates</span>
        </h1>
        
        <!-- Search Form -->
        <div class="max-w-2xl">
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              placeholder="Search for templates, categories, or keywords..."
              class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-sage focus:border-transparent text-lg"
            >
            <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-3.5 w-6 h-6 text-gray-400" />
            <button v-if="searchQuery" 
                    @click="clearSearch"
                    class="absolute right-4 top-3.5 w-6 h-6 text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="container-custom py-12">
      <!-- Search Filters -->
      <div v-if="searchQuery" class="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white rounded-lg border border-gray-200">
        <span class="text-sm font-medium text-gray-700">Filters:</span>
        
        <!-- Category Filter -->
        <select v-model="filters.category" class="text-sm border border-gray-300 rounded-lg px-3 py-1">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <!-- Price Range -->
        <select v-model="filters.priceRange" class="text-sm border border-gray-300 rounded-lg px-3 py-1">
          <option value="">Any Price</option>
          <option value="0-25">$0 - $25</option>
          <option value="25-50">$25 - $50</option>
          <option value="50-100">$50 - $100</option>
          <option value="100+">$100+</option>
        </select>

        <!-- Difficulty -->
        <select v-model="filters.difficulty" class="text-sm border border-gray-300 rounded-lg px-3 py-1">
          <option value="">Any Difficulty</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <!-- Clear Filters -->
        <button @click="clearFilters" class="text-sm text-brand-brown hover:text-brand-brown/80">
          Clear Filters
        </button>
      </div>

      <!-- Results Header -->
      <div v-if="searchQuery" class="flex justify-between items-center mb-8">
        <div>
          <p class="text-gray-600">
            <span v-if="!isLoading">{{ totalResults }} result{{ totalResults !== 1 ? 's' : '' }} found</span>
            <span v-else>Searching...</span>
          </p>
        </div>
        
        <select v-model="sortBy" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="relevance">Most Relevant</option>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <!-- No Search Query -->
      <div v-if="!searchQuery" class="text-center py-16">
        <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h3 class="text-xl font-heading font-medium text-gray-900 mb-2">Start Your Search</h3>
        <p class="text-gray-600 mb-8">Enter a keyword to find the perfect template for your project.</p>
        
        <!-- Popular Search Terms -->
        <div class="max-w-md mx-auto">
          <p class="text-sm text-gray-500 mb-4">Popular searches:</p>
          <div class="flex flex-wrap gap-2 justify-center">
            <button v-for="term in popularSearches" 
                    :key="term"
                    @click="searchQuery = term; performSearch()"
                    class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              {{ term }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-else-if="!isLoading && results.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard v-for="product in results" 
                      :key="product.id" 
                      :product="product" />
        </div>

        <!-- Load More -->
        <div v-if="hasMore" class="text-center mt-12">
          <button @click="loadMore" 
                  :disabled="isLoadingMore"
                  class="btn-primary">
            <span v-if="!isLoadingMore">Load More Results</span>
            <span v-else class="flex items-center space-x-2">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 9" :key="i" class="card-product animate-pulse">
          <div class="aspect-[4/3] bg-gray-200"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="searchQuery && results.length === 0" class="text-center py-16">
        <Icon name="heroicons:magnifying-glass-minus" class="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h3 class="text-xl font-heading font-medium text-gray-900 mb-2">No Results Found</h3>
        <p class="text-gray-600 mb-8">
          We couldn't find any templates matching "{{ searchQuery }}". Try different keywords or browse our categories.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="clearSearch" class="btn-primary">
            Clear Search
          </button>
          <NuxtLink to="/categories" class="btn-secondary">
            Browse Categories
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Search Templates | Miracute',
  description: 'Search our collection of professional website templates. Find the perfect design for your project.',
  robots: 'noindex, follow'
})

// Composables
const route = useRoute()
const router = useRouter()
const { categories, fetchCategories, searchProducts } = useProducts()

// State
const searchQuery = ref(route.query.q as string || '')
const results = ref([])
const totalResults = ref(0)
const hasMore = ref(false)
const currentPage = ref(1)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const sortBy = ref('relevance')

const filters = reactive({
  category: '',
  priceRange: '',
  difficulty: ''
})

const popularSearches = [
  'wedding',
  'business',
  'portfolio',
  'restaurant',
  'blog',
  'landing page'
]

// Methods
const performSearch = async (page = 1, append = false) => {
  if (!searchQuery.value.trim()) return

  if (!append) {
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  try {
    const searchFilters = {
      search: searchQuery.value,
      category: filters.category || undefined,
      difficulty: filters.difficulty || undefined,
      sortBy: sortBy.value === 'relevance' ? 'newest' : sortBy.value
    }

    // Parse price range
    if (filters.priceRange) {
      if (filters.priceRange === '100+') {
        searchFilters.minPrice = 100
      } else {
        const [min, max] = filters.priceRange.split('-').map(Number)
        searchFilters.minPrice = min
        searchFilters.maxPrice = max
      }
    }

    const response = await searchProducts(searchQuery.value, page)

    if (append) {
      results.value = [...results.value, ...response.products]
    } else {
      results.value = response.products
    }

    totalResults.value = response.total
    hasMore.value = response.hasMore
    currentPage.value = page

    // Update URL
    await router.replace({ 
      query: { 
        q: searchQuery.value,
        ...(filters.category && { category: filters.category }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.priceRange && { price: filters.priceRange })
      } 
    })

  } catch (error) {
    console.error('Search failed:', error)
    useToast().error('Search failed. Please try again.')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const debouncedSearch = debounce(() => {
  if (searchQuery.value.trim()) {
    performSearch()
  } else {
    results.value = []
    totalResults.value = 0
  }
}, 500)

const loadMore = () => {
  if (!isLoadingMore.value && hasMore.value) {
    performSearch(currentPage.value + 1, true)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  results.value = []
  totalResults.value = 0
  router.replace({ query: {} })
}

const clearFilters = () => {
  filters.category = ''
  filters.priceRange = ''
  filters.difficulty = ''
  performSearch()
}

// Watch for filter changes
watch([() => filters.category, () => filters.priceRange, () => filters.difficulty, sortBy], () => {
  if (searchQuery.value) {
    performSearch()
  }
})

// Initialize
onMounted(async () => {
  // Load categories for filter
  await fetchCategories()
  
  // Perform initial search if query exists
  if (searchQuery.value) {
    // Set filters from URL params
    if (route.query.category) filters.category = route.query.category as string
    if (route.query.difficulty) filters.difficulty = route.query.difficulty as string
    if (route.query.price) filters.priceRange = route.query.price as string
    
    await performSearch()
  }
})

// Debounce helper
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
</script>