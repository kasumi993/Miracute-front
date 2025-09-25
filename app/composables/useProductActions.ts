import type { ProductWithCategory } from '@/types/database'

export const useProductActions = (product: Ref<ProductWithCategory | null>) => {
  // Composables
  const cartCounter = useCartCounter()
  const wishlist = useWishlist()
  const toast = useToast()

  // Computed
  const isProductInCart = computed(() => {
    return product.value ? cartCounter.isInCart(product.value.id) : false
  })

  const isInWishlist = computed(() => {
    return product.value ? wishlist.isInWishlist(product.value.id) : false
  })

  // Methods
  const addToCart = () => {
    if (!product.value) {return}
    cartCounter.addToCart(product.value)
  }

  const buyNow = () => {
    if (!product.value) {return}
    // Add to cart first
    cartCounter.addToCart(product.value)
    // Navigate directly to checkout
    navigateTo('/cart/checkout')
  }

  const toggleFavorite = () => {
    if (!product.value) {return}

    const success = wishlist.toggleWishlist(product.value)

    if (success) {
      if (wishlist.isInWishlist(product.value.id)) {
        toast.success('Added to wishlist')
      } else {
        toast.success('Removed from wishlist')
      }
    }
  }

  return {
    // Computed
    isProductInCart,
    isInWishlist,

    // Methods
    addToCart,
    buyNow,
    toggleFavorite
  }
}
