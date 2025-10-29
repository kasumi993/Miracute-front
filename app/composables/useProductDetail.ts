import type { ProductWithCategory } from '@/types/database'
import type { PurchaseVerification, OrdersResponse } from '@/types/product'

export const useProductDetail = (slug: string) => {
  const product = ref<ProductWithCategory | null>(null)
  const relatedProducts = ref<ProductWithCategory[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Purchase verification state
  const purchaseVerification = reactive<PurchaseVerification>({
    hasPurchased: false,
    isAdmin: false,
    checkingPurchase: true
  })

  // Composables
  const user = useSupabaseUser()
  const auth = useAuth()

  // Helper methods
  const getDownloadCount = () => {
    return product.value?.download_count || Math.floor(Math.random() * 500) + 100
  }

  const getReviewCount = () => {
    // This will be updated by the ReviewsList component
    return 0
  }

  // Check if user can write a review
  const canUserReview = computed(() => {
    if (!user.value || !product.value || purchaseVerification.checkingPurchase) {
      return false
    }

    // Admin can always review
    if (auth.isAdmin?.value) {
      return true
    }

    // Regular users must have purchased the product
    return purchaseVerification.hasPurchased
  })

  // Check if user has purchased this product
  const checkUserReviewEligibility = async () => {
    if (!user.value || !product.value) {
      purchaseVerification.checkingPurchase = false
      return
    }

    try {
      const response = await $fetch<OrdersResponse>('/api/orders', {
        query: { product_id: product.value.id }
      })

      // Check if any paid order contains this product
      const orders = Array.isArray(response?.data) ? response.data : []
      const hasValidPurchase = orders.some(order =>
        order.payment_status === 'paid' &&
        order.order_items?.some(item => item.product_id === product.value!.id)
      )

      purchaseVerification.hasPurchased = hasValidPurchase || false
    } catch (error) {
      console.error('Error checking purchase history:', error)
      purchaseVerification.hasPurchased = false
    } finally {
      purchaseVerification.checkingPurchase = false
    }
  }

  // Load product data
  const loadProduct = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Use the products composable
      const { fetchProductBySlug, fetchRelatedProducts } = useProducts()

      const productData = await fetchProductBySlug(slug)

      if (!productData) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Template not found'
        })
      }

      product.value = productData

      // Load related products
      if (productData.category_id) {
        try {
          await fetchRelatedProducts(
            productData.id,
            productData.category_id,
            4
          )
          // Get related products from the composable itself (which accesses the store)
          const { relatedProducts: storeRelatedProducts } = useProducts()
          relatedProducts.value = storeRelatedProducts.value
        } catch (error) {
          console.warn('Failed to load related products:', error)
        }
      }

      // Set SEO meta tags
      useSeoMeta({
        title: `${productData.name} | Miracute Templates`,
        description: productData.short_description || productData.description,
        ogTitle: productData.name,
        ogDescription: productData.short_description || productData.description,
        ogImage: productData.preview_images?.[0]
      })

    } catch (err: any) {
      console.error('Failed to load product:', err)
      error.value = err.message || 'Failed to load product'
      if (err.statusCode === 404) {
        throw err
      }
    } finally {
      isLoading.value = false
    }
  }

  // Initialize and watch for changes
  const initialize = async () => {
    await loadProduct()
    await checkUserReviewEligibility()
  }

  // Watch for user authentication changes
  watch(user, async (newUser) => {
    if (newUser) {
      await checkUserReviewEligibility()
    } else {
      // Reset state when user logs out
      purchaseVerification.hasPurchased = false
      purchaseVerification.checkingPurchase = false
    }
  })

  return {
    // State
    product,
    relatedProducts,
    isLoading,
    error,
    purchaseVerification,

    // Computed
    canUserReview,

    // Methods
    getDownloadCount,
    getReviewCount,
    initialize,
    loadProduct,
    checkUserReviewEligibility
  }
}
