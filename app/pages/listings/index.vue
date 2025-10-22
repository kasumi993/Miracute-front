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
          :result-count="results.length"
          :total-count="searchState.pagination.total"
          search-placeholder="Search templates, categories, software..."
        />
      </div>
      </div>
    </div>
   

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Search Results Header -->
      <SearchResults
        v-if="hasActiveSearch || hasActiveFilters"
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
import { useCategoriesStore } from '~/stores/categories'

definePageMeta({
  title: 'Digital Templates & Design Resources',
  description: 'Browse our collection of premium digital templates for Canva, websites, social media, and more.'
})

// Use categories store for caching
const categoriesStore = useCategoriesStore()
const categories = computed(() => categoriesStore.sortedCategories)

// Fetch categories with caching
const fetchCategories = async () => {
  await categoriesStore.fetchCategories()
}

// Search filter configuration
const searchFilterConfig = computed(() => ({
  searchEnabled: true,
  searchDebounceMs: 500,
  filterOptions: {
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
    },
    sort: {
      type: 'sort',
      options: [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'rating', label: 'Highest Rated' }
      ],
      placeholder: 'Sort by',
      defaultValue: 'newest'
    }
  }
}))

// API function for searching products
const searchProducts = async (searchParams, paginationParams) => {
  console.log('Searching products with:', searchParams, paginationParams)

  // Transform filters for API
  const apiParams = { ...searchParams }

  // Handle price range filter
  if (searchParams.priceRange) {
    const min = searchParams.priceRange.min
    const max = searchParams.priceRange.max

    console.log('Price range debug:', { min, max })

    if (min && min !== '' && min !== null && min !== undefined) {
      apiParams.minPrice = parseFloat(min)
      console.log('Set minPrice:', apiParams.minPrice)
    }
    if (max && max !== '' && max !== null && max !== undefined) {
      apiParams.maxPrice = parseFloat(max)
      console.log('Set maxPrice:', apiParams.maxPrice)
    }
    delete apiParams.priceRange
  }

  return await ProductService.getProducts(apiParams, paginationParams)
}

// Create and provide search filter composable
const searchFilter = useSearchFilter(searchFilterConfig.value)
const {
  state: searchState,
  results,
  isLoading,
  isLoadingMore,
  hasActiveFilters,
  hasActiveSearch,
  search,
  loadMore
} = searchFilter

// Provide to child components
provide('searchFilter', searchFilter)
provide('searchProducts', searchProducts)



// Computed properties
const activeCategory = computed(() => {
  if (!searchState.filters.category || !categoriesStore.categories) return null
  return categoriesStore.categories.find(cat => cat.id === searchState.filters.category)
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

const handleLoadMore = () => {
  loadMore(searchProducts)
}



// Watch for route changes to handle search from header
const route = useRoute()
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string' && newSearch !== searchState.search) {
    console.log('Route search changed:', newSearch)
    searchState.search = newSearch
    search(searchProducts)
  } else if (!newSearch && searchState.search) {
    // URL search param was cleared, clear the search state
    console.log('URL search cleared, clearing search state')
    searchState.search = ''
    search(searchProducts)
  }
}, { immediate: true })

onMounted(async () => {
  try {
    console.log('Loading categories...')
    await fetchCategories()
    console.log('Categories loaded:', categories.value?.length)

    console.log('Starting initial product search...')
    await search(searchProducts)
    console.log('Initial products loaded:', results.value?.length)
  } catch (error) {
    console.error('Error during initialization:', error)
  }
})
</script>