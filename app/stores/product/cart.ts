import { defineStore } from 'pinia'
import type { ProductWithCategory } from '~/types/database'
import { ProductService } from '~/services'

export interface CartItem {
  id: string
  product: ProductWithCategory
  quantity: number
  selectedVariant?: string
  addedAt: string
  price: number // Price at time of adding to cart
}

interface CartState {
  items: CartItem[]
  loading: {
    add: boolean
    remove: boolean
    update: boolean
    clear: boolean
  }
  error: string | null
  lastUpdated: number | null
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
    lastUpdated: null
  }),

  getters: {
    // Basic cart info
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),

    isEmpty: (state) => state.items.length === 0,

    hasItems: (state) => state.items.length > 0,

    // Pricing calculations
    subtotal: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),

    totalQuantity: (state) => state.items.reduce((total, item) => total + item.quantity, 0),

    // Tax and shipping calculations (can be extended based on business logic)
    taxAmount: (state) => {
      const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      return subtotal * 0.08 // 8% tax rate - make configurable
    },

    shippingCost: (state) => {
      const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      return subtotal > 50 ? 0 : 10 // Free shipping over $50
    },

    total: (state) => {
      const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      const tax = subtotal * 0.08
      const shipping = subtotal > 50 ? 0 : 10
      return subtotal + tax + shipping
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

    // Categories in cart
    categoriesInCart: (state) => {
      const categories = new Set()
      state.items.forEach(item => {
        if (item.product.category) {
          categories.add(item.product.category.name)
        }
      })
      return Array.from(categories)
    },

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

    updateLastModified() {
      this.lastUpdated = Date.now()
    },

    // Add item to cart
    async addItem(product: ProductWithCategory, quantity = 1, variant?: string) {
      this.setLoading('add', true)
      this.setError(null)

      try {
        // Check if item already exists in cart
        const existingItem = this.getItemByProductAndVariant(product.id, variant)

        if (existingItem) {
          // Update quantity if item exists
          await this.updateQuantity(existingItem.id, existingItem.quantity + quantity)
        } else {
          // Add new item
          const cartItem: CartItem = {
            id: `${product.id}-${variant || 'default'}-${Date.now()}`,
            product,
            quantity,
            selectedVariant: variant,
            addedAt: new Date().toISOString(),
            price: product.price
          }

          this.items.push(cartItem)
          this.updateLastModified()
        }

        return true
      } catch (error: any) {
        console.error('Error adding item to cart:', error)
        this.setError('Failed to add item to cart')
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
          this.updateLastModified()
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

    // Remove all items for a specific product
    async removeProduct(productId: string) {
      this.setLoading('remove', true)
      this.setError(null)

      try {
        this.items = this.items.filter(item => item.product.id !== productId)
        this.updateLastModified()
        return true
      } catch (error: any) {
        console.error('Error removing product from cart:', error)
        this.setError('Failed to remove product from cart')
        return false
      } finally {
        this.setLoading('remove', false)
      }
    },

    // Update item quantity
    async updateQuantity(itemId: string, quantity: number) {
      this.setLoading('update', true)
      this.setError(null)

      try {
        if (quantity <= 0) {
          await this.removeItem(itemId)
          return true
        }

        const item = this.items.find(item => item.id === itemId)
        if (item) {
          item.quantity = quantity
          this.updateLastModified()
        }
        return true
      } catch (error: any) {
        console.error('Error updating item quantity:', error)
        this.setError('Failed to update item quantity')
        return false
      } finally {
        this.setLoading('update', false)
      }
    },

    // Clear entire cart
    async clearCart() {
      this.setLoading('clear', true)
      this.setError(null)

      try {
        this.items = []
        this.updateLastModified()
        return true
      } catch (error: any) {
        console.error('Error clearing cart:', error)
        this.setError('Failed to clear cart')
        return false
      } finally {
        this.setLoading('clear', false)
      }
    },

    // Sync cart with latest product data
    async syncCartItems() {
      if (this.items.length === 0) return

      this.setLoading('update', true)
      this.setError(null)

      try {
        const productIds = [...new Set(this.items.map(item => item.product.id))]
        const updatedProducts: ProductWithCategory[] = []

        // Fetch latest product data
        for (const productId of productIds) {
          try {
            const response = await ProductService.getProduct(productId)
            if (response.success && response.data) {
              updatedProducts.push(response.data)
            }
          } catch (error) {
            console.warn(`Failed to sync product ${productId}:`, error)
          }
        }

        // Update cart items with latest product data
        this.items = this.items.map(item => {
          const updatedProduct = updatedProducts.find(p => p.id === item.product.id)
          if (updatedProduct) {
            return {
              ...item,
              product: updatedProduct,
              // Keep original price unless product is no longer active
              price: updatedProduct.is_active ? item.price : updatedProduct.price
            }
          }
          return item
        }).filter(item => item.product.is_active) // Remove inactive products

        this.updateLastModified()
      } catch (error: any) {
        console.error('Error syncing cart items:', error)
        this.setError('Failed to sync cart items')
      } finally {
        this.setLoading('update', false)
      }
    },

    // Validate cart before checkout
    async validateCart() {
      if (this.items.length === 0) {
        this.setError('Cart is empty')
        return false
      }

      // Sync cart to ensure latest product data
      await this.syncCartItems()

      // Check if any items are out of stock or inactive
      const invalidItems = this.items.filter(item => !item.product.is_active)
      if (invalidItems.length > 0) {
        this.setError('Some items in your cart are no longer available')
        return false
      }

      return true
    },

    // Get cart summary for checkout
    getCartSummary() {
      return {
        items: this.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          variant: item.selectedVariant,
          total: item.price * item.quantity
        })),
        subtotal: this.subtotal,
        tax: this.taxAmount,
        shipping: this.shippingCost,
        total: this.total,
        itemCount: this.itemCount
      }
    },

    // Move to wishlist (if wishlist store exists)
    async moveToWishlist(itemId: string) {
      const item = this.items.find(item => item.id === itemId)
      if (!item) return false

      try {
        // Remove from cart
        await this.removeItem(itemId)

        // Note: This would require a wishlist store
        // const wishlistStore = useWishlistStore()
        // await wishlistStore.addItem(item.product)

        return true
      } catch (error: any) {
        console.error('Error moving item to wishlist:', error)
        this.setError('Failed to move item to wishlist')
        return false
      }
    },

    // Clear error
    clearError() {
      this.setError(null)
    },

    // Get suggested products based on cart contents
    async getSuggestedProducts() {
      if (this.items.length === 0) return []

      try {
        const categoryIds = [...new Set(this.items.map(item => item.product.category_id).filter(Boolean))]
        const excludeIds = this.items.map(item => item.product.id)

        if (categoryIds.length === 0) return []

        // Get related products from same categories
        const suggestions: ProductWithCategory[] = []

        for (const categoryId of categoryIds) {
          const response = await ProductService.getProducts(
            { category: categoryId },
            { limit: 6 }
          )

          if (response.success && response.data?.data) {
            const categoryProducts = response.data.data
              .filter(product => !excludeIds.includes(product.id))
              .slice(0, 3)
            suggestions.push(...categoryProducts)
          }
        }

        return suggestions.slice(0, 6) // Limit to 6 suggestions
      } catch (error) {
        console.error('Error getting suggested products:', error)
        return []
      }
    }
  },

})