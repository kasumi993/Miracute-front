// Cart composable that handles SSR-safe cart state
import { useCartStore } from '~/stores/product/cart'

export const useCartCounter = () => {
  const cartStore = useCartStore()

  // Initialize cart from storage on first use
  if (import.meta.client && !cartStore.lastUpdated) {
    cartStore.initializeCart()
    cartStore.initializeAuthWatcher()
  }

  return {
    // State - computed for reactivity
    cartCount: computed(() => cartStore.itemCount),
    cartItems: computed(() => cartStore.items),
    cartTotal: computed(() => cartStore.total),

    // Methods - map store methods
    addToCart: cartStore.addItem, // Now works as toggle for digital items
    toggleCart: cartStore.toggleItem, // Explicit toggle method
    removeFromCart: cartStore.removeItem,
    clearCart: cartStore.clearCart,
    isInCart: (productId: string) => cartStore.isInCart(productId),
    goToCart: () => navigateTo('/cart')
  }
}