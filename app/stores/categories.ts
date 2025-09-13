import { defineStore } from 'pinia'
import type { Database, Category, ApiResponse } from '~/types/database'

interface CategoriesState {
  categories: Category[]
  currentCategory: Category | null
  loading: boolean
  error: string | null
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    currentCategory: null,
    loading: false,
    error: null
  }),

  getters: {
    getCategoryBySlug: (state) => (slug: string) => {
      return state.categories.find(category => category.slug === slug)
    },

    getCategoryById: (state) => (id: string) => {
      return state.categories.find(category => category.id === id)
    },

    sortedCategories: (state) => {
      return [...state.categories].sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order
        }
        return a.name.localeCompare(b.name)
      })
    },

    activeCategories: (state) => {
      return state.categories.filter(category => category.is_active)
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
      if (this.categories.length > 0) {return this.categories}

      this.setLoading(true)
      this.clearError()

      try {
        const response = await $fetch<ApiResponse<Category[]>>('/api/categories')
        this.categories = response.data || []
        return this.categories
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        this.setError('Failed to fetch categories')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async fetchCategory(slug: string) {
      this.setLoading(true)
      this.clearError()

      try {
        // Try to find in existing categories first
        const existingCategory = this.getCategoryBySlug(slug)
        if (existingCategory) {
          this.currentCategory = existingCategory
          return existingCategory
        }

        // If not found, fetch all categories (they should be cached)
        await this.fetchCategories()
        const category = this.getCategoryBySlug(slug)

        if (!category) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Category not found'
          })
        }

        this.currentCategory = category
        return category

      } catch (error: any) {
        if (error.statusCode === 404) {
          this.setError('Category not found')
          throw error
        }
        console.error('Error fetching category:', error)
        this.setError('Failed to fetch category')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    setCurrentCategory(category: Category | null) {
      this.currentCategory = category
    },

    addCategory(category: Category) {
      const existingIndex = this.categories.findIndex(c => c.id === category.id)
      if (existingIndex >= 0) {
        this.categories[existingIndex] = category
      } else {
        this.categories.push(category)
      }
    },

    updateCategory(id: string, updates: Partial<Category>) {
      const index = this.categories.findIndex(c => c.id === id)
      if (index >= 0) {
        this.categories[index] = { ...this.categories[index], ...updates }
      }
    },

    removeCategory(id: string) {
      const index = this.categories.findIndex(c => c.id === id)
      if (index >= 0) {
        this.categories.splice(index, 1)
      }
    },

    reset() {
      this.categories = []
      this.currentCategory = null
      this.loading = false
      this.error = null
    }
  }
})
