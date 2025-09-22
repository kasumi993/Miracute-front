// Backward compatibility wrapper for useCartStore
import { useCartStore } from '~/stores/product/cart'

export const useCartCounter = () => {
  const cartStore = useCartStore()

  return {
    // State - maintain same API as before
    cartCount: computed(() => cartStore.itemCount),
    cartItems: computed(() => cartStore.items),
    cartTotal: computed(() => cartStore.total),

    // Methods - maintain same API as before
    addToCart: cartStore.addToCart,
    removeFromCart: cartStore.removeFromCart,
    clearCart: cartStore.clearCart,
    isInCart: (productId: string) => !!cartStore.getItemById(productId),
    goToCart: () => navigateTo('/cart')
  }
}
