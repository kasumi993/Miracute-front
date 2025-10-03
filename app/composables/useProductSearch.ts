import { ProductService } from '@/services'

export const useProductSearch = () => {
  const products = ref([])
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSearching = ref(false)
  const isInitialLoad = ref(true)

  const pagination = reactive({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const searchQuery = ref('')
  const sortBy = ref('newest')

  const filters = reactive({
    category: '',
    minPrice: '',
    maxPrice: '',
    featured: false
  })

  const totalProducts = computed(() => pagination.total)
  const hasMore = computed(() => pagination.hasNext)

  const resetPagination = () => {
    pagination.page = 1
    pagination.total = 0
    pagination.totalPages = 0
    pagination.hasNext = false
    pagination.hasPrev = false
    products.value = []
  }

  const buildSearchFilters = () => {
    return {
      search: searchQuery.value?.trim() || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      featured: filters.featured ? true : undefined,
      sortBy: sortBy.value
    }
  }

  const fetchProducts = async (searchFilters = {}, reset = true) => {
    try {
      if (reset) {
        isLoading.value = true
        products.value = []
      }

      const paginationParams = {
        page: reset ? 1 : pagination.page + 1,
        limit: pagination.limit
      }

      console.log('Fetching products with filters:', searchFilters, 'pagination:', paginationParams)

      const response = await ProductService.getProducts(searchFilters, paginationParams)

      if (response.success && response.data) {
        const { data: productsData, pagination: paginationData } = response.data

        if (reset) {
          products.value = productsData || []
          pagination.page = paginationData?.page || 1
        } else {
          products.value.push(...(productsData || []))
          pagination.page = paginationData?.page || pagination.page + 1
        }

        pagination.limit = paginationData?.limit || 12
        pagination.total = paginationData?.total || 0
        pagination.totalPages = paginationData?.totalPages || 0
        pagination.hasNext = paginationData?.hasNext || false
        pagination.hasPrev = paginationData?.hasPrev || false

        console.log('Products fetched successfully:', products.value.length, 'total:', pagination.total)
      } else {
        throw new Error(response.error || 'Failed to fetch products')
      }

    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      if (reset) {
        isLoading.value = false
      }
    }
  }

  const searchProducts = async () => {
    try {
      isSearching.value = true
      resetPagination()

      const searchFilters = buildSearchFilters()
      console.log('Searching with filters:', searchFilters)
      await fetchProducts(searchFilters, true)

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      isSearching.value = false
      isInitialLoad.value = false
    }
  }

  const loadMore = async () => {
    if (!pagination.hasNext || isLoadingMore.value) return

    isLoadingMore.value = true

    try {
      const searchFilters = buildSearchFilters()
      await fetchProducts(searchFilters, false)
    } finally {
      isLoadingMore.value = false
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

  const clearSearch = () => {
    searchQuery.value = ''
    searchProducts()
  }

  const emptyTitle = computed(() => {
    return searchQuery.value ? `No results for "${searchQuery.value}"` : 'No templates found'
  })

  const emptyMessage = computed(() => {
    return searchQuery.value
      ? `We couldn't find any templates matching "${searchQuery.value}". Try different keywords or browse our categories.`
      : 'We couldn\'t find any templates matching your criteria. Try adjusting your filters.'
  })

  return {
    // State
    products: readonly(products),
    isLoading: readonly(isLoading),
    isLoadingMore: readonly(isLoadingMore),
    isSearching: readonly(isSearching),
    isInitialLoad: readonly(isInitialLoad),
    pagination: readonly(pagination),
    searchQuery,
    sortBy,
    filters,

    // Computed
    totalProducts,
    hasMore,
    emptyTitle,
    emptyMessage,

    // Methods
    searchProducts,
    loadMore,
    clearFilters,
    clearSearch,
    resetPagination,
    buildSearchFilters
  }
}