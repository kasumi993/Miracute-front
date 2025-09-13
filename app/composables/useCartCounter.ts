// Backward compatibility wrapper for useCartStore
export const useCartCounter = () => {
  const cartStore = useCartStore()

  // Initialize cart on first use
  if (process.client) {
    cartStore.loadCart()
  }

  return {
    // State - maintain same API as before
    cartCount: computed(() => cartStore.cartCount),
    cartItems: computed(() => cartStore.cartItems),
    cartTotal: computed(() => cartStore.cartTotal),

    // Methods - maintain same API as before
    addToCart: cartStore.addToCart,
    removeFromCart: cartStore.removeFromCart,
    clearCart: cartStore.clearCart,
    isInCart: cartStore.isInCart,
    goToCart: cartStore.goToCart
  }
}
