<template>
  <!-- Cart Overlay -->
  <div 
    v-if="cart.isOpen.value" 
    @click="cart.closeCart()"
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
  ></div>

  <!-- Cart Drawer -->
  <div 
    :class="[
      'fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300',
      cart.isOpen.value ? 'translate-x-0' : 'translate-x-full'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <h2 class="text-lg font-medium">Shopping Cart</h2>
      <button @click="cart.closeCart()" class="text-gray-500 hover:text-gray-700">
        <Icon name="heroicons:x-mark" class="w-6 h-6" />
      </button>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Empty State -->
      <div v-if="cart.isEmpty.value" class="text-center py-8">
        <Icon name="heroicons:shopping-bag" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">Your cart is empty</p>
      </div>

      <!-- Cart Items -->
      <div v-else class="space-y-4">
        <div 
          v-for="item in cart.items.value" 
          :key="item.id"
          class="flex items-center space-x-3 p-3 border rounded-lg"
        >
          <!-- Product Image -->
          <div class="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
            <img 
              v-if="item.image"
              :src="item.image" 
              :alt="item.name"
              class="w-full h-full object-cover rounded"
            />
            <Icon v-else name="heroicons:photo" class="w-full h-full text-gray-400" />
          </div>

          <!-- Product Info -->
          <div class="flex-1">
            <h3 class="font-medium text-sm">{{ item.name }}</h3>
            <p class="text-gray-500 text-sm">${{ item.price.toFixed(2) }}</p>
            
            <!-- Quantity Controls -->
            <div class="flex items-center space-x-2 mt-1">
              <button 
                @click="cart.updateQuantity(item.id, item.quantity - 1)"
                class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
              >
                -
              </button>
              <span class="text-sm">{{ item.quantity }}</span>
              <button 
                @click="cart.updateQuantity(item.id, item.quantity + 1)"
                class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          <!-- Remove Button -->
          <button 
            @click="cart.removeItem(item.id)"
            class="text-red-500 hover:text-red-700"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Cart Footer -->
    <div v-if="!cart.isEmpty.value" class="border-t p-4 space-y-4">
      <!-- Subtotal -->
      <div class="flex justify-between text-lg font-medium">
        <span>Subtotal:</span>
        <span>${{ cart.subtotal.value.toFixed(2) }}</span>
      </div>

      <!-- Checkout Button -->
      <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
        Checkout
      </button>
      
      <!-- Continue Shopping -->
      <button 
        @click="cart.closeCart()"
        class="w-full text-gray-600 py-2 hover:text-gray-800"
      >
        Continue Shopping
      </button>
    </div>
  </div>
</template>

<script setup>
const cart = useCart()

// Close cart on escape key
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      cart.closeCart()
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>