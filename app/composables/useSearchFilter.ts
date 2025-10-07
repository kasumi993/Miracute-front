export interface SearchFilterConfig {
  // Search configuration
  searchEnabled?: boolean
  searchDebounceMs?: number
  searchMinChars?: number

  // Filter configuration
  filters?: Record<string, {
    type: 'select' | 'range' | 'toggle' | 'multiselect'
    options?: any[]
    defaultValue?: any
    debounceMs?: number
  }>

  // Sort configuration
  sortEnabled?: boolean
  sortOptions?: Array<{ value: string; label: string }>
  defaultSort?: string

  // Pagination configuration
  paginationEnabled?: boolean
  defaultPageSize?: number

  // URL sync configuration
  urlSync?: boolean
  urlParams?: Record<string, string>
}

export interface SearchFilterState {
  search: string
  filters: Record<string, any>
  sort: string
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const useSearchFilter = (config: SearchFilterConfig = {}) => {
  // Default configuration
  const defaultConfig: SearchFilterConfig = {
    searchEnabled: true,
    searchDebounceMs: 300,
    searchMinChars: 0,
    sortEnabled: true,
    defaultSort: 'newest',
    paginationEnabled: true,
    defaultPageSize: 12,
    urlSync: true,
    filters: {},
    ...config
  }

  // Reactive state
  const state = reactive<SearchFilterState>({
    search: '',
    filters: {},
    sort: defaultConfig.defaultSort || 'newest',
    pagination: {
      page: 1,
      pageSize: defaultConfig.defaultPageSize || 12,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  })

  // Initialize filter default values
  if (defaultConfig.filters) {
    for (const [key, filterConfig] of Object.entries(defaultConfig.filters)) {
      state.filters[key] = filterConfig.defaultValue ?? ''
    }
  }

  // Loading states
  const isLoading = ref(false)
  const isSearching = ref(false)
  const isLoadingMore = ref(false)

  // Results
  const results = ref([])

  // Computed properties
  const hasActiveFilters = computed(() => {
    return Object.values(state.filters).some(value => {
      if (Array.isArray(value)) return value.length > 0
      return value !== '' && value !== null && value !== undefined && value !== false
    })
  })

  const hasActiveSearch = computed(() => {
    return state.search.trim().length > 0
  })

  const hasResults = computed(() => results.value.length > 0)

  const isEmpty = computed(() => !hasResults.value && !isLoading.value)

  // URL synchronization
  const route = useRoute()
  const router = useRouter()

  const syncToUrl = () => {
    if (!defaultConfig.urlSync) return

    const query: Record<string, any> = {}

    // Add search to URL
    if (state.search) {
      query.search = state.search
    }

    // Add filters to URL
    for (const [key, value] of Object.entries(state.filters)) {
      if (Array.isArray(value) && value.length > 0) {
        query[key] = value.join(',')
      } else if (value !== '' && value !== null && value !== undefined && value !== false) {
        query[key] = value
      }
    }

    // Add sort to URL
    if (state.sort !== defaultConfig.defaultSort) {
      query.sort = state.sort
    }

    // Add pagination to URL
    if (state.pagination.page > 1) {
      query.page = state.pagination.page
    }

    // Update URL without causing navigation
    router.replace({ query })
  }

  const syncFromUrl = () => {
    if (!defaultConfig.urlSync) return

    const query = route.query

    // Sync search from URL
    if (query.search && typeof query.search === 'string') {
      state.search = query.search
    }

    // Sync filters from URL
    for (const key of Object.keys(state.filters)) {
      if (query[key]) {
        const filterConfig = defaultConfig.filters?.[key]
        if (filterConfig?.type === 'multiselect' && typeof query[key] === 'string') {
          state.filters[key] = query[key].split(',')
        } else {
          state.filters[key] = query[key]
        }
      }
    }

    // Sync sort from URL
    if (query.sort && typeof query.sort === 'string') {
      state.sort = query.sort
    }

    // Sync pagination from URL
    if (query.page && typeof query.page === 'string') {
      const page = parseInt(query.page)
      if (page > 0) {
        state.pagination.page = page
      }
    }
  }

  // Search and filter methods
  const buildSearchParams = () => {
    const params: Record<string, any> = {}

    // Add search
    if (state.search.trim()) {
      params.search = state.search.trim()
    }

    // Add filters
    for (const [key, value] of Object.entries(state.filters)) {
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value
      } else if (value !== '' && value !== null && value !== undefined && value !== false) {
        params[key] = value
      }
    }

    // Add sort
    if (state.sort) {
      params.sortBy = state.sort
    }

    return params
  }

  const resetPagination = () => {
    state.pagination.page = 1
    state.pagination.total = 0
    state.pagination.totalPages = 0
    state.pagination.hasNext = false
    state.pagination.hasPrev = false
  }

  const updatePagination = (paginationData: any) => {
    if (paginationData) {
      state.pagination.page = paginationData.page || state.pagination.page
      state.pagination.pageSize = paginationData.limit || state.pagination.pageSize
      state.pagination.total = paginationData.total || 0
      state.pagination.totalPages = paginationData.totalPages || 0
      state.pagination.hasNext = paginationData.hasNext || false
      state.pagination.hasPrev = paginationData.hasPrev || false
    }
  }

  // Debounced search function
  const debouncedSearch = debounce(async (searchFn?: Function) => {
    if (!searchFn) return

    try {
      isSearching.value = true
      resetPagination()

      const searchParams = buildSearchParams()
      const paginationParams = {
        page: state.pagination.page,
        limit: state.pagination.pageSize
      }

      const response = await searchFn(searchParams, paginationParams)

      if (response && response.success) {
        results.value = response.data?.data || []
        updatePagination(response.data?.pagination)
      }
    } catch (error) {
      console.error('Search error:', error)
      results.value = []
    } finally {
      isSearching.value = false
      isLoading.value = false
    }
  }, defaultConfig.searchDebounceMs || 300)

  // Main search function
  const search = async (searchFn?: Function, reset = true) => {
    if (!searchFn) return

    if (reset) {
      isLoading.value = true
      resetPagination()
    } else {
      isLoadingMore.value = true
    }

    try {
      const searchParams = buildSearchParams()
      const paginationParams = {
        page: reset ? 1 : state.pagination.page + 1,
        limit: state.pagination.pageSize
      }

      const response = await searchFn(searchParams, paginationParams)

      if (response && response.success) {
        const newResults = response.data?.data || []

        if (reset) {
          results.value = newResults
          state.pagination.page = 1
        } else {
          results.value.push(...newResults)
          state.pagination.page = paginationParams.page
        }

        updatePagination(response.data?.pagination)
      }
    } catch (error) {
      console.error('Search error:', error)
      if (reset) {
        results.value = []
      }
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }

    if (reset) {
      syncToUrl()
    }
  }

  // Load more results
  const loadMore = (searchFn?: Function) => {
    if (!state.pagination.hasNext || isLoadingMore.value) return
    return search(searchFn, false)
  }

  // Update search query
  const updateSearch = (query: string, searchFn?: Function) => {
    state.search = query
    if (searchFn) {
      debouncedSearch(searchFn)
    }
  }

  // Update filter
  const updateFilter = (key: string, value: any, searchFn?: Function) => {
    state.filters[key] = value
    if (searchFn) {
      search(searchFn, true)
    }
  }

  // Update sort
  const updateSort = (sortValue: string, searchFn?: Function) => {
    state.sort = sortValue
    if (searchFn) {
      search(searchFn, true)
    }
  }

  // Clear all filters
  const clearFilters = (searchFn?: Function) => {
    state.search = ''

    // Reset filters to default values
    if (defaultConfig.filters) {
      for (const [key, filterConfig] of Object.entries(defaultConfig.filters)) {
        state.filters[key] = filterConfig.defaultValue ?? ''
      }
    }

    state.sort = defaultConfig.defaultSort || 'newest'

    if (searchFn) {
      search(searchFn, true)
    }
  }

  // Clear search only
  const clearSearch = (searchFn?: Function) => {
    state.search = ''
    if (searchFn) {
      search(searchFn, true)
    }
  }

  // Initialize from URL on mount
  onMounted(() => {
    syncFromUrl()
  })

  // Watch for route changes
  watch(() => route.query, () => {
    syncFromUrl()
  })

  return {
    // State
    state: readonly(state),
    results: readonly(results),
    isLoading: readonly(isLoading),
    isSearching: readonly(isSearching),
    isLoadingMore: readonly(isLoadingMore),

    // Computed
    hasActiveFilters,
    hasActiveSearch,
    hasResults,
    isEmpty,

    // Methods
    search,
    loadMore,
    updateSearch,
    updateFilter,
    updateSort,
    clearFilters,
    clearSearch,
    buildSearchParams,
    syncToUrl,
    syncFromUrl
  }
}

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}