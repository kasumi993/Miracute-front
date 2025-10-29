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
              <CartItem
                v-for="item in cartCounter.cartItems.value"
                :key="item.id"
                :item="item"
                @remove="cartCounter.removeFromCart"
              />
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <CartSummary
            :item-count="cartCounter.cartCount.value"
            :total="cartCounter.cartTotal.value"
            :items="cartCounter.cartItems.value"
            @clear-cart="cartCounter.clearCart"
          />
        </div>
      </div>

      <!-- Empty Cart State -->
      <CartEmptyCart v-else />
    </div>
  </div>
</template>

<script setup>
// Composables
const cartCounter = useCartCounter()
const { fetchCoupons } = useCoupons()

// Fetch coupons on page load
onMounted(async () => {
  await fetchCoupons()
})

// SEO
useSeoMeta({
  title: 'Shopping Cart | Miracute',
  description: 'Review your selected templates before checkout',
})
</script>