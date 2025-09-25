// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified CategoryService object for easier usage
export const CategoryService = {
  // GET methods
  getCategories: (includeHidden?: boolean) => import('./get').then(m => m.getCategories(includeHidden)),
  getCategoryTree: (maxDepth?: number) => import('./get').then(m => m.getCategoryTree(maxDepth)),
  getCategory: (categoryId: string) => import('./get').then(m => m.getCategory(categoryId)),
  getCategoryBySlug: (slug: string) => import('./get').then(m => m.getCategoryBySlug(slug)),
  getCategoryProducts: (categoryId: string, page?: number, limit?: number, sortBy?: string, filters?: Record<string, any>) =>
    import('./get').then(m => m.getCategoryProducts(categoryId, page, limit, sortBy, filters)),
  getCategoryStats: (categoryId: string) => import('./get').then(m => m.getCategoryStats(categoryId)),
  getSubcategories: (categoryId: string, includeHidden?: boolean) => import('./get').then(m => m.getSubcategories(categoryId, includeHidden)),
  getCategoryBreadcrumbs: (categoryId: string) => import('./get').then(m => m.getCategoryBreadcrumbs(categoryId)),
  getPopularCategories: (limit?: number, period?: 'week' | 'month' | 'year') =>
    import('./get').then(m => m.getPopularCategories(limit, period)),
  getFeaturedCategories: () => import('./get').then(m => m.getFeaturedCategories()),
  searchCategories: (query: string, page?: number, limit?: number) => import('./get').then(m => m.searchCategories(query, page, limit)),
  getCategoryFilters: (categoryId: string) => import('./get').then(m => m.getCategoryFilters(categoryId)),
  getCategoryRecommendations: (categoryId?: string, limit?: number) =>
    import('./get').then(m => m.getCategoryRecommendations(categoryId, limit)),
  getCategorySeoData: (categoryId: string) => import('./get').then(m => m.getCategorySeoData(categoryId)),
  getCategoryAnalytics: (categoryId: string, period?: 'day' | 'week' | 'month' | 'year') =>
    import('./get').then(m => m.getCategoryAnalytics(categoryId, period)),

  // POST methods
  createCategory: (data: any) => import('./post').then(m => m.createCategory(data)),
  updateCategory: (categoryId: string, data: any) => import('./post').then(m => m.updateCategory(categoryId, data)),
  deleteCategory: (categoryId: string, moveProductsTo?: string) => import('./post').then(m => m.deleteCategory(categoryId, moveProductsTo)),
  moveCategory: (categoryId: string, newParentId?: string) => import('./post').then(m => m.moveCategory(categoryId, newParentId)),
  reorderCategories: (reorderData: any[]) => import('./post').then(m => m.reorderCategories(reorderData)),
  toggleCategoryStatus: (categoryId: string, isActive: boolean) => import('./post').then(m => m.toggleCategoryStatus(categoryId, isActive)),
  toggleCategoryFeatured: (categoryId: string, isFeatured: boolean) => import('./post').then(m => m.toggleCategoryFeatured(categoryId, isFeatured)),
  bulkUpdateCategories: (data: any) => import('./post').then(m => m.bulkUpdateCategories(data)),
  duplicateCategory: (categoryId: string, data: any) => import('./post').then(m => m.duplicateCategory(categoryId, data)),
  updateCategorySeo: (categoryId: string, data: any) => import('./post').then(m => m.updateCategorySeo(categoryId, data)),
  importCategories: (data: any) => import('./post').then(m => m.importCategories(data)),
  exportCategories: (data: any) => import('./post').then(m => m.exportCategories(data)),
  mergeCategories: (data: any) => import('./post').then(m => m.mergeCategories(data)),
  generateCategorySuggestions: (data: any) => import('./post').then(m => m.generateCategorySuggestions(data)),
  optimizeCategoryStructure: (data: any) => import('./post').then(m => m.optimizeCategoryStructure(data))
}
