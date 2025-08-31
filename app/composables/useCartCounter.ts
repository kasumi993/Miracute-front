// Cart system with product storage
const globalCartItems = ref([])

export const useCartCounter = () => {
  // Initialize from localStorage on client side
  if (process.client && globalCartItems.value.length === 0) {
    const saved = localStorage.getItem('miracute-cart-items')
    if (saved) {
      try {
        globalCartItems.value = JSON.parse(saved) || []
      } catch (e) {
        globalCartItems.value = []
      }
    }
  }
  
  // Computed cart count and total
  const cartCount = computed(() => globalCartItems.value.length)
  const cartTotal = computed(() => {
    return globalCartItems.value.reduce((total, item) => {
      return total + parseFloat(item.price)
    }, 0)
  })

  // Methods
  const addToCart = (product) => {
    // Check if product already exists in cart
    const existingIndex = globalCartItems.value.findIndex(item => item.id === product.id)
    
    if (existingIndex === -1) {
      // Add new product to cart
      globalCartItems.value.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.preview_images?.[0] || null,
        category: product.category?.name || null
      })
    }
    
    // Save to localStorage
    if (process.client) {
      localStorage.setItem('miracute-cart-items', JSON.stringify(globalCartItems.value))
    }
  }

  const removeFromCart = (productId) => {
    const index = globalCartItems.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      globalCartItems.value.splice(index, 1)
      
      // Save to localStorage
      if (process.client) {
        localStorage.setItem('miracute-cart-items', JSON.stringify(globalCartItems.value))
      }
    }
  }

  const clearCart = () => {
    globalCartItems.value = []
    
    // Clear from localStorage
    if (process.client) {
      localStorage.setItem('miracute-cart-items', '[]')
    }
  }

  const isInCart = (productId) => {
    return globalCartItems.value.some(item => item.id === productId)
  }

  const goToCart = () => {
    // Navigate to cart page
    return navigateTo('/cart')
  }

  return {
    // State
    cartCount: readonly(cartCount),
    cartItems: readonly(globalCartItems),
    cartTotal: readonly(cartTotal),
    
    // Methods
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    goToCart
  }
}