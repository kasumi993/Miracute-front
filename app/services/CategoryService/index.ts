// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified CategoryService object for easier usage
export const CategoryService = {
  // GET methods
  getCategories: (filter?: 'active' | 'all') => import('./get').then(m => m.getCategories(filter)),
  getCategory: (categoryId: string) => import('./get').then(m => m.getCategory(categoryId)),
  getCategoryBySlug: (slug: string) => import('./get').then(m => m.getCategoryBySlug(slug)),
  searchCategories: (query: string, page?: number, limit?: number) => import('./get').then(m => m.searchCategories(query, page, limit)),

  // POST methods
  createCategory: (categoryData: any) => import('./post').then(m => m.createCategory(categoryData)),
  updateCategory: (id: string, categoryData: any) => import('./post').then(m => m.updateCategory(id, categoryData)),
  deleteCategory: (id: string) => import('./post').then(m => m.deleteCategory(id)),
  bulkDeleteCategories: (ids: string[]) => import('./post').then(m => m.bulkDeleteCategories(ids)),
  deleteCategoryImage: (categoryId: string) => import('./post').then(m => m.deleteCategoryImage(categoryId)),
  createSampleCategories: () => import('./post').then(m => m.createSampleCategories())
}