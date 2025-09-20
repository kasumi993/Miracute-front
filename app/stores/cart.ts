import { defineStore } from 'pinia'

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image?: string
  category?: string
  quantity: number
  addedAt: Date
  downloadUrl?: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    isOpen: false
  }),

  getters: {
    cartCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    cartItems: (state) => state.items,
    cartTotal: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    totalPrice: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    totalOriginalPrice: (state) => state.items.reduce((total, item) => {
      const originalPrice = item.originalPrice || item.price
      return total + (originalPrice * item.quantity)
    }, 0),
    totalSavings: (state) => {
      const originalTotal = state.items.reduce((total, item) => {
        const originalPrice = item.originalPrice || item.price
        return total + (originalPrice * item.quantity)
      }, 0)
      const currentTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      return originalTotal - currentTotal
    },
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    addToCart(product: any) {
      const existingItem = this.items.find(item => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: parseFloat(product.price),
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
          image: product.preview_images?.[0] || product.image || null,
          category: product.category?.name || product.category || null,
          quantity: 1,
          addedAt: new Date(),
          downloadUrl: product.downloadUrl
        })
      }

      this.persistCart()
    },

    removeFromCart(productId: string) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.persistCart()
      }
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
          this.persistCart()
        }
      }
    },

    clearCart() {
      this.items = []
      this.persistCart()
    },

    openCart() {
      this.isOpen = true
    },

    closeCart() {
      this.isOpen = false
    },

    toggleCart() {
      this.isOpen = !this.isOpen
    },

    goToCart() {
      return navigateTo('/cart')
    },

    isInCart(productId: string): boolean {
      return this.items.some(item => item.id === productId)
    },

    getQuantity(productId: string): number {
      const item = this.items.find(item => item.id === productId)
      return item ? item.quantity : 0
    },

    persistCart() {
      if (typeof window !== 'undefined') {
        try {
          // Save to both new and old localStorage keys for compatibility
          localStorage.setItem('miracute-cart', JSON.stringify(this.items))

          // Maintain compatibility with old format (simplified items for useCartCounter)
          const compatItems = this.items.map(item => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            price: item.price.toString(),
            image: item.image,
            category: item.category
          }))
          localStorage.setItem('miracute-cart-items', JSON.stringify(compatItems))
        } catch (error) {
          console.warn('Failed to persist cart to localStorage:', error)
        }
      }
    },

    loadCart() {
      if (typeof window !== 'undefined') {
        try {
          // Try to load from new format first
          const newCart = localStorage.getItem('miracute-cart')
          if (newCart) {
            const items = JSON.parse(newCart)
            this.items = items.map((item: any) => ({
              ...item,
              addedAt: new Date(item.addedAt)
            }))
            return
          }

          // Fallback to old format for migration
          const oldCart = localStorage.getItem('miracute-cart-items')
          if (oldCart) {
            const items = JSON.parse(oldCart)
            this.items = items.map((item: any) => ({
              id: item.id,
              name: item.name,
              slug: item.slug,
              price: parseFloat(item.price),
              image: item.image,
              category: item.category,
              quantity: 1, // Default quantity for migrated items
              addedAt: new Date()
            }))
            this.persistCart() // Save in new format
          }
        } catch (error) {
          console.warn('Failed to load cart from localStorage:', error)
        }
      }
    },

    // New method for checkout process
    createOrder(orderData: {
      customerEmail: string
      customerName: string
      paymentIntentId?: string
    }) {
      return {
        id: `order_${Date.now()}`,
        items: [...this.items],
        total: this.totalPrice,
        savings: this.totalSavings,
        customer: orderData,
        createdAt: new Date()
      }
    }
  }
})

