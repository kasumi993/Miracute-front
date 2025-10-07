<template>
  <div class="min-h-screen bg-neutral-50">
    <div class="bg-white">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 border-gray-200 sticky top-0 z-40">
      <!-- Breadcrumb -->
      <div class="">
          <UIBreadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Search and Filters -->
      <div class="">
        <UISearchFilterContainer
          :config="searchFilterConfig"
          v-model:search="searchState.search"
          v-model:filters="searchState.filters"
          v-model:sort="searchState.sort"
          :is-searching="isSearching"
          :result-count="results.length"
          :total-count="searchState.pagination.total"
          search-placeholder="Search templates, categories, software..."
          @search="handleSearch"
          @filter-change="handleFilterChange"
          @sort-change="handleSortChange"
          @clear-filters="handleClearFilters"
          @clear-search="handleClearSearch"
        />
      </div>
      </div>
    </div>
   

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Search Results Header -->
      <SearchResults
        v-if="searchState.search"
        :search-query="searchState.search"
        :total-results="searchState.pagination.total"
        :displayed-results="results.length"
      />

      <!-- Products Grid -->
      <ProductGrid
        :products="results"
        :is-loading="isLoading"
        :columns="{ sm: 2, md: 4, lg: 4, xl: 4, '2xl': 5 }"
        :gap="2"
        :skeleton-count="20"
        :empty-title="emptyTitle"
        :empty-message="emptyMessage"
      />

      <!-- Infinite Scroll / Load More -->
      <UIInfiniteScroll
        v-if="searchState.pagination.hasNext"
        :has-more="searchState.pagination.hasNext"
        :is-loading="isLoading"
        :is-loading-more="isLoadingMore"
        @load-more="handleLoadMore"
      />
    </div>
  </div>
</template>

<script setup>
import { ProductService } from '~/services'
import { useCategoriesStore } from '~/stores/data/categories'

definePageMeta({
  title: 'Digital Templates & Design Resources',
  description: 'Browse our collection of premium digital templates for Canva, websites, social media, and more.'
})

const route = useRoute()

// Categories store
const categoriesStore = useCategoriesStore()
const categories = computed(() => categoriesStore.categories)

// Search filter configuration
const searchFilterConfig = computed(() => ({
  searchEnabled: true,
  searchDebounceMs: 300,
  searchMinChars: 0,
  sortEnabled: true,
  sortOptions: [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ],
  defaultSort: 'newest',
  paginationEnabled: true,
  defaultPageSize: 12,
  urlSync: true,
  filters: {
    category: {
      type: 'select',
      options: categories.value || [],
      optionValue: 'id',
      optionLabel: 'name',
      placeholder: 'All Categories',
      defaultValue: ''
    },
    featured: {
      type: 'toggle',
      label: 'Featured Only',
      defaultValue: false
    },
    priceRange: {
      type: 'range',
      label: 'Price',
      minPlaceholder: 'Min',
      maxPlaceholder: 'Max',
      min: 0,
      step: 1,
      defaultValue: { min: '', max: '' },
      debounceMs: 1000
    }
  }
}))

// Use unified search filter composable
const {
  state: searchState,
  results,
  isLoading,
  isSearching,
  isLoadingMore,
  hasResults,
  isEmpty,
  search,
  loadMore,
  updateSearch,
  updateFilter,
  updateSort,
  clearFilters,
  clearSearch
} = useSearchFilter(searchFilterConfig.value)

// SEO
const { setTemplatesSEO } = useSEO()

// Computed properties
const activeCategory = computed(() => {
  if (!searchState.filters.category || !categories.value) return null
  return categories.value.find(cat => cat.id === searchState.filters.category)
})

const breadcrumbItems = computed(() => {
  const items = [
    { label: 'Home', to: '/' },
    { label: 'Templates', active: !activeCategory.value }
  ]

  if (activeCategory.value) {
    items.push({
      label: activeCategory.value.name,
      active: true
    })
  }

  return items
})

const emptyTitle = computed(() => {
  return searchState.search ? `No results for "${searchState.search}"` : 'No templates found'
})

const emptyMessage = computed(() => {
  if (searchState.search) {
    return `We couldn't find any templates matching "${searchState.search}". Try different keywords or browse our categories.`
  }
  return 'We couldn\'t find any templates matching your criteria. Try adjusting your filters.'
})

// API function for searching products
const searchProducts = async (searchParams, paginationParams) => {
  console.log('Searching products with:', searchParams, paginationParams)

  // Transform filters for API
  const apiParams = { ...searchParams }

  // Handle price range filter
  if (searchParams.priceRange) {
    if (searchParams.priceRange.min) apiParams.minPrice = parseFloat(searchParams.priceRange.min)
    if (searchParams.priceRange.max) apiParams.maxPrice = parseFloat(searchParams.priceRange.max)
    delete apiParams.priceRange
  }

  return await ProductService.getProducts(apiParams, paginationParams)
}

// Event handlers
const handleSearch = (query) => {
  updateSearch(query, searchProducts)
}

const handleFilterChange = ({ key, value, filters }) => {
  updateFilter(key, value, searchProducts)
}

const handleSortChange = (sortValue) => {
  updateSort(sortValue, searchProducts)
}

const handleClearFilters = () => {
  clearFilters(searchProducts)
}

const handleClearSearch = () => {
  clearSearch(searchProducts)
}

const handleLoadMore = () => {
  loadMore(searchProducts)
}

// Watch for SEO updates
watch([
  () => searchState.search,
  () => searchState.filters.category,
  () => searchState.pagination.total
], () => {
  const category = categories.value?.find(cat => cat.id === searchState.filters.category)
  setTemplatesSEO({
    category: category?.name,
    search: searchState.search,
    total: searchState.pagination.total
  })
}, { immediate: true })

// Initialize
onMounted(async () => {
  try {
    console.log('Loading categories...')
    await categoriesStore.fetchCategories()
    console.log('Categories loaded:', categories.value?.length)

    console.log('Starting initial product search...')
    await search(searchProducts)
    console.log('Initial products loaded:', results.value?.length)
  } catch (error) {
    console.error('Error during initialization:', error)
  }
})
</script>