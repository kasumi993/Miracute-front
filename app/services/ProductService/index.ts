// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Export all PUT methods
export * from './put'

// Export all DELETE methods
export * from './delete'

import { getProducts as _getProducts } from './get'

// Create a unified ProductService object for easier usage
export const ProductService = {
  // GET methods
  getProducts: _getProducts,
  getProduct: (id: string) => import('./get').then(m => m.getProduct(id)),
  getProductBySlug: (slug: string) => import('./get').then(m => m.getProductBySlug(slug)),
  searchProducts: (query: string, filters?: any, pagination?: any) => import('./get').then(m => m.searchProducts(query, filters, pagination)),
  getProductsByCategory: (categoryId: string, filters?: any, pagination?: any) => import('./get').then(m => m.getProductsByCategory(categoryId, filters, pagination)),
  getPopularProducts: (limit?: number) => import('./get').then(m => m.getPopularProducts(limit)),
  getFeaturedProducts: (limit?: number) => import('./get').then(m => m.getFeaturedProducts(limit)),
  getRelatedProducts: (productId: string, categoryId?: string, limit?: number) => import('./get').then(m => m.getRelatedProducts(productId, categoryId, limit)),
  getProductsByTemplateType: (templateType: string, filters?: any, pagination?: any) => import('./get').then(m => m.getProductsByTemplateType(templateType, filters, pagination)),
  getProductsByPriceRange: (minPrice: number, maxPrice: number, filters?: any, pagination?: any) => import('./get').then(m => m.getProductsByPriceRange(minPrice, maxPrice, filters, pagination)),
  getRecommendedProducts: (limit?: number) => import('./get').then(m => m.getRecommendedProducts(limit)),
  getSaleProducts: (filters?: any, pagination?: any) => import('./get').then(m => m.getSaleProducts(filters, pagination)),
  getProductVariants: (productId: string) => import('./get').then(m => m.getProductVariants(productId)),

  // POST methods
  createProduct: (productData: any) => import('./post').then(m => m.createProduct(productData)),
  addToFavorites: (productId: string) => import('./post').then(m => m.addToFavorites(productId)),
  addToCart: (productId: string, quantity?: number) => import('./post').then(m => m.addToCart(productId, quantity)),
  trackProductView: (productId: string, metadata?: any) => import('./post').then(m => m.trackProductView(productId, metadata)),
  reportProduct: (productId: string, reason: string, description?: string) => import('./post').then(m => m.reportProduct(productId, reason, description)),
  requestCustomization: (productId: string, data: any) => import('./post').then(m => m.requestCustomization(productId, data)),
  submitProductSuggestion: (data: any) => import('./post').then(m => m.submitProductSuggestion(data)),
  createProductVariant: (productId: string, data: any) => import('./post').then(m => m.createProductVariant(productId, data)),
  uploadProductImages: (productId: string, formData: FormData) => import('./post').then(m => m.uploadProductImages(productId, formData)),
  uploadProductFiles: (productId: string, formData: FormData) => import('./post').then(m => m.uploadProductFiles(productId, formData)),
  createProductReview: (productId: string, reviewData: any) => import('./post').then(m => m.createProductReview(productId, reviewData)),
  subscribeToProductUpdates: (productId: string, email: string) => import('./post').then(m => m.subscribeToProductUpdates(productId, email)),
  requestProductDemo: (productId: string, contactData: any) => import('./post').then(m => m.requestProductDemo(productId, contactData)),
  cloneProduct: (productId: string, modifications?: any) => import('./post').then(m => m.cloneProduct(productId, modifications)),
  createProductComparison: (productIds: string[]) => import('./post').then(m => m.createProductComparison(productIds)),
  saveForLater: (productId: string) => import('./post').then(m => m.saveForLater(productId)),
  shareProduct: (productId: string, shareData: any) => import('./post').then(m => m.shareProduct(productId, shareData)),
  createProductBundle: (bundleData: any) => import('./post').then(m => m.createProductBundle(bundleData)),

  // PUT methods
  updateProduct: (id: string, data: any) => import('./put').then(m => m.updateProduct(id, data)),
  updateProductImages: (id: string, data: any) => import('./put').then(m => m.updateProductImages(id, data)),
  updateProductFiles: (id: string, data: any) => import('./put').then(m => m.updateProductFiles(id, data)),
  updateProductPricing: (id: string, data: any) => import('./put').then(m => m.updateProductPricing(id, data)),
  updateProductSEO: (id: string, data: any) => import('./put').then(m => m.updateProductSEO(id, data)),
  updateProductVariant: (productId: string, variantId: string, data: any) => import('./put').then(m => m.updateProductVariant(productId, variantId, data)),
  updateProductStatus: (id: string, status: string) => import('./put').then(m => m.updateProductStatus(id, status)),
  updateProductVisibility: (id: string, visibility: string) => import('./put').then(m => m.updateProductVisibility(id, visibility)),
  updateProductCategory: (id: string, categoryId: string) => import('./put').then(m => m.updateProductCategory(id, categoryId)),
  updateProductTags: (id: string, tags: string[]) => import('./put').then(m => m.updateProductTags(id, tags)),
  updateProductInventory: (id: string, data: any) => import('./put').then(m => m.updateProductInventory(id, data)),
  updateProductShipping: (id: string, data: any) => import('./put').then(m => m.updateProductShipping(id, data)),
  reorderProductImages: (id: string, order: any[]) => import('./put').then(m => m.reorderProductImages(id, order)),
  updateProductAttributes: (id: string, attributes: any) => import('./put').then(m => m.updateProductAttributes(id, attributes)),
  updateProductBundle: (id: string, data: any) => import('./put').then(m => m.updateProductBundle(id, data)),
  replaceProduct: (id: string, data: any) => import('./put').then(m => m.replaceProduct(id, data)),

  // DELETE methods
  deleteProduct: (id: string) => import('./delete').then(m => m.deleteProduct(id)),
  removeFromFavorites: (productId: string) => import('./delete').then(m => m.removeFromFavorites(productId)),
  removeFromCart: (productId: string) => import('./delete').then(m => m.removeFromCart(productId)),
  deleteProductImage: (productId: string, imageId: string) => import('./delete').then(m => m.deleteProductImage(productId, imageId)),
  deleteProductFile: (productId: string, fileId: string) => import('./delete').then(m => m.deleteProductFile(productId, fileId)),
  deleteProductVariant: (productId: string, variantId: string) => import('./delete').then(m => m.deleteProductVariant(productId, variantId)),
  removeFromSaved: (productId: string) => import('./delete').then(m => m.removeFromSaved(productId)),
  deleteProductReview: (productId: string, reviewId: string) => import('./delete').then(m => m.deleteProductReview(productId, reviewId)),
  unsubscribeFromProductUpdates: (productId: string) => import('./delete').then(m => m.unsubscribeFromProductUpdates(productId)),
  deleteProductComparison: (comparisonId: string) => import('./delete').then(m => m.deleteProductComparison(comparisonId)),
  deleteProductBundle: (bundleId: string) => import('./delete').then(m => m.deleteProductBundle(bundleId)),
  bulkDeleteProducts: (productIds: string[]) => import('./delete').then(m => m.bulkDeleteProducts(productIds)),
  archiveProduct: (productId: string) => import('./delete').then(m => m.archiveProduct(productId))
}
