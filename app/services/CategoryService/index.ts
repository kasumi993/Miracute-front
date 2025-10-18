// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified CategoryService object for easier usage
export const CategoryService = {
  // GET methods
  getCategories: (includeHidden?: boolean) => import('./get').then(m => m.getCategories(includeHidden)),
  getCategory: (categoryId: string) => import('./get').then(m => m.getCategory(categoryId)),
  getCategoryBySlug: (slug: string) => import('./get').then(m => m.getCategoryBySlug(slug)),
  searchCategories: (query: string, page?: number, limit?: number) => import('./get').then(m => m.searchCategories(query, page, limit)),

  // POST methods
  createCategory: (categoryData: any) => import('./post').then(m => m.createCategory(categoryData)),
  createSampleCategories: () => import('./post').then(m => m.createSampleCategories())
}