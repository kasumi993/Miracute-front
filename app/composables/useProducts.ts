// Simplified wrapper around the products store
import { useProductsStore } from '~/stores/product/products'
import { useCategoriesStore } from '~/stores/categories'

export const useProducts = () => {
  const productsStore = useProductsStore()
  const categoriesStore = useCategoriesStore()

  const fetchCategories = async () => {
    await categoriesStore.fetchCategories()
  }

  return {
    // State (read-only)
    products: productsStore.products,
    featuredProducts: productsStore.featuredProducts,
    popularProducts: productsStore.popularProducts,
    currentProduct: productsStore.currentProduct,
    relatedProducts: productsStore.relatedProducts,
    pagination: productsStore.pagination,
    isLoading: productsStore.isLoading,
    error: productsStore.error,
    hasProducts: productsStore.hasProducts,

    // Categories from categories store
    categories: computed(() => categoriesStore.sortedCategories),
    totalProducts: computed(() => productsStore.pagination.total),
    hasMore: computed(() => productsStore.pagination.hasNextPage),

    // Actions
    fetchProducts: productsStore.fetchProducts,
    fetchProduct: productsStore.fetchProduct,
    fetchProductBySlug: productsStore.fetchProductBySlug,
    fetchFeaturedProducts: productsStore.fetchFeaturedProducts,
    fetchPopularProducts: productsStore.fetchPopularProducts,
    fetchRelatedProducts: productsStore.fetchRelatedProducts,
    searchProducts: productsStore.searchProducts,
    filterByCategory: productsStore.filterByCategory,
    loadMoreProducts: productsStore.loadMoreProducts,
    clearProducts: productsStore.clearProducts,
    clearError: productsStore.clearError,

    // Categories actions
    fetchCategories,

    // Missing functions that the template expects
    resetPagination: () => {
      productsStore.pagination.page = 1
      productsStore.products = []
    },

    loadMore: productsStore.loadMoreProducts,

    // Utilities
    productById: productsStore.productById,
    productBySlug: productsStore.productBySlug,
    productsByCategory: productsStore.productsByCategory
  }
}
