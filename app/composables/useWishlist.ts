// Wishlist system with product storage
const globalWishlistItems = ref([])

export const useWishlist = () => {
  // Initialize from localStorage on client side
  if (process.client && globalWishlistItems.value.length === 0) {
    const saved = localStorage.getItem('miracute-wishlist-items')
    if (saved) {
      try {
        globalWishlistItems.value = JSON.parse(saved) || []
      } catch (e) {
        globalWishlistItems.value = []
      }
    }
  }

  // Computed wishlist count
  const wishlistCount = computed(() => globalWishlistItems.value.length)

  // Methods
  const addToWishlist = (product) => {
    // Check if product already exists in wishlist
    const existingIndex = globalWishlistItems.value.findIndex(item => item.id === product.id)

    if (existingIndex === -1) {
      // Add new product to wishlist
      globalWishlistItems.value.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.preview_images?.[0] || null,
        category: product.category?.name || null,
        dateAdded: new Date().toISOString()
      })

      // Save to localStorage
      if (process.client) {
        localStorage.setItem('miracute-wishlist-items', JSON.stringify(globalWishlistItems.value))
      }

      return true // Successfully added
    }

    return false // Already exists
  }

  const removeFromWishlist = (productId) => {
    const index = globalWishlistItems.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      globalWishlistItems.value.splice(index, 1)

      // Save to localStorage
      if (process.client) {
        localStorage.setItem('miracute-wishlist-items', JSON.stringify(globalWishlistItems.value))
      }

      return true // Successfully removed
    }

    return false // Not found
  }

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      return removeFromWishlist(product.id)
    } else {
      return addToWishlist(product)
    }
  }

  const clearWishlist = () => {
    globalWishlistItems.value = []

    // Clear from localStorage
    if (process.client) {
      localStorage.setItem('miracute-wishlist-items', '[]')
    }
  }

  const isInWishlist = (productId) => {
    return globalWishlistItems.value.some(item => item.id === productId)
  }

  const goToWishlist = () => {
    // Navigate to wishlist page
    return navigateTo('/wishlist')
  }

  return {
    // State
    wishlistCount: readonly(wishlistCount),
    wishlistItems: readonly(globalWishlistItems),

    // Methods
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    goToWishlist
  }
}
