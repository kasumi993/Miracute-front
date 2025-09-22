import { defineStore } from 'pinia'
import type { Database } from '~/types/database'
import { CategoryService } from '~/services'

type Category = Database['public']['Tables']['categories']['Row']

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
  parent?: CategoryWithChildren | null
  productCount?: number
}

interface CategoriesState {
  categories: CategoryWithChildren[]
  flatCategories: Category[]
  currentCategory: CategoryWithChildren | null

  // Hierarchy data
  categoryTree: CategoryWithChildren[]
  parentCategories: CategoryWithChildren[]

  // Filtering and search
  searchQuery: string
  filteredCategories: CategoryWithChildren[]

  // Loading states
  loading: {
    categories: boolean
    current: boolean
    search: boolean
  }

  // Error states
  error: string | null

  // Cache management
  lastFetch: number | null
  cacheTimeout: number // 10 minutes
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    flatCategories: [],
    currentCategory: null,
    categoryTree: [],
    parentCategories: [],
    searchQuery: '',
    filteredCategories: [],

    loading: {
      categories: false,
      current: false,
      search: false
    },

    error: null,
    lastFetch: null,
    cacheTimeout: 10 * 60 * 1000 // 10 minutes
  }),

  getters: {
    // Basic category info
    hasCategories: (state) => state.categories.length > 0,

    categoriesCount: (state) => state.categories.length,

    isLoading: (state) => Object.values(state.loading).some(loading => loading),

    // Cache validation
    isDataStale: (state) => {
      if (!state.lastFetch) return true
      return Date.now() - state.lastFetch > state.cacheTimeout
    },

    // Category finders
    getCategoryById: (state) => (id: string) =>
      state.flatCategories.find(category => category.id === id),

    getCategoryBySlug: (state) => (slug: string) =>
      state.flatCategories.find(category => category.slug === slug),

    getCategoryByName: (state) => (name: string) =>
      state.flatCategories.find(category =>
        category.name.toLowerCase() === name.toLowerCase()
      ),

    // Hierarchy getters
    getRootCategories: (state) =>
      state.categories.filter(category => !category.parent_id),

    getChildCategories: (state) => (parentId: string) =>
      state.categories.filter(category => category.parent_id === parentId),

    getCategoryHierarchy: (state) => (categoryId: string) => {
      const category = state.flatCategories.find(cat => cat.id === categoryId)
      if (!category) return []

      const hierarchy: Category[] = [category]
      let currentCategory = category

      while (currentCategory.parent_id) {
        const parent = state.flatCategories.find(cat => cat.id === currentCategory.parent_id)
        if (parent) {
          hierarchy.unshift(parent)
          currentCategory = parent
        } else {
          break
        }
      }

      return hierarchy
    },

    // Active categories
    activeCategories: (state) =>
      state.categories.filter(category => category.is_active),

    // Featured categories
    featuredCategories: (state) =>
      state.categories.filter(category => category.is_featured && category.is_active),

    // Search results
    searchResults: (state) => {
      if (!state.searchQuery.trim()) return state.categories

      const query = state.searchQuery.toLowerCase()
      return state.categories.filter(category =>
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
      )
    },

    // Category tree with children
    categoryTreeWithCounts: (state) => {
      const buildTree = (categories: CategoryWithChildren[], parentId: string | null = null): CategoryWithChildren[] => {
        return categories
          .filter(category => category.parent_id === parentId)
          .map(category => ({
            ...category,
            children: buildTree(categories, category.id)
          }))
      }

      return buildTree(state.categories)
    },

    // Popular categories (based on product count or usage)
    popularCategories: (state) =>
      [...state.categories]
        .filter(category => category.is_active)
        .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
        .slice(0, 6),

    // Breadcrumb for current category
    currentCategoryBreadcrumb: (state) => {
      if (!state.currentCategory) return []

      const breadcrumb: CategoryWithChildren[] = []
      let current = state.currentCategory

      while (current) {
        breadcrumb.unshift(current)
        current = current.parent || null
      }

      return breadcrumb
    }
  },

  actions: {
    // Set loading state
    setLoading(type: keyof CategoriesState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // Fetch all categories
    async fetchCategories(force = false) {
      if (!force && this.hasCategories && !this.isDataStale) return

      this.setLoading('categories', true)
      this.setError(null)

      try {
        const response = await CategoryService.getCategories()

        if (response.success && response.data) {
          this.flatCategories = response.data
          this.categories = this.buildCategoryHierarchy(response.data)
          this.categoryTree = this.buildCategoryTree(response.data)
          this.lastFetch = Date.now()
        } else {
          throw new Error(response.error || 'Failed to fetch categories')
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        this.setError(error.message || 'Failed to fetch categories')
      } finally {
        this.setLoading('categories', false)
      }
    },

    // Fetch single category
    async fetchCategory(id: string) {
      this.setLoading('current', true)
      this.setError(null)

      try {
        const response = await CategoryService.getCategory(id)

        if (response.success && response.data) {
          this.currentCategory = response.data as CategoryWithChildren

          // Update in categories array if exists
          const index = this.flatCategories.findIndex(cat => cat.id === id)
          if (index !== -1) {
            this.flatCategories[index] = response.data
          } else {
            this.flatCategories.push(response.data)
          }

          return response.data
        } else {
          throw new Error(response.error || 'Category not found')
        }
      } catch (error: any) {
        console.error('Error fetching category:', error)
        this.setError(error.message || 'Category not found')
        throw error
      } finally {
        this.setLoading('current', false)
      }
    },

    // Fetch category by slug
    async fetchCategoryBySlug(slug: string) {
      this.setLoading('current', true)
      this.setError(null)

      try {
        const response = await CategoryService.getCategoryBySlug(slug)

        if (response.success && response.data) {
          this.currentCategory = response.data as CategoryWithChildren

          // Update in categories array
          const index = this.flatCategories.findIndex(cat => cat.slug === slug)
          if (index !== -1) {
            this.flatCategories[index] = response.data
          } else {
            this.flatCategories.push(response.data)
          }

          return response.data
        } else {
          throw new Error(response.error || 'Category not found')
        }
      } catch (error: any) {
        console.error('Error fetching category by slug:', error)
        this.setError(error.message || 'Category not found')
        throw error
      } finally {
        this.setLoading('current', false)
      }
    },

    // Search categories
    async searchCategories(query: string) {
      this.setSearchQuery(query)
      this.setLoading('search', true)
      this.setError(null)

      try {
        if (!query.trim()) {
          this.filteredCategories = this.categories
          return this.categories
        }

        // Use local search if categories are already loaded
        if (this.hasCategories && !this.isDataStale) {
          this.filteredCategories = this.searchResults
          return this.searchResults
        }

        // Otherwise fetch from server
        const response = await CategoryService.searchCategories(query)

        if (response.success && response.data) {
          this.filteredCategories = response.data as CategoryWithChildren[]
          return response.data
        } else {
          throw new Error(response.error || 'Failed to search categories')
        }
      } catch (error: any) {
        console.error('Error searching categories:', error)
        this.setError(error.message || 'Failed to search categories')
        return []
      } finally {
        this.setLoading('search', false)
      }
    },

    // Build category hierarchy with parent/child relationships
    buildCategoryHierarchy(flatCategories: Category[]): CategoryWithChildren[] {
      const categoryMap = new Map<string, CategoryWithChildren>()
      const hierarchicalCategories: CategoryWithChildren[] = []

      // Create map of all categories
      flatCategories.forEach(category => {
        categoryMap.set(category.id, {
          ...category,
          children: [],
          parent: null
        })
      })

      // Build hierarchy
      categoryMap.forEach(category => {
        if (category.parent_id) {
          const parent = categoryMap.get(category.parent_id)
          if (parent) {
            category.parent = parent
            if (!parent.children) parent.children = []
            parent.children.push(category)
          }
        } else {
          hierarchicalCategories.push(category)
        }
      })

      return hierarchicalCategories
    },

    // Build category tree structure
    buildCategoryTree(flatCategories: Category[]): CategoryWithChildren[] {
      const buildTree = (parentId: string | null = null): CategoryWithChildren[] => {
        return flatCategories
          .filter(category => category.parent_id === parentId)
          .map(category => ({
            ...category,
            children: buildTree(category.id)
          }))
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      }

      return buildTree()
    },

    // Get category path (breadcrumb)
    getCategoryPath(categoryId: string): CategoryWithChildren[] {
      const category = this.getCategoryById(categoryId)
      if (!category) return []

      const path: CategoryWithChildren[] = []
      let current = category as CategoryWithChildren

      while (current) {
        path.unshift(current)
        current = current.parent || null
      }

      return path
    },

    // Clear current category
    clearCurrentCategory() {
      this.currentCategory = null
    },

    // Clear search
    clearSearch() {
      this.searchQuery = ''
      this.filteredCategories = []
    },

    // Clear error
    clearError() {
      this.setError(null)
    },

    // Refresh categories (force fetch)
    async refreshCategories() {
      await this.fetchCategories(true)
    },

    // Update category in store (after edit/update)
    updateCategory(updatedCategory: Category) {
      const index = this.flatCategories.findIndex(cat => cat.id === updatedCategory.id)
      if (index !== -1) {
        this.flatCategories[index] = updatedCategory

        // Rebuild hierarchy
        this.categories = this.buildCategoryHierarchy(this.flatCategories)
        this.categoryTree = this.buildCategoryTree(this.flatCategories)
      }

      if (this.currentCategory?.id === updatedCategory.id) {
        this.currentCategory = { ...this.currentCategory, ...updatedCategory }
      }
    },

    // Remove category from store (after delete)
    removeCategory(categoryId: string) {
      this.flatCategories = this.flatCategories.filter(cat => cat.id !== categoryId)
      this.categories = this.buildCategoryHierarchy(this.flatCategories)
      this.categoryTree = this.buildCategoryTree(this.flatCategories)

      if (this.currentCategory?.id === categoryId) {
        this.currentCategory = null
      }
    },

    // Add new category to store
    addCategory(newCategory: Category) {
      this.flatCategories.push(newCategory)
      this.categories = this.buildCategoryHierarchy(this.flatCategories)
      this.categoryTree = this.buildCategoryTree(this.flatCategories)
    },

    // Get category statistics
    getCategoryStats() {
      return {
        total: this.categoriesCount,
        active: this.activeCategories.length,
        featured: this.featuredCategories.length,
        rootCategories: this.getRootCategories.length,
        maxDepth: this.getMaxCategoryDepth()
      }
    },

    // Get maximum category depth
    getMaxCategoryDepth(): number {
      let maxDepth = 0

      const calculateDepth = (categories: CategoryWithChildren[], depth = 0): number => {
        let currentMaxDepth = depth

        categories.forEach(category => {
          if (category.children && category.children.length > 0) {
            const childDepth = calculateDepth(category.children, depth + 1)
            currentMaxDepth = Math.max(currentMaxDepth, childDepth)
          }
        })

        return currentMaxDepth
      }

      return calculateDepth(this.categoryTree)
    }
  },

})