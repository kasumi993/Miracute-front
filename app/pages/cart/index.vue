<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p class="text-gray-600">Review your items before checkout</p>
        </div>
      </div>
    </section>

    <div class="container-custom py-12">
      <!-- Empty Cart -->
      <div v-if="cart.isEmpty.value" class="text-center py-16">
        <NuxtIcon name="heroicons:shopping-bag" class="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 class="text-2xl font-heading font-medium text-gray-900 mb-4">Your cart is empty</h2>
        <p class="text-gray-600 mb-8">Discover our beautiful templates and start creating something amazing.</p>
        <NuxtLink to="/templates" class="btn-primary">
          Browse Templates
        </NuxtLink>
      </div>

      <!-- Cart with Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-heading font-medium text-gray-900 mb-6">
              Cart Items ({{ cart.itemCount.value }})
            </h2>

            <div class="space-y-6">
              <div v-for="item in cart.items.value" 
                   :key="item.id"
                   class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                
                <!-- Product Image -->
                <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <NuxtImg 
                    :src="item.product.preview_images?.[0] || '/images/placeholder-product.jpg'"
                    :alt="item.product.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-lg text-gray-900 mb-1">
                    <NuxtLink :to="`/templates/${item.product.slug}`" 
                              class="hover:text-brand-brown transition-colors">
                      {{ item.product.name }}
                    </NuxtLink>
                  </h3>
                  
                  <p class="text-sm text-gray-600 mb-2 line-clamp-2">
                    {{ item.product.short_description }}
                  </p>

                  <!-- Product Meta -->
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <div v-if="item.product.category" class="flex items-center space-x-1">
                      <NuxtIcon name="heroicons:tag" class="w-3 h-3" />
                      <span>{{ item.product.category.name }}</span>
                    </div>
                    <div v-if="item.product.file_formats?.length" class="flex items-center space-x-1">
                      <NuxtIcon name="heroicons:document" class="w-3 h-3" />
                      <span>{{ item.product.file_formats.join(', ') }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <NuxtIcon name="heroicons:arrow-down-tray" class="w-3 h-3" />
                      <span>Instant Download</span>
                    </div>
                  </div>
                </div>

                <!-- Quantity and Price -->
                <div class="text-right space-y-3">
                  <!-- Price -->
                  <div class="space-y-1">
                    <p class="text-xl font-bold text-gray-900">
                      ${{ parseFloat(item.product.price).toFixed(2) }}
                    </p>
                    <p v-if="item.product.compare_at_price" 
                       class="text-sm text-gray-500 line-through">
                      ${{ parseFloat(item.product.compare_at_price).toFixed(2) }}
                    </p>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex items-center space-x-2">
                    <button @click="cart.updateQuantity(item.product.id, item.quantity - 1)"
                            :disabled="item.quantity <= 1 || cart.isLoading.value"
                            class="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm">
                      <NuxtIcon name="heroicons:minus" class="w-3 h-3" />
                    </button>
                    
                    <span class="text-sm font-medium w-8 text-center">{{ item.quantity }}</span>
                    
                    <button @click="cart.updateQuantity(item.product.id, item.quantity + 1)"
                            :disabled="cart.isLoading.value"
                            class="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm">
                      <NuxtIcon name="heroicons:plus" class="w-3 h-3" />
                    </button>
                  </div>

                  <!-- Remove Button -->
                  <button @click="cart.removeItem(item.product.id)"
                          :disabled="cart.isLoading.value"
                          class="text-red-600 hover:text-red-700 text-sm disabled:opacity-50">
                    <NuxtIcon name="heroicons:trash" class="w-4 h-4 inline mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Continue Shopping -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <NuxtLink to="/templates" 
                        class="text-brand-brown hover:text-brand-brown/80 font-medium flex items-center space-x-2">
                <NuxtIcon name="heroicons:arrow-left" class="w-4 h-4" />
                <span>Continue Shopping</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 class="text-xl font-heading font-medium text-gray-900 mb-6">
              Order Summary
            </h2>

            <!-- Summary Lines -->
            <div class="space-y-4 mb-6">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal ({{ cart.itemCount.value }} items)</span>
                <span class="font-medium">${{ cart.subtotal.value.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Tax</span>
                <span class="font-medium">$0.00</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Discount</span>
                <span class="font-medium text-green-600">-$0.00</span>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-medium text-gray-900">Total</span>
                  <span class="text-2xl font-bold text-gray-900">${{ cart.total.value.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Checkout Button -->
            <button @click="proceedToCheckout"
                    :disabled="payments.isLoading.value"
                    class="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="!payments.isLoading.value">
                Proceed to Checkout
              </span>
              <span v-else class="flex items-center justify-center space-x-2">
                <NuxtIcon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </span>
            </button>

            <!-- Security Badges -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
                  <span>SSL Secure</span>
                </div>
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="heroicons:arrow-down-tray" class="w-4 h-4 text-blue-500" />
                  <span>Instant Access</span>
                </div>
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="heroicons:credit-card" class="w-4 h-4 text-purple-500" />
                  <span>Secure Payment</span>
                </div>
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="heroicons:arrow-path" class="w-4 h-4 text-yellow-500" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </div>

            <!-- Accepted Payment Methods -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-xs text-gray-600 mb-3">We accept:</p>
              <div class="flex space-x-2">
                <div class="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <span class="text-xs font-bold">VISA</span>
                </div>
                <div class="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <span class="text-xs font-bold">MC</span>
                </div>
                <div class="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <span class="text-xs font-bold">AMEX</span>
                </div>
                <div class="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <NuxtIcon name="heroicons:device-phone-mobile" class="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Shopping Cart | Miracute',
  description: 'Review your selected website templates before checkout. Secure payment and instant download.',
  robots: 'noindex, nofollow'
})

// Composables
const cart = useCart()
const payments = usePayments()
const { isAuthenticated } = useAuth()

// Methods
const proceedToCheckout = async () => {
  if (cart.isEmpty.value) return

  try {
    // Prepare cart items for checkout
    const checkoutItems = cart.items.value.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: parseFloat(item.product.price)
    }))

    // Process checkout using Stripe Checkout (hosted)
    await payments.processCartCheckout(checkoutItems)

  } catch (error) {
    console.error('Checkout failed:', error)
    useToast().error('Failed to proceed to checkout. Please try again.')
  }
}

// Initialize on mount
onMounted(() => {
  // Ensure cart is loaded
  if (cart.items.value.length === 0) {
    cart.loadCart()
  }
})
</script>