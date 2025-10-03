<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Top Bar with Search and Filters -->
    <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <!-- Breadcrumb Row -->
        <div class="py-3 border-b border-gray-100">
          <Breadcrumb :items="breadcrumbItems" />
        </div>

        <!-- Search and Filters Row -->
        <div class="py-4">
          <!-- Desktop Layout -->
          <div class="hidden lg:grid grid-cols-12 gap-4 items-center">
            <!-- Enhanced Search Bar - Fixed Width -->
            <div class="col-span-4">
              <SearchBar
                v-model="searchQuery"
                :is-searching="isSearching"
                @search="handleSearch"
                @clear="clearSearch"
              />
            </div>

            <!-- Filter Controls -->
            <div class="col-span-6">
              <FilterControls
                v-model:filters="filters"
                v-model:sort-by="sortBy"
                :categories="categories"
                @clear="clearFilters"
              />
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
              <SearchBar
                v-model="searchQuery"
                :is-searching="isSearching"
                @search="handleSearch"
                @clear="clearSearch"
              />
            </div>

            <!-- Filters Row -->
            <FilterControls
              v-model:filters="filters"
              v-model:sort-by="sortBy"
              :categories="categories"
              :is-mobile="true"
              @clear="clearFilters"
            />

            <!-- Results Count -->
            <div class="text-sm text-gray-600 text-right">
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

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Search Results Header -->
      <SearchResults
        v-if="searchQuery"
        :search-query="searchQuery"
        :total-results="totalProducts"
        :displayed-results="products.length"
      />

      <!-- Products Grid -->
      <ProductGrid
        :products="products"
        :is-loading="isLoading || isInitialLoad"
        :columns="{ sm: 2, md: 4, lg: 4, xl: 4, '2xl': 5 }"
        :gap="2"
        :skeleton-count="20"
        :empty-title="emptyTitle"
        :empty-message="emptyMessage"
      />

      <!-- Infinite Scroll / Load More -->
      <InfiniteScroll
        :has-more="hasMore"
        :is-loading="isLoading || isInitialLoad"
        :is-loading-more="isLoadingMore"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>

<script setup>
import { useCategoriesStore } from '~/stores/data/categories'

const route = useRoute()

// Categories store for categories data
const categoriesStore = useCategoriesStore()
const categories = computed(() => categoriesStore.categories)
const fetchCategories = categoriesStore.fetchCategories

// Use product search composable
const {
  products,
  isLoading,
  isLoadingMore,
  isSearching,
  isInitialLoad,
  searchQuery,
  sortBy,
  filters,
  totalProducts,
  hasMore,
  emptyTitle,
  emptyMessage,
  searchProducts,
  loadMore,
  clearFilters,
  clearSearch
} = useProductSearch()

// SEO optimization
const { setTemplatesSEO } = useSEO()

// Computed properties
const activeCategory = computed(() => {
  if (!filters.category || !categories.value) return null
  return categories.value.find(cat => cat.id === filters.category)
})

const breadcrumbItems = computed(() => {
  const items = [
    { label: 'Home', to: '/' },
    { label: 'Templates', active: true }
  ]

  if (activeCategory.value) {
    items.push({
      label: activeCategory.value.name,
      active: true
    })
  }

  return items
})

// Event handlers
const handleSearch = () => {
  searchProducts()
}

// Watchers
watch([() => filters.category, () => filters.featured], () => {
  searchProducts()
})

watch([() => filters.minPrice, () => filters.maxPrice], debounce(() => {
  searchProducts()
}, 1000))

watch(sortBy, () => {
  searchProducts()
})

// Update SEO based on filters
watch([searchQuery, () => filters.category, totalProducts], () => {
  const category = categories.value?.find(cat => cat.id === filters.category)
  setTemplatesSEO({
    category: category?.name,
    search: searchQuery.value,
    total: totalProducts.value
  })
}, { immediate: true })

// Watch route changes to handle direct URL navigation
watch(() => route.query, (newQuery) => {
  const newSearch = newQuery.search || newQuery.q
  if (newSearch !== searchQuery.value) {
    searchQuery.value = newSearch || ''
    searchProducts()
  }
}, { immediate: true })

// Initialize
onMounted(async () => {
  try {
    // Load categories
    console.log('Loading categories...')
    await fetchCategories()
    console.log('Categories loaded:', categories.value)

    // Handle URL search params
    const urlSearch = route.query.search || route.query.q
    if (urlSearch) {
      searchQuery.value = urlSearch
    }

    // Handle URL category filter
    const urlCategory = route.query.category
    if (urlCategory && categories.value) {
      // Find the category by slug and set the filter
      const category = categories.value.find(cat => cat.slug === urlCategory)
      if (category) {
        filters.category = category.id
      }
    }

    // Initial load
    console.log('Starting initial product load...')
    await searchProducts()
    console.log('Initial products loaded:', products.value.length)
  } catch (error) {
    console.error('Error during initialization:', error)
  }
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