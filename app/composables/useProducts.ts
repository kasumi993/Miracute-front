// Simplified wrapper around the products store
// This maintains compatibility while using the centralized Pinia store
import { useProductsStore } from '~/stores/product/products'

export const useProducts = () => {
  const store = useProductsStore()

  return {
    // State (read-only)
    products: store.products,
    featuredProducts: store.featuredProducts,
    popularProducts: store.popularProducts,
    currentProduct: store.currentProduct,
    relatedProducts: store.relatedProducts,
    pagination: store.pagination,
    isLoading: store.isLoading,
    error: store.error,
    hasProducts: store.hasProducts,

    // Actions
    fetchProducts: store.fetchProducts,
    fetchProduct: store.fetchProduct,
    fetchProductBySlug: store.fetchProductBySlug,
    fetchFeaturedProducts: store.fetchFeaturedProducts,
    fetchPopularProducts: store.fetchPopularProducts,
    fetchRelatedProducts: store.fetchRelatedProducts,
    searchProducts: store.searchProducts,
    filterByCategory: store.filterByCategory,
    loadMoreProducts: store.loadMoreProducts,
    clearProducts: store.clearProducts,
    clearError: store.clearError,

    // Utilities
    productById: store.productById,
    productBySlug: store.productBySlug,
    productsByCategory: store.productsByCategory
  }
}