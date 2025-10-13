import { CartService } from '@/services'
import type { CartItem } from '@/types/commerce/cart'

export const useCartPersistence = () => {
  /**
   * Save cart items to localStorage for guest users
   */
  const saveToLocalStorage = (items: CartItem[]) => {
    if (import.meta.client) {
      try {
        const cartData = {
          items
        }
        localStorage.setItem('miracute_cart', JSON.stringify(cartData))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }

  /**
   * Load cart items from localStorage for guest users
   */
  const loadFromLocalStorage = (): { items: CartItem[] } => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('miracute_cart')
        if (saved) {
          const cartData = JSON.parse(saved)
          return {
            items: cartData.items || []
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('miracute_cart')
      }
    }
    return { items: [] }
  }

  /**
   * Clear cart from localStorage
   */
  const clearLocalStorage = () => {
    if (import.meta.client) {
      try {
        localStorage.removeItem('miracute_cart')
      } catch (error) {
        console.error('Error clearing cart from localStorage:', error)
      }
    }
  }

  /**
   * Save cart items to database for authenticated users
   */
  const saveToDatabase = async (items: CartItem[]) => {
    try {
      const itemsToSave = items.map(item => ({
        productId: item.product.id
      }))
      await CartService.saveCart(itemsToSave)
      console.log('Cart saved to database successfully')
      return true
    } catch (error) {
      console.error('Error saving cart to database:', error)
      return false
    }
  }

  /**
   * Load cart items from database for authenticated users
   */
  const loadFromDatabase = async (): Promise<{ success: boolean, items: CartItem[] }> => {
    try {
      const response = await CartService.loadCart()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load cart from database')
      }

      console.log('Cart loaded from database successfully:', response.data?.length || 0, 'items')
      return { success: true, items: response.data || [] }
    } catch (error) {
      console.error('Error loading cart from database:', error)
      return { success: false, items: [] }
    }
  }

  /**
   * Smart persistence: save to appropriate storage based on auth state
   */
  const syncCart = async (items: CartItem[]) => {
    const auth = useAuth()

    if (auth.isAuthenticated.value) {
      // Save to database for authenticated users
      await saveToDatabase(items)
    } else {
      // Save to localStorage for guest users
      saveToLocalStorage(items)
    }
  }

  /**
   * Initialize cart: load from appropriate storage based on auth state
   */
  const initializeCart = async (): Promise<{ items: CartItem[] }> => {
    const auth = useAuth()

    if (auth.isAuthenticated.value) {
      // Try to load from database first
      const dbResult = await loadFromDatabase()
      if (dbResult.success) {
        return { items: dbResult.items }
      }
      // Fallback to localStorage if database load fails
      return loadFromLocalStorage()
    } else {
      // Load from localStorage for guest users
      return loadFromLocalStorage()
    }
  }

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    saveToDatabase,
    loadFromDatabase,
    syncCart,
    initializeCart
  }
}