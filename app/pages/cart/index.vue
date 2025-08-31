<template>
  <div class="min-h-screen bg-neutral-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p class="text-gray-600">Review your items before checkout</p>
      </div>

      <!-- Cart Summary -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Your Items</h2>
        
        <div v-if="cartCounter.cartCount.value > 0" class="space-y-4">
          <!-- Cart Items List -->
          <div class="space-y-3">
            <div v-for="item in cartCounter.cartItems.value" :key="item.id" class="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
              <!-- Product Image -->
              <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  v-if="item.image" 
                  :src="item.image" 
                  :alt="item.name"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <Icon name="heroicons:photo" class="w-6 h-6" />
                </div>
              </div>
              
              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 truncate">{{ item.name }}</h3>
                <p v-if="item.category" class="text-sm text-gray-500">{{ item.category }}</p>
                <p class="text-sm font-medium text-brand-brown">${{ parseFloat(item.price).toFixed(2) }}</p>
              </div>
              
              <!-- Remove Button -->
              <button 
                @click="cartCounter.removeFromCart(item.id)"
                class="text-red-500 hover:text-red-700 p-1"
                title="Remove from cart"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Items in cart:</span>
              <span>{{ cartCounter.cartCount.value }}</span>
            </div>
            <div class="flex items-center justify-between font-semibold text-lg">
              <span>Total:</span>
              <span class="text-brand-brown">${{ cartCounter.cartTotal.value.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-4">
            <button 
              @click="cartCounter.clearCart()"
              class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Cart
            </button>
            <NuxtLink to="/cart/checkout" class="flex-1 bg-brand-brown text-white px-6 py-3 rounded-lg hover:bg-brand-brown/90 transition-colors text-center block">
              Proceed to Checkout
            </NuxtLink>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <Icon name="heroicons:shopping-bag" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p class="text-gray-600 mb-6">Add some templates to get started</p>
          <NuxtLink to="/templates" class="btn-primary">
            Browse Templates
          </NuxtLink>
        </div>
      </div>

      <!-- Back to Templates -->
      <div class="text-center">
        <NuxtLink to="/templates" class="text-brand-brown hover:text-brand-brown/80 font-medium">
          ← Continue Shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Composables
const cartCounter = useCartCounter()

// SEO
useSeoMeta({
  title: 'Shopping Cart | Miracute',
  description: 'Review your selected templates before checkout',
})
</script>