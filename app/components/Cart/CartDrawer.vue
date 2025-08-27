<template>
  <!-- Cart Drawer Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-show="cart.isDrawerOpen.value" 
         @click="cart.closeDrawer()"
         class="fixed inset-0 bg-black/50 z-50">
    </div>
  </Transition>

  <!-- Cart Drawer -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-in-out"
    enter-from-class="transform translate-x-full"
    enter-to-class="transform translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in-out"
    leave-from-class="transform translate-x-0"
    leave-to-class="transform translate-x-full"
  >
    <div v-show="cart.isDrawerOpen.value" 
         class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-heading font-medium">Shopping Cart</h2>
        <button @click="cart.closeDrawer()" 
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <NuxtIcon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="cart.isEmpty.value" class="text-center py-16">
          <NuxtIcon name="heroicons:shopping-bag" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500 mb-4">Your cart is empty</p>
          <button @click="cart.closeDrawer()" class="btn-primary">
            Continue Shopping
          </button>
        </div>

        <div v-else class="space-y-4">
          <div v-for="item in cart.items.value" 
               :key="item.id"
               class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            
            <!-- Product Image -->
            <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <NuxtImg 
                :src="item.product.preview_images?.[0] || '/images/placeholder-product.jpg'"
                :alt="item.product.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <!-- Product Details -->
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-sm text-gray-900 truncate">
                {{ item.product.name }}
              </h3>
              <p class="text-sm text-gray-500">
                ${{ parseFloat(item.product.price).toFixed(2) }}
              </p>
              
              <!-- Quantity Controls -->
              <div class="flex items-center space-x-2 mt-2">
                <button @click="cart.updateQuantity(item.product.id, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                        class="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm">
                  <NuxtIcon name="heroicons:minus" class="w-3 h-3" />
                </button>
                <span class="text-sm font-medium">{{ item.quantity }}</span>
                <button @click="cart.updateQuantity(item.product.id, item.quantity + 1)"
                        class="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm">
                  <NuxtIcon name="heroicons:plus" class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Remove Button -->
            <button @click="cart.removeItem(item.product.id)"
                    class="text-red-500 hover:text-red-700 p-1">
              <NuxtIcon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!cart.isEmpty.value" class="border-t border-gray-200 p-4 space-y-4">
        <!-- Subtotal -->
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-900">Subtotal</span>
          <span class="font-bold text-xl">${{ cart.subtotal.value.toFixed(2) }}</span>
        </div>

        <!-- Checkout Button -->
        <div class="space-y-3">
          <NuxtLink to="/cart/checkout" 
                    @click="cart.closeDrawer()"
                    class="btn-primary w-full text-center block">
            Checkout
          </NuxtLink>
          <NuxtLink to="/cart" 
                    @click="cart.closeDrawer()"
                    class="btn-secondary w-full text-center block">
            View Cart
          </NuxtLink>
        </div>

        <!-- Trust Badges -->
        <div class="flex justify-center space-x-4 text-xs text-gray-500 pt-2">
          <div class="flex items-center space-x-1">
            <NuxtIcon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
            <span>Secure</span>
          </div>
          <div class="flex items-center space-x-1">
            <NuxtIcon name="heroicons:arrow-down-tray" class="w-4 h-4 text-blue-500" />
            <span>Instant</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
// Get cart instance
const cart = useCart()

// Handle escape key to close drawer
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && cart.isDrawerOpen.value) {
      cart.closeDrawer()
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>