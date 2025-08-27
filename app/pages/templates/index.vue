<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-16">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-gray-900 mb-6">
            Beautiful Website
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-green-400">
              Templates
            </span>
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Professional, customizable templates for every need. 
            <span class="text-brand-brown font-medium">{{ totalProducts }} templates</span> and growing.
          </p>
          
          <!-- Search Bar -->
          <div class="max-w-md mx-auto">
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Search templates..."
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-sage focus:border-transparent text-lg"
              >
              <NuxtIcon name="heroicons:magnifying-glass" class="absolute left-4 top-3.5 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container-custom py-12">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
            <h3 class="font-heading font-medium text-lg mb-6">Filter Templates</h3>
            
            <!-- Category Filter -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Category</h4>
              <div class="space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    v-model="filters.category"
                    type="radio"
                    value=""
                    class="text-brand-sage focus:ring-brand-sage"
                  >
                  <span class="text-gray-700">All Categories</span>
                </label>
                <label v-for="category in categories" 
                       :key="category.id" 
                       class="flex items-center space-x-2 cursor-pointer">
                  <input
                    v-model="filters.category"
                    type="radio"
                    :value="category.id"
                    class="text-brand-sage focus:ring-brand-sage"
                  >
                  <span class="text-gray-700">{{ category.name }}</span>
                </label>
              </div>
            </div>
            
            <!-- Price Range -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Price Range</h4>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model="filters.minPrice"
                  type="number"
                  placeholder="Min"
                  class="form-input text-sm"
                >
                <input
                  v-model="filters.maxPrice"
                  type="number"
                  placeholder="Max"
                  class="form-input text-sm"
                >
              </div>
            </div>
            
            <!-- Difficulty Level -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Difficulty</h4>
              <div class="space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    v-model="filters.difficulty"
                    type="radio"
                    value=""
                    class="text-brand-sage focus:ring-brand-sage"
                  >
                  <span class="text-gray-700">Any Level</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    v-model="filters.difficulty"
                    type="radio"
                    value="Beginner"
                    class="text-brand-sage focus:ring-brand-sage"
                  >
                  <span class="text-gray-700">Beginner</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    v-model="filters.difficulty"
                    type="radio"
                    value="Intermediate"
                    class="text-brand-sage focus:ring-brand-sage"
                  >
                  <span class="text-gray-700">Intermediate</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    v-model="filters.difficulty"
                    type="radio"
                    value="Advanced"
                    class="text-brand-sage focus:ring-brand-sage"
                  >
                  <span class="text-gray-700">Advanced</span>
                </label>
              </div>
            </div>
            
            <!-- Featured Only -->
            <div class="mb-6">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="filters.featured"
                  type="checkbox"
                  class="text-brand-sage focus:ring-brand-sage rounded"
                >
                <span class="text-gray-700">Featured Only</span>
              </label>
            </div>
            
            <!-- Clear Filters -->
            <button @click="clearFilters" 
                    class="w-full btn-secondary text-sm">
              Clear Filters
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Sort and View Options -->
          <div class="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div class="flex items-center space-x-4 mb-4 sm:mb-0">
              <span class="text-gray-600">
                {{ totalProducts }} template{{ totalProducts !== 1 ? 's' : '' }}
              </span>
              <div class="h-4 border-l border-gray-300"></div>
              <select v-model="sortBy" 
                      class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading && products.length === 0" 
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 9" :key="i" class="card-product animate-pulse">
              <div class="aspect-[4/3] bg-gray-200"></div>
              <div class="p-6 space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard v-for="product in products" 
                        :key="product.id" 
                        :product="product" />
          </div>

          <!-- No Results -->
          <div v-if="!isLoading && products.length === 0" 
               class="text-center py-16">
            <NuxtIcon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-xl font-heading font-medium text-gray-900 mb-2">No templates found</h3>
            <p class="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
            <button @click="clearFilters" class="btn-primary">
              Clear All Filters
            </button>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMore && !isLoading" class="text-center mt-12">
            <button @click="loadMore" 
                    :disabled="isLoadingMore"
                    class="btn-primary">
              <span v-if="!isLoadingMore">Load More Templates</span>
              <span v-else class="flex items-center space-x-2">
                <NuxtIcon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </span>
            </button>
          </div>

          <!-- Loading More -->
          <div v-if="isLoadingMore" 
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div v-for="i in 6" :key="i" class="card-product animate-pulse">
              <div class="aspect-[4/3] bg-gray-200"></div>
              <div class="p-6 space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
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

const filters = reactive({
  category: '',
  minPrice: '',
  maxPrice: '',
  difficulty: '',
  featured: false
})

// Debounced search
const debouncedSearch = debounce(() => {
  searchProducts()
}, 500)

// Methods
const searchProducts = async () => {
  resetPagination()
  
  const searchFilters = {
    search: searchQuery.value || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    difficulty: filters.difficulty || undefined,
    featured: filters.featured || undefined,
    sortBy: sortBy.value
  }

  await fetchProducts(searchFilters)
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.category = ''
  filters.minPrice = ''
  filters.maxPrice = ''
  filters.difficulty = ''
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
      difficulty: filters.difficulty || undefined,
      featured: filters.featured || undefined,
      sortBy: sortBy.value
    }

    await loadMoreProducts(searchFilters)
  } finally {
    isLoadingMore.value = false
  }
}

// Watchers
watch([() => filters.category, () => filters.difficulty, () => filters.featured], () => {
  searchProducts()
})

watch([() => filters.minPrice, () => filters.maxPrice], debounce(() => {
  searchProducts()
}, 1000))

watch(sortBy, () => {
  searchProducts()
})

// Initialize
onMounted(async () => {
  // Load categories
  await fetchCategories()
  
  // Handle URL search params
  const urlSearch = route.query.q
  if (urlSearch) {
    searchQuery.value = urlSearch
  }
  
  // Initial load
  await searchProducts()
})

// Helper function for debouncing
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
</script>