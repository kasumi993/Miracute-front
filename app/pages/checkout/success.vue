<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="container-custom py-16 text-center">
      <div class="max-w-md mx-auto">
        <div class="loading-spinner mx-auto mb-4"></div>
        <h2 class="text-xl font-heading font-medium text-gray-900 mb-2">Processing your order...</h2>
        <p class="text-gray-600">Please wait while we confirm your payment.</p>
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="orderData" class="container-custom py-16">
      <div class="max-w-2xl mx-auto text-center">
        <!-- Success Icon -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <NuxtIcon name="heroicons:check" class="w-12 h-12 text-green-600" />
        </div>

        <!-- Success Message -->
        <h1 class="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-4">
          Order Complete!
        </h1>
        
        <p class="text-xl text-gray-600 mb-2">
          Thank you for your purchase, {{ orderData.customer_name || 'valued customer' }}!
        </p>
        
        <p class="text-gray-600 mb-8">
          Your order <span class="font-mono font-medium">#{{ orderData.order_number }}</span> has been confirmed.
        </p>

        <!-- Order Summary -->
        <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-8 text-left">
          <h2 class="text-lg font-heading font-medium text-gray-900 mb-6">Order Summary</h2>
          
          <!-- Order Items -->
          <div class="space-y-4 mb-6">
            <div v-for="item in orderItems" :key="item.id" 
                 class="flex items-center space-x-4">
              <!-- Product Image -->
              <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <NuxtImg 
                  v-if="item.product?.preview_images?.[0]"
                  :src="item.product.preview_images[0]"
                  :alt="item.product_name"
                  class="w-full h-full object-cover"
                />
                <Icon v-else name="heroicons:document" class="w-6 h-6 text-gray-400 m-3" />
              </div>

              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900">{{ item.product_name }}</h3>
                <p class="text-sm text-gray-600">
                  Quantity: {{ item.quantity }} × ${{ parseFloat(item.unit_price).toFixed(2) }}
                </p>
              </div>

              <!-- Download Button -->
              <div v-if="item.download_url" class="flex-shrink-0">
                <a :href="item.download_url"
                   target="_blank"
                   class="btn-primary text-sm px-4 py-2">
                  <NuxtIcon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
                  Download
                </a>
              </div>
            </div>
          </div>

          <!-- Order Total -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex justify-between items-center text-lg font-medium">
              <span>Total Paid</span>
              <span>${{ parseFloat(orderData.total_amount).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink v-if="auth.isAuthenticated.value" 
                    to="/account/downloads" 
                    class="btn-primary">
            <NuxtIcon name="heroicons:arrow-down-tray" class="w-5 h-5 mr-2" />
            View My Downloads
          </NuxtLink>
          
          <NuxtLink to="/templates" class="btn-secondary">
            <NuxtIcon name="heroicons:shopping-bag" class="w-5 h-5 mr-2" />
            Continue Shopping
          </NuxtLink>
        </div>

        <!-- Important Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8 text-left">
          <h3 class="font-medium text-blue-900 mb-3 flex items-center">
            <NuxtIcon name="heroicons:information-circle" class="w-5 h-5 mr-2" />
            Important Information
          </h3>
          <ul class="text-sm text-blue-800 space-y-2">
            <li>• Your files are available for immediate download</li>
            <li>• Downloads will expire in 30 days from purchase date</li>
            <li>• You have 5 download attempts per item</li>
            <li>• A confirmation email has been sent to {{ orderData.customer_email }}</li>
            <li v-if="!auth.isAuthenticated.value">• Create an account to manage your downloads easily</li>
          </ul>
        </div>

        <!-- Create Account CTA (for guests) -->
        <div v-if="!auth.isAuthenticated.value" 
             class="bg-gradient-to-r from-brand-pink to-brand-sage rounded-2xl p-8 mt-8 text-white">
          <h3 class="text-xl font-heading font-medium mb-3">Create Your Account</h3>
          <p class="mb-6">Create a free account to easily access all your downloads and manage your orders.</p>
          <NuxtLink :to="`/auth/register?email=${encodeURIComponent(orderData.customer_email)}`"
                    class="btn-primary bg-white text-gray-900 hover:bg-gray-100">
            Create Free Account
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="container-custom py-16 text-center">
      <div class="max-w-md mx-auto">
        <NuxtIcon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 class="text-2xl font-heading font-medium text-gray-900 mb-4">
          Order Not Found
        </h2>
        <p class="text-gray-600 mb-8">
          We couldn't find your order. This might be because:
        </p>
        <ul class="text-left text-sm text-gray-600 mb-8 space-y-1">
          <li>• The payment is still processing</li>
          <li>• The session ID is invalid or expired</li>
          <li>• There was an issue with the payment</li>
        </ul>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/contact" class="btn-primary">
            Contact Support
          </NuxtLink>
          <NuxtLink to="/templates" class="btn-secondary">
            Continue Shopping
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Order Complete | Miracute',
  description: 'Your order has been successfully processed. Download your templates now.',
  robots: 'noindex, nofollow'
})

// Composables
const route = useRoute()
const auth = useAuth()

// State
const isLoading = ref(true)
const orderData = ref(null)
const orderItems = ref([])

// Get session ID from URL
const sessionId = route.query.session_id

// Methods
const loadOrderData = async () => {
  if (!sessionId) {
    isLoading.value = false
    return
  }

  try {
    // Fetch order data from our API
    const { data } = await $fetch(`/api/orders/checkout-session/${sessionId}`)
    
    if (data) {
      orderData.value = data.order
      orderItems.value = data.items || []
    }

  } catch (error) {
    console.error('Failed to load order data:', error)
  } finally {
    isLoading.value = false
  }
}

// Initialize
onMounted(async () => {
  await loadOrderData()

  // Clear cart after successful order
  if (orderData.value) {
    const cart = useCart()
    await cart.clearCart()
  }
})

// Prevent going back to this page after leaving
onBeforeRouteLeave(() => {
  // Clear the session ID from history to prevent refresh issues
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>