import { defineStore } from 'pinia'
import type { Database, Product, Category, ProductSearchFilters, SearchResponse } from '~/types/database'

type ProductWithCategory = Product & { category: Category | null }

interface ProductsState {
  products: Product[]
  categories: Category[]
  currentProduct: ProductWithCategory | null
  featuredProducts: Product[]
  relatedProducts: Product[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    totalPages: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: ProductSearchFilters
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    categories: [],
    currentProduct: null,
    featuredProducts: [],
    relatedProducts: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 0,
      total: 0,
      hasNext: false,
      hasPrev: false
    },
    filters: {}
  }),

  getters: {
    getProductBySlug: (state) => (slug: string) => {
      return state.products.find(p => p.slug === slug)
    },

    getCategoryBySlug: (state) => (slug: string) => {
      return state.categories.find(c => c.slug === slug)
    },

    productsByCategory: (state) => (categoryId: string) => {
      return state.products.filter(p => p.category_id === categoryId)
    },

    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.setError(null)
    },

    async fetchCategories() {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await $fetch<{ success: boolean; data: Category[] }>('/api/categories')
        this.categories = response.data || []
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        this.setError('Failed to fetch categories')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async fetchProducts(filters: ProductSearchFilters = {}, page: number = 1, append: boolean = false) {
      this.setLoading(true)
      this.clearError()

      try {
        const queryParams: Record<string, any> = {
          page,
          limit: 12,
          ...filters
        }

        if (filters.tags?.length) {queryParams.tags = filters.tags.join(',')}
        if (filters.software?.length) {queryParams.software = filters.software.join(',')}
        if (filters.featured) {queryParams.featured = 'true'}

        const response = await $fetch<SearchResponse<ProductWithCategory>>('/api/products', {
          query: queryParams
        })

        if (append && page > 1) {
          this.products = [...this.products, ...response.data]
        } else {
          this.products = response.data
        }

        this.pagination = response.pagination
        this.filters = filters

      } catch (error: any) {
        console.error('Error fetching products:', error)
        this.setError('Failed to fetch products')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async fetchProduct(slug: string) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await $fetch<{ success: boolean; data: ProductWithCategory | null }>(`/api/products/${slug}`)

        if (!response.data) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Product not found'
          })
        }

        this.currentProduct = response.data
        return response.data

      } catch (error: any) {
        if (error.statusCode === 404) {
          this.setError('Product not found')
          throw error
        }
        console.error('Error fetching product:', error)
        this.setError('Failed to fetch product')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async fetchFeaturedProducts(limit: number = 6) {
      try {
        const response = await $fetch<SearchResponse<ProductWithCategory>>('/api/products', {
          query: { featured: 'true', limit }
        })
        this.featuredProducts = response.data
        return response.data
      } catch (error: any) {
        console.error('Error fetching featured products:', error)
        throw error
      }
    },

    async fetchRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
      try {
        const response = await $fetch<SearchResponse<ProductWithCategory>>('/api/products', {
          query: {
            category: categoryId,
            exclude: productId,
            limit
          }
        })
        this.relatedProducts = response.data
        return response.data
      } catch (error: any) {
        console.error('Error fetching related products:', error)
        return []
      }
    },

    async searchProducts(searchQuery: string, page: number = 1) {
      return this.fetchProducts({ search: searchQuery }, page)
    },

    async loadMore() {
      if (!this.pagination.hasNext || this.loading) {return}
      await this.fetchProducts(this.filters, this.pagination.page + 1, true)
    },

    setCurrentProduct(product: ProductWithCategory | null) {
      this.currentProduct = product
    },

    resetPagination() {
      this.pagination = {
        page: 1,
        totalPages: 0,
        total: 0,
        hasNext: false,
        hasPrev: false
      }
    },

    reset() {
      this.products = []
      this.currentProduct = null
      this.featuredProducts = []
      this.relatedProducts = []
      this.loading = false
      this.error = null
      this.resetPagination()
      this.filters = {}
    }
  }
})
