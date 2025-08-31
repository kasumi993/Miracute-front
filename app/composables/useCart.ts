export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string | null
}

export interface Product {
  id: string
  name: string
  price: string
  preview_images?: string[]
}

export const useCart = () => {
  // Reactive state
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)
  
  // Computed values
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })
  
  const subtotal = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })
  
  const isEmpty = computed(() => items.value.length === 0)
  
  const addItem = (product: Product) => {
    const existingIndex = items.value.findIndex(item => item.id === product.id)
    
    if (existingIndex >= 0) {
      items.value[existingIndex].quantity += 1
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        image: product.preview_images?.[0] || null
      })
    }
  }
  
  const removeItem = (productId: string) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index >= 0) {
      items.value.splice(index, 1)
    }
  }
  
  const updateQuantity = (productId: string, quantity: number) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index >= 0) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        items.value[index].quantity = quantity
      }
    }
  }
  
  const openCart = () => {
    isOpen.value = true
  }
  
  const closeCart = () => {
    isOpen.value = false
  }
  
  const toggleCart = () => {
    isOpen.value = !isOpen.value
  }
  
  const clearCart = () => {
    items.value = []
  }
  
  return {
    // State
    items: readonly(items),
    isOpen: readonly(isOpen),
    
    // Computed
    itemCount,
    subtotal,
    isEmpty,
    
    // Methods
    addItem,
    removeItem,
    updateQuantity,
    openCart,
    closeCart,
    toggleCart,
    clearCart
  }
}