export interface SearchFilterConfig {
  searchDebounceMs?: number
  filterOptions?: Record<string, {
    type: 'select' | 'range' | 'toggle' | 'sort'
    defaultValue?: any
    options?: any[]
  }>
  defaultPageSize?: number
}

export interface SearchFilterState {
  search: string
  filters: Record<string, any>
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
  const defaultConfig: SearchFilterConfig = {
    searchDebounceMs: 300,
    defaultPageSize: 20,
    filterOptions: {},
    ...config
  }

  // Reactive state
  const state = reactive<SearchFilterState>({
    search: '',
    filters: {},
    pagination: {
      page: 1,
      pageSize: defaultConfig.defaultPageSize || 12,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  })

  // Initialize all filter default values
  if (defaultConfig.filterOptions) {
    for (const [key, filterConfig] of Object.entries(defaultConfig.filterOptions)) {
      state.filters[key] = filterConfig.defaultValue ?? ''
    }
  }

  // Loading states
  const isLoading = ref(false)
  const isLoadingMore = ref(false)

  // Results
  const results = ref<any[]>([])

  // Computed properties
  const hasActiveFilters = computed(() => {
    return Object.values(state.filters).some(value => {
      return value !== '' && value !== null && value !== undefined && value !== false
    })
  })

  const hasActiveSearch = computed(() => {
    return state.search.trim().length > 0
  })

  const hasResults = computed(() => results.value.length > 0)

  const isEmpty = computed(() => !hasResults.value && !isLoading.value)


  // Search and filter methods
  const buildSearchParams = () => {
    const params: Record<string, any> = {}

    // Add search
    if (state.search.trim()) {
      params.search = state.search.trim()
    }

    // Add filters (map sort to sortBy)
    for (const [key, value] of Object.entries(state.filters)) {
      if (value !== '' && value !== null && value !== undefined && value !== false) {
        params[key === 'sort' ? 'sortBy' : key] = value
      }
    }

    return params
  }

  const updatePagination = (paginationData?: any, reset = false) => {
    if (reset) {
      state.pagination.page = 1
      state.pagination.total = 0
      state.pagination.totalPages = 0
      state.pagination.hasNext = false
      state.pagination.hasPrev = false
    } else if (paginationData) {
      state.pagination.page = paginationData.page || state.pagination.page
      state.pagination.pageSize = paginationData.limit || state.pagination.pageSize
      state.pagination.total = paginationData.total || 0
      state.pagination.totalPages = paginationData.totalPages || 0
      state.pagination.hasNext = paginationData.hasNext || false
      state.pagination.hasPrev = paginationData.hasPrev || false
    }
  }


  // Main search function
  const search = async (searchFn?: Function, reset = true) => {
    const callId = Math.random().toString(36).substr(2, 9)
    console.log(`🔍 [${callId}] Search function called with reset:`, reset)
    console.log(`🔍 [${callId}] Current states - isLoading:`, isLoading.value)

    if (!searchFn) {
      console.log(`❌ [${callId}] No searchFn provided`)
      return
    }

    if (reset) {
      console.log(`🔄 [${callId}] Setting isLoading to true`)
      isLoading.value = true
      updatePagination(undefined, true)
    } else {
      console.log(`📚 [${callId}] Setting isLoadingMore to true`)
      isLoadingMore.value = true
    }

    try {
      const searchParams = buildSearchParams()
      const paginationParams = {
        page: reset ? 1 : state.pagination.page + 1,
        limit: state.pagination.pageSize
      }

      console.log(`🚀 [${callId}] Calling searchFn with params:`, searchParams, paginationParams)
      const response = await searchFn(searchParams, paginationParams)
      console.log(`📡 [${callId}] Received response:`, response)

      if (response && response.success) {
        const newResults = response.data?.data || []

        if (reset) {
          results.value = newResults
          state.pagination.page = 1
        } else {
          results.value = [...results.value, ...newResults]
          state.pagination.page = paginationParams.page
        }

        updatePagination(response.data?.pagination)
      }
    } catch (error) {
      console.error(`❌ [${callId}] Search error:`, error)
      if (reset) {
        results.value = []
      }
    } finally {
      console.log(`🏁 [${callId}] Finally block: resetting loading states`)
      isLoading.value = false
      isLoadingMore.value = false
      console.log(`✅ [${callId}] Loading states reset - isLoading:`, isLoading.value)
    }

  }

  // Load more results
  const loadMore = (searchFn?: Function) => !state.pagination.hasNext || isLoadingMore.value ? undefined : search(searchFn, false)

  // Update search query
  const updateSearch = (query: string, searchFn?: Function) => {
    console.log('🔎 updateSearch called with query:', query)
    console.log('🔎 Current search state before update:', state.search)
    state.search = query
    console.log('🔎 Search state after update:', state.search)
    if (searchFn) {
      console.log('🔄 Calling search function from updateSearch')
      search(searchFn, true)
    } else {
      console.log('❌ No searchFn provided to updateSearch')
    }
  }

  // Update filter
  const updateFilter = (key: string, value: any, searchFn?: Function) => {
    state.filters[key] = value
    if (searchFn) {
      search(searchFn, true)
    }
  }


  // Clear all filters
  const clearFilters = (searchFn?: Function) => {
    state.search = ''

    // Reset all filters to default values (including sort)
    if (defaultConfig.filterOptions) {
      for (const [key, filterConfig] of Object.entries(defaultConfig.filterOptions)) {
        state.filters[key] = filterConfig.defaultValue ?? ''
      }
    }

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


  return {
    // State
    state,
    results,
    isLoading,
    isLoadingMore,

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
    clearFilters,
    clearSearch
  }
}

