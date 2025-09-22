import { defineStore } from 'pinia'
import type { ProductWithCategory, SearchResponse } from '~/types/database'
import { ProductService, CategoryService, type ProductFilters, type ProductPaginationParams } from '~/services'

interface ProductsState {
  products: ProductWithCategory[]
  featuredProducts: ProductWithCategory[]
  popularProducts: ProductWithCategory[]
  recentProducts: ProductWithCategory[]
  currentProduct: ProductWithCategory | null
  relatedProducts: ProductWithCategory[]

  // Pagination
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  // Filters
  currentFilters: ProductFilters

  // Loading states
  loading: {
    products: boolean
    featured: boolean
    popular: boolean
    recent: boolean
    current: boolean
    related: boolean
  }

  // Error states
  error: string | null

  // Cache
  lastFetch: number | null
  cacheTimeout: number // 5 minutes
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    featuredProducts: [],
    popularProducts: [],
    recentProducts: [],
    currentProduct: null,
    relatedProducts: [],

    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    },

    currentFilters: {},

    loading: {
      products: false,
      featured: false,
      popular: false,
      recent: false,
      current: false,
      related: false
    },

    error: null,
    lastFetch: null,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    isLoading: (state) => Object.values(state.loading).some(loading => loading),

    hasProducts: (state) => state.products.length > 0,

    hasFeaturedProducts: (state) => state.featuredProducts.length > 0,

    hasPopularProducts: (state) => state.popularProducts.length > 0,

    productById: (state) => (id: string) =>
      state.products.find(product => product.id === id),

    productBySlug: (state) => (slug: string) =>
      state.products.find(product => product.slug === slug),

    productsByCategory: (state) => (categoryId: string) =>
      state.products.filter(product => product.category_id === categoryId),

    activeProducts: (state) => state.products.filter(product => product.is_active),

    isDataStale: (state) => {
      if (!state.lastFetch) return true
      return Date.now() - state.lastFetch > state.cacheTimeout
    },

    totalProductsCount: (state) => state.pagination.total,

    currentPage: (state) => state.pagination.page,

    hasMorePages: (state) => state.pagination.hasNextPage
  },

  actions: {
    // Set loading state
    setLoading(type: keyof ProductsState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    // Fetch all products with filters and pagination
    async fetchProducts(filters: ProductFilters = {}, pagination: ProductPaginationParams = {}, reset = true) {
      if (reset) {
        this.setLoading('products', true)
        this.products = []
      }

      this.setError(null)

      try {
        const response = await ProductService.getProducts(filters, pagination)

        if (response.success && response.data) {
          const { data: productsData, pagination: paginationData } = response.data

          if (reset) {
            this.products = productsData || []
          } else {
            this.products.push(...(productsData || []))
          }

          this.pagination = {
            page: paginationData?.page || 1,
            limit: paginationData?.limit || 12,
            total: paginationData?.total || 0,
            totalPages: paginationData?.totalPages || 0,
            hasNextPage: paginationData?.hasNextPage || false,
            hasPreviousPage: paginationData?.hasPreviousPage || false
          }

          this.currentFilters = filters
          this.lastFetch = Date.now()
        } else {
          throw new Error(response.error || 'Failed to fetch products')
        }
      } catch (error: any) {
        console.error('Error fetching products:', error)
        this.setError(error.message || 'Failed to fetch products')
      } finally {
        this.setLoading('products', false)
      }
    },

    // Load more products (pagination)
    async loadMoreProducts() {
      if (!this.pagination.hasNextPage || this.loading.products) return

      const nextPage = this.pagination.page + 1
      await this.fetchProducts(
        this.currentFilters,
        { ...this.currentFilters, page: nextPage },
        false
      )
    },

    // Fetch featured products
    async fetchFeaturedProducts(limit = 6) {
      if (this.featuredProducts.length > 0 && !this.isDataStale) return

      this.setLoading('featured', true)
      this.setError(null)

      try {
        const response = await ProductService.getFeaturedProducts(limit)

        if (response.success && response.data) {
          this.featuredProducts = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch featured products')
        }
      } catch (error: any) {
        console.error('Error fetching featured products:', error)
        this.setError(error.message || 'Failed to fetch featured products')
      } finally {
        this.setLoading('featured', false)
      }
    },

    // Fetch popular products
    async fetchPopularProducts(limit = 8) {
      if (this.popularProducts.length > 0 && !this.isDataStale) return

      this.setLoading('popular', true)
      this.setError(null)

      try {
        const response = await ProductService.getPopularProducts(limit)

        if (response.success && response.data) {
          this.popularProducts = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch popular products')
        }
      } catch (error: any) {
        console.error('Error fetching popular products:', error)
        this.setError(error.message || 'Failed to fetch popular products')
      } finally {
        this.setLoading('popular', false)
      }
    },

    // Fetch recent products
    async fetchRecentProducts(limit = 8) {
      if (this.recentProducts.length > 0 && !this.isDataStale) return

      this.setLoading('recent', true)
      this.setError(null)

      try {
        const response = await ProductService.getNewestProducts(limit)

        if (response.success && response.data) {
          this.recentProducts = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch recent products')
        }
      } catch (error: any) {
        console.error('Error fetching recent products:', error)
        this.setError(error.message || 'Failed to fetch recent products')
      } finally {
        this.setLoading('recent', false)
      }
    },

    // Fetch single product
    async fetchProduct(id: string) {
      this.setLoading('current', true)
      this.setError(null)

      try {
        const response = await ProductService.getProduct(id)

        if (response.success && response.data) {
          this.currentProduct = response.data

          // Add to products array if not already there
          const existingIndex = this.products.findIndex(p => p.id === id)
          if (existingIndex === -1) {
            this.products.unshift(response.data)
          } else {
            this.products[existingIndex] = response.data
          }

          return response.data
        } else {
          throw new Error(response.error || 'Failed to fetch product')
        }
      } catch (error: any) {
        console.error('Error fetching product:', error)
        this.setError(error.message || 'Failed to fetch product')
        throw error
      } finally {
        this.setLoading('current', false)
      }
    },

    // Fetch product by slug
    async fetchProductBySlug(slug: string) {
      this.setLoading('current', true)
      this.setError(null)

      try {
        const response = await ProductService.getProductBySlug(slug)

        if (response.success && response.data) {
          this.currentProduct = response.data

          // Add to products array if not already there
          const existingIndex = this.products.findIndex(p => p.slug === slug)
          if (existingIndex === -1) {
            this.products.unshift(response.data)
          } else {
            this.products[existingIndex] = response.data
          }

          return response.data
        } else {
          throw new Error(response.error || 'Product not found')
        }
      } catch (error: any) {
        console.error('Error fetching product by slug:', error)
        this.setError(error.message || 'Product not found')
        throw error
      } finally {
        this.setLoading('current', false)
      }
    },

    // Fetch related products
    async fetchRelatedProducts(productId: string, categoryId?: string, limit = 4) {
      this.setLoading('related', true)
      this.setError(null)

      try {
        const response = await ProductService.getRelatedProducts(productId, categoryId, limit)

        if (response.success && response.data) {
          this.relatedProducts = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch related products')
        }
      } catch (error: any) {
        console.error('Error fetching related products:', error)
        this.setError(error.message || 'Failed to fetch related products')
      } finally {
        this.setLoading('related', false)
      }
    },

    // Search products
    async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}, pagination: ProductPaginationParams = {}) {
      const searchFilters = { ...filters, search: query }
      await this.fetchProducts(searchFilters, pagination, true)
    },

    // Filter products by category
    async filterByCategory(categoryId: string, additionalFilters: Omit<ProductFilters, 'category'> = {}) {
      const filters = { ...additionalFilters, category: categoryId }
      await this.fetchProducts(filters, {}, true)
    },

    // Clear current product
    clearCurrentProduct() {
      this.currentProduct = null
      this.relatedProducts = []
    },

    // Clear all products
    clearProducts() {
      this.products = []
      this.currentProduct = null
      this.relatedProducts = []
      this.pagination = {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
      this.currentFilters = {}
      this.lastFetch = null
    },

    // Clear error
    clearError() {
      this.setError(null)
    },

    // Update product in store (after edit/update)
    updateProduct(updatedProduct: ProductWithCategory) {
      const index = this.products.findIndex(p => p.id === updatedProduct.id)
      if (index !== -1) {
        this.products[index] = updatedProduct
      }

      if (this.currentProduct?.id === updatedProduct.id) {
        this.currentProduct = updatedProduct
      }

      // Update in featured/popular arrays as well
      const featuredIndex = this.featuredProducts.findIndex(p => p.id === updatedProduct.id)
      if (featuredIndex !== -1) {
        this.featuredProducts[featuredIndex] = updatedProduct
      }

      const popularIndex = this.popularProducts.findIndex(p => p.id === updatedProduct.id)
      if (popularIndex !== -1) {
        this.popularProducts[popularIndex] = updatedProduct
      }
    },

    // Remove product from store (after delete)
    removeProduct(productId: string) {
      this.products = this.products.filter(p => p.id !== productId)
      this.featuredProducts = this.featuredProducts.filter(p => p.id !== productId)
      this.popularProducts = this.popularProducts.filter(p => p.id !== productId)
      this.recentProducts = this.recentProducts.filter(p => p.id !== productId)
      this.relatedProducts = this.relatedProducts.filter(p => p.id !== productId)

      if (this.currentProduct?.id === productId) {
        this.currentProduct = null
      }
    }
  },

})