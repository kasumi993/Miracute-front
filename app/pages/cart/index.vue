<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm mb-6">
        <NuxtLink to="/" class="text-gray-500 hover:text-brand-brown transition-colors">Home</NuxtLink>
        <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-900 font-medium">Shopping Cart</span>
      </nav>

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p class="text-gray-600">{{ cartCounter.cartCount.value }} {{ cartCounter.cartCount.value === 1 ? 'item' : 'items' }} in your cart</p>
        </div>
        <div v-if="cartCounter.cartCount.value > 0" class="text-right">
          <p class="text-sm text-gray-500">Subtotal</p>
          <p class="text-2xl font-bold text-brand-brown">${{ cartCounter.cartTotal.value.toFixed(2) }}</p>
        </div>
      </div>

      <div v-if="cartCounter.cartCount.value > 0" class="grid lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-xl font-semibold text-gray-900">Your Templates</h2>
            </div>
            
            <div class="p-6 space-y-4">
              <div v-for="item in cartCounter.cartItems.value" :key="item.id" class="group relative">
                <div class="flex items-center space-x-6 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <!-- Product Image -->
                  <div class="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img 
                      v-if="item.image" 
                      :src="item.image" 
                      :alt="item.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    >
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                      <Icon name="heroicons:photo" class="w-8 h-8" />
                    </div>
                  </div>
                  
                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{{ item.name }}</h3>
                    <div class="flex items-center space-x-3 mb-2">
                      <span v-if="item.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ item.category }}
                      </span>
                      <span class="text-sm text-gray-500">Digital Download</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <p class="text-xl font-bold text-brand-brown">${{ parseFloat(item.price).toFixed(2) }}</p>
                      <button 
                        @click="cartCounter.removeFromCart(item.id)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                        title="Remove from cart"
                      >
                        <Icon name="heroicons:trash" class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-xl font-semibold text-gray-900">Order Summary</h3>
            </div>
            
            <div class="p-6 space-y-4">
              <!-- Summary Details -->
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Items ({{ cartCounter.cartCount.value }})</span>
                  <span class="text-gray-900 font-medium">${{ cartCounter.cartTotal.value.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Instant Download</span>
                  <span class="text-green-600 font-medium">Free</span>
                </div>
                <div class="border-t pt-3">
                  <div class="flex justify-between text-lg font-semibold">
                    <span class="text-gray-900">Total</span>
                    <span class="text-brand-brown">${{ cartCounter.cartTotal.value.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Checkout Button -->
              <NuxtLink 
                to="/cart/checkout" 
                class="w-full bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-center block"
              >
                <div class="flex items-center justify-center space-x-2">
                  <Icon name="heroicons:lock-closed" class="w-5 h-5" />
                  <span>Secure Checkout</span>
                </div>
              </NuxtLink>

              <!-- Additional Actions -->
              <div class="space-y-3 pt-4 border-t border-gray-100">
                <button 
                  @click="cartCounter.clearCart()"
                  class="w-full text-red-600 hover:text-red-700 font-medium py-2 text-sm transition-colors"
                >
                  Clear Cart
                </button>
                <div class="text-center">
                  <NuxtLink to="/templates" class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm inline-flex items-center space-x-1">
                    <Icon name="heroicons:arrow-left" class="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- Trust Badges -->
              <div class="pt-4 border-t border-gray-100">
                <div class="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div class="flex items-center space-x-1">
                    <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-blue-500" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <div v-else class="text-center py-16">
        <div class="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 max-w-md mx-auto">
          <div class="w-24 h-24 bg-gradient-to-br from-brand-brown/10 to-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="heroicons:shopping-bag" class="w-12 h-12 text-brand-brown/60" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
          <p class="text-gray-600 mb-8">Discover beautiful templates and start building your dream website today!</p>
          
          <NuxtLink 
            to="/templates" 
            class="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Icon name="heroicons:sparkles" class="w-5 h-5" />
            <span>Browse Templates</span>
          </NuxtLink>
          
          <div class="mt-8 pt-6 border-t border-gray-100">
            <p class="text-sm text-gray-500 mb-4">Popular categories:</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <NuxtLink to="/templates?category=business" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">Business</NuxtLink>
              <NuxtLink to="/templates?category=portfolio" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">Portfolio</NuxtLink>
              <NuxtLink to="/templates?category=wedding" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">Wedding</NuxtLink>
            </div>
          </div>
        </div>
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