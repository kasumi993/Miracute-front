import type { ProductWithCategory } from '@/types/database'
import { ProductService } from '@/services/ProductService'

export const useProductRecommendations = () => {
  const recommendations = ref<ProductWithCategory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get smart product recommendations with fallback system
   * Priority: same category + template type > same category > same template type > any products
   */
  const getRecommendations = async (
    currentProduct: ProductWithCategory,
    limit = 8
  ): Promise<ProductWithCategory[]> => {
    if (!currentProduct) return []

    try {
      isLoading.value = true
      error.value = null

      const categoryId = currentProduct.category_id
      const templateType = currentProduct.template_type
      const excludeId = currentProduct.id

      // Strategy 1: Same category + template type
      if (categoryId && templateType) {
        const response = await ProductService.getProducts({
          category: categoryId,
          template_type: templateType,
          limit: limit + 1 // Get one extra to account for filtering
        })

        if (response.success && response.data?.data) {
          const filtered = response.data.data
            .filter(product => product.id !== excludeId)
            .slice(0, limit)

          if (filtered.length >= Math.min(4, limit)) {
            return filtered
          }
        }
      }

      // Strategy 2: Same category only
      if (categoryId) {
        const response = await ProductService.getProductsByCategory(categoryId, {}, { limit: limit + 1 })

        if (response.success && response.data?.data) {
          const filtered = response.data.data
            .filter(product => product.id !== excludeId)
            .slice(0, limit)

          if (filtered.length >= Math.min(4, limit)) {
            return filtered
          }
        }
      }

      // Strategy 3: Same template type only
      if (templateType) {
        const response = await ProductService.getProductsByTemplateType(templateType, {}, { limit: limit + 1 })

        if (response.success && response.data?.data) {
          const filtered = response.data.data
            .filter(product => product.id !== excludeId)
            .slice(0, limit)

          if (filtered.length >= Math.min(4, limit)) {
            return filtered
          }
        }
      }

      // Strategy 4: Popular products as fallback
      const response = await ProductService.getPopularProducts(limit + 1)

      if (response.success && response.data) {
        const filtered = response.data
          .filter(product => product.id !== excludeId)
          .slice(0, limit)

        return filtered
      }

      return []
    } catch (err: any) {
      console.error('Error fetching recommendations:', err)
      error.value = err.message || 'Failed to load recommendations'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load recommendations for a specific product
   */
  const loadRecommendations = async (currentProduct: ProductWithCategory, limit = 8) => {
    const results = await getRecommendations(currentProduct, limit)
    recommendations.value = results
    return results
  }

  /**
   * Generate URL for "See More" based on the recommendation strategy used
   */
  const getSeeMoreUrl = (currentProduct: ProductWithCategory): string => {
    const params = new URLSearchParams()

    // If we have both category and template type, prioritize category
    if (currentProduct.category_id) {
      params.set('category', currentProduct.category_id)
    } else if (currentProduct.template_type) {
      params.set('template_type', currentProduct.template_type)
    }

    const queryString = params.toString()
    return queryString ? `/listings?${queryString}` : '/listings'
  }

  return {
    recommendations: readonly(recommendations),
    isLoading: readonly(isLoading),
    error: readonly(error),
    getRecommendations,
    loadRecommendations,
    getSeeMoreUrl
  }
}