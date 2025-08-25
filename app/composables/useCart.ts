import type { Database } from '~/types/database'

type Product = Database['public']['Tables']['products']['Row']
type CartItem = {
  id: string
  product: Product
  quantity: number
  total: number
}

export const useCart = () => {
  const supabase = useSupabaseClient<Database>()
  const { user, isAuthenticated } = useAuth()

  // State
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isDrawerOpen = ref(false)

  // Computed
  const itemCount = computed(() => 
    items.value.reduce((count, item) => count + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((total, item) => total + item.total, 0)
  )

  const total = computed(() => subtotal.value) // Add tax/fees later if needed

  const isEmpty = computed(() => items.value.length === 0)

  // Load cart from database (authenticated users) or localStorage (guests)
  const loadCart = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (isAuthenticated.value && user.value) {
        await loadAuthenticatedCart()
      } else {
        loadGuestCart()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load cart'
      console.error('Error loading cart:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Load cart for authenticated users
  const loadAuthenticatedCart = async () => {
    if (!user.value) return

    const { data: cartItems, error: fetchError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product:products(*)
      `)
      .eq('user_id', user.value.id)

    if (fetchError) throw fetchError

    items.value = cartItems?.map(item => ({
      id: item.id,
      product: item.product as Product,
      quantity: item.quantity,
      total: parseFloat(item.product.price) * item.quantity
    })) || []
  }

  // Load cart for guest users from localStorage
  const loadGuestCart = () => {
    if (process.client) {
      const savedCart = localStorage.getItem('miracute_cart')
      if (savedCart) {
        try {
          items.value = JSON.parse(savedCart)
        } catch {
          // Invalid cart data, start fresh
          items.value = []
        }
      }
    }
  }

  // Save cart to localStorage for guests
  const saveGuestCart = () => {
    if (process.client && !isAuthenticated.value) {
      localStorage.setItem('miracute_cart', JSON.stringify(items.value))
    }
  }

  // Add item to cart
  const addItem = async (product: Product, quantity: number = 1) => {
    isLoading.value = true
    error.value = null

    try {
      const existingItemIndex = items.value.findIndex(item => item.product.id === product.id)

      if (existingItemIndex > -1) {
        // Update existing item
        const newQuantity = items.value[existingItemIndex].quantity + quantity
        await updateQuantity(product.id, newQuantity)
      } else {
        // Add new item
        const newItem: CartItem = {
          id: crypto.randomUUID(), // Temporary ID for guest users
          product,
          quantity,
          total: parseFloat(product.price) * quantity
        }

        if (isAuthenticated.value && user.value) {
          // Save to database
          const { data, error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.value.id,
              product_id: product.id,
              quantity
            })
            .select('id')
            .single()

          if (insertError) throw insertError
          newItem.id = data.id
        }

        items.value.push(newItem)
        saveGuestCart()
      }

      // Show success toast
      useToast().success(`${product.name} added to cart`)
    } catch (err: any) {
      error.value = err.message || 'Failed to add item to cart'
      useToast().error('Failed to add item to cart')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const itemIndex = items.value.findIndex(item => item.product.id === productId)
      if (itemIndex === -1) return

      const item = items.value[itemIndex]

      if (isAuthenticated.value && user.value) {
        // Update in database
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', item.id)

        if (updateError) throw updateError
      }

      // Update local state
      items.value[itemIndex] = {
        ...item,
        quantity,
        total: parseFloat(item.product.price) * quantity
      }

      saveGuestCart()
    } catch (err: any) {
      error.value = err.message || 'Failed to update quantity'
      useToast().error('Failed to update quantity')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Remove item from cart
  const removeItem = async (productId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const item = items.value.find(item => item.product.id === productId)
      if (!item) return

      if (isAuthenticated.value && user.value) {
        // Remove from database
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', item.id)

        if (deleteError) throw deleteError
      }

      // Remove from local state
      items.value = items.value.filter(item => item.product.id !== productId)
      saveGuestCart()

      useToast().success('Item removed from cart')
    } catch (err: any) {
      error.value = err.message || 'Failed to remove item'
      useToast().error('Failed to remove item')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (isAuthenticated.value && user.value) {
        // Clear from database
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.value.id)

        if (deleteError) throw deleteError
      }

      // Clear local state
      items.value = []
      saveGuestCart()

      useToast().success('Cart cleared')
    } catch (err: any) {
      error.value = err.message || 'Failed to clear cart'
      useToast().error('Failed to clear cart')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Merge guest cart with user cart on login
  const mergeGuestCart = async () => {
    if (!isAuthenticated.value || !user.value) return

    const guestCart = process.client ? localStorage.getItem('miracute_cart') : null
    if (!guestCart) return

    try {
      const guestItems: CartItem[] = JSON.parse(guestCart)
      
      for (const guestItem of guestItems) {
        // Check if item already exists in user's cart
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.value.id)
          .eq('product_id', guestItem.product.id)
          .single()

        if (existingItem) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({ 
              quantity: existingItem.quantity + guestItem.quantity 
            })
            .eq('id', existingItem.id)
        } else {
          // Insert new item
          await supabase
            .from('cart_items')
            .insert({
              user_id: user.value.id,
              product_id: guestItem.product.id,
              quantity: guestItem.quantity
            })
        }
      }

      // Clear guest cart
      localStorage.removeItem('miracute_cart')
      
      // Reload cart
      await loadCart()
    } catch (err) {
      console.error('Error merging guest cart:', err)
    }
  }

  // Toggle cart drawer
  const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  const openDrawer = () => {
    isDrawerOpen.value = true
  }

  const closeDrawer = () => {
    isDrawerOpen.value = false
  }

  // Get item by product ID
  const getItem = (productId: string) => {
    return items.value.find(item => item.product.id === productId)
  }

  // Check if product is in cart
  const hasItem = (productId: string) => {
    return items.value.some(item => item.product.id === productId)
  }

  // Initialize cart
  const init = async () => {
    await loadCart()
    
    // Watch for auth state changes
    watch(() => user.value, async (newUser, oldUser) => {
      if (newUser && !oldUser) {
        // User just logged in - merge guest cart
        await mergeGuestCart()
      } else if (!newUser && oldUser) {
        // User logged out - clear cart
        items.value = []
      }
    })
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    items: readonly(items),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isDrawerOpen,

    // Computed
    itemCount,
    subtotal,
    total,
    isEmpty,

    // Methods
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadCart,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    getItem,
    hasItem,
    init,
    clearError
  }
}