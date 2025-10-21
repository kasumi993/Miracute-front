import { defineStore } from 'pinia'
import { CategoryService } from '@/services/CategoryService'
import type { Category } from '@/types/database'

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
  lastFetched: number | null
  cacheDuration: number // 5 minutes in milliseconds
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    loading: false,
    error: null,
    lastFetched: null,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    // Check if cache is still valid
    isCacheValid: (state) => {
      if (!state.lastFetched) return false
      return Date.now() - state.lastFetched < state.cacheDuration
    },

    // Get categories sorted by name
    sortedCategories: (state) => {
      return [...state.categories].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      )
    },

    // Get category by ID
    getCategoryById: (state) => {
      return (id: string) => state.categories.find(cat => cat.id === id)
    },

    // Get category by slug
    getCategoryBySlug: (state) => {
      return (slug: string) => state.categories.find(cat => cat.slug === slug)
    },

    // Check if we have categories loaded
    hasCategories: (state) => state.categories.length > 0
  },

  actions: {
    // Fetch categories with caching
    async fetchCategories(force = false) {
      // Return cached data if valid and not forcing refresh
      if (!force && this.isCacheValid && this.hasCategories) {
        return this.categories
      }

      this.loading = true
      this.error = null

      try {
        const response = await CategoryService.getCategories()
        this.categories = response.data || []
        this.lastFetched = Date.now()
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch categories'
        console.error('Failed to fetch categories:', error)
      } finally {
        this.loading = false
      }

      return this.categories
    },

    // Get single category with caching
    async getCategory(identifier: string) {
      // First try to find in cache
      let category = this.getCategoryById(identifier) || this.getCategoryBySlug(identifier)

      // If not found in cache and cache is valid, fetch all categories
      if (!category && (!this.isCacheValid || !this.hasCategories)) {
        await this.fetchCategories()
        category = this.getCategoryById(identifier) || this.getCategoryBySlug(identifier)
      }

      // If still not found, try to fetch directly
      if (!category) {
        try {
          const response = await CategoryService.getCategory(identifier)
          category = response.data

          // Add to cache if not already present
          if (category && !this.getCategoryById(category.id)) {
            this.categories.push(category)
          }
        } catch (error: any) {
          console.error('Failed to fetch category:', error)
          this.error = error.message || 'Failed to fetch category'
        }
      }

      return category
    },

    // Update category in cache
    updateCategory(updatedCategory: Category) {
      const index = this.categories.findIndex(cat => cat.id === updatedCategory.id)
      if (index !== -1) {
        this.categories[index] = updatedCategory
      } else {
        this.categories.push(updatedCategory)
      }
    },

    // Remove category from cache
    removeCategory(categoryId: string) {
      const index = this.categories.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        this.categories.splice(index, 1)
      }
    },

    // Clear cache
    clearCache() {
      this.categories = []
      this.lastFetched = null
      this.error = null
    },

    // Force refresh
    async refresh() {
      return await this.fetchCategories(true)
    }
  }
})