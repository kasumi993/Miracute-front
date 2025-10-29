import { defineStore } from 'pinia'
import type { ProductWithCategory } from '@/types/database'
import type { CartItem } from '@/types/commerce/cart'
import { useCartPersistence } from '@/composables/useCartPersistence'
import { useCartCalculations } from '@/composables/useCartCalculations'

interface CartState {
  items: CartItem[]
  loading: {
    add: boolean
    remove: boolean
    update: boolean
    clear: boolean
  }
  error: string | null
  isInitialized: boolean
  hasAuthWatcher: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loading: {
      add: false,
      remove: false,
      update: false,
      clear: false
    },
    error: null,
    isInitialized: false,
    hasAuthWatcher: false
  }),

  getters: {
    // Basic cart info
    itemCount: (state) => state.items.length,

    isEmpty: (state) => state.items.length === 0,

    hasItems: (state) => state.items.length > 0,

    // Pricing calculations using composable
    subtotal: (state) => {
      const { calculateSubtotal } = useCartCalculations()
      return calculateSubtotal(state.items)
    },

    totalQuantity: (state) => state.items.length,

    taxAmount: (state) => {
      const { calculateTax, calculateSubtotal } = useCartCalculations()
      return calculateTax(calculateSubtotal(state.items))
    },


    total: (state) => {
      const { calculateTotal } = useCartCalculations()
      return calculateTotal(state.items).total
    },

    // Item finders
    getItemById: (state) => (productId: string) =>
      state.items.find(item => item.product.id === productId),

    getItemByProductAndVariant: (state) => (productId: string, variant?: string) =>
      state.items.find(item =>
        item.product.id === productId &&
        item.selectedVariant === variant
      ),

    // Check if product is in cart
    isInCart: (state) => (productId: string) =>
      state.items.some(item => item.product.id === productId),

    // Loading states
    isLoading: (state) => Object.values(state.loading).some(loading => loading),


    // Products that could be suggested based on cart
    cartProductIds: (state) => state.items.map(item => item.product.id)
  },

  actions: {
    // Set loading state
    setLoading(type: keyof CartState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    setError(error: string | null) {
      this.error = error
    },


    // Toggle item in cart (add if not present, remove if present)
    async addItem(product: ProductWithCategory, variant?: string, bundleMetadata?: import('@/types/commerce/cart').BundleMetadata) {
      this.setLoading('add', true)
      this.setError(null)

      try {
        // Check if item already exists in cart
        const existingItem = this.getItemByProductAndVariant(product.id, variant)

        if (existingItem) {
          // Remove item if it already exists (digital items are purchased once)
          await this.removeItem(existingItem.id)
        } else {
          // Add new item
          const cartItem: CartItem = {
            id: `${product.id}-${variant || 'default'}-${Date.now()}`,
            product,
            selectedVariant: variant,
            addedAt: new Date().toISOString(),
            price: bundleMetadata?.discountedPrice ?? (typeof product.price === 'string' ? parseFloat(product.price) : product.price),
            bundleMetadata
          }

          this.items.push(cartItem)

          // Persist cart changes
          await this.persistCart()
        }

        return true
      } catch (error: any) {
        console.error('Error toggling item in cart:', error)
        this.setError('Failed to toggle item in cart')
        return false
      } finally {
        this.setLoading('add', false)
      }
    },

    // Remove item from cart
    async removeItem(itemId: string) {
      this.setLoading('remove', true)
      this.setError(null)

      try {
        const index = this.items.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.items.splice(index, 1)

          // Persist cart changes
          await this.persistCart()
        }
        return true
      } catch (error: any) {
        console.error('Error removing item from cart:', error)
        this.setError('Failed to remove item from cart')
        return false
      } finally {
        this.setLoading('remove', false)
      }
    },



    // Clear entire cart
    async clearCart() {
      this.setLoading('clear', true)
      this.setError(null)

      try {
        this.items = []

        // Persist cart changes
        await this.persistCart()

        return true
      } catch (error: any) {
        console.error('Error clearing cart:', error)
        this.setError('Failed to clear cart')
        return false
      } finally {
        this.setLoading('clear', false)
      }
    },







    // Cart persistence using composable
    async persistCart() {
      const { syncCart } = useCartPersistence()
      await syncCart(this.items)
    },

    async initializeCart() {
      if (this.isInitialized) return

      const { initializeCart } = useCartPersistence()
      const result = await initializeCart()
      this.items = result.items
      this.isInitialized = true
    },

    initializeAuthWatcher() {
      if (import.meta.client && !this.hasAuthWatcher) {
        const auth = useAuth()
        let wasAuthenticated = auth.isAuthenticated.value

        watch(auth.isAuthenticated, async (isAuthenticated) => {
          if (isAuthenticated && !wasAuthenticated) {
            console.log('User logged in, initiating cart migration')
            await this.migrateGuestCartToUser()
          }
          wasAuthenticated = isAuthenticated
        })

        this.hasAuthWatcher = true
      }
    },

    async migrateGuestCartToUser() {
      const guestCartItems = [...this.items]

      if (guestCartItems.length > 0) {
        console.log('Migrating guest cart to user account:', guestCartItems.length, 'items')

        const { loadFromDatabase, saveToDatabase, clearLocalStorage } = useCartPersistence()
        const dbResult = await loadFromDatabase()

        if (dbResult.success) {
          this.items = dbResult.items
        }

        for (const guestItem of guestCartItems) {
          const existingItem = this.getItemByProductAndVariant(
            guestItem.product.id,
            guestItem.selectedVariant
          )

          if (!existingItem) {
            this.items.push(guestItem)
          }
        }

        await saveToDatabase(this.items)
        clearLocalStorage()
        console.log('Guest cart migration completed')
      }
    }
  }

})
