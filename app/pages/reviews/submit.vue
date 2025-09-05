<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-16">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl sm:text-5xl font-heading font-medium text-gray-900 mb-6">
            Share Your Experience
          </h1>
          <p class="text-xl text-gray-600 mb-4">
            Help other customers by sharing your thoughts about your Miracute templates.
          </p>
          <div class="flex items-center justify-center space-x-2 text-brand-brown">
            <Icon name="heroicons:star" class="w-5 h-5" />
            <span class="font-medium">Your review makes a difference!</span>
          </div>
        </div>
      </div>
    </section>

    <div class="container-custom py-16">
      <!-- Product Info -->
      <div v-if="product" class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div class="flex items-start space-x-6">
            <!-- Product Image -->
            <div class="flex-shrink-0">
              <div class="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  v-if="product.preview_images?.[0]"
                  :src="product.preview_images[0]" 
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="heroicons:photo" class="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>
            
            <!-- Product Details -->
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ product.name }}</h2>
              <p v-if="product.short_description" class="text-gray-600 mb-4">{{ product.short_description }}</p>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span v-if="product.category?.name" class="bg-gray-100 px-2 py-1 rounded">
                  {{ product.category.name }}
                </span>
                <span v-if="product.template_type" class="bg-brand-sage/10 text-brand-sage px-2 py-1 rounded">
                  {{ product.template_type }}
                </span>
              </div>
            </div>
            
            <!-- Price -->
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">
                ${{ parseFloat(product.price).toFixed(2) }}
              </div>
              <div v-if="order" class="text-sm text-gray-500 mt-1">
                Purchased {{ formatDate(order.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Review Form -->
        <div class="max-w-2xl mx-auto">
          <ReviewForm
            :product-id="productId"
            :user-id="userId"
            @success="handleReviewSuccess"
            @cancel="handleCancel"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div class="animate-pulse flex space-x-6">
            <div class="w-24 h-24 bg-gray-200 rounded-lg"></div>
            <div class="flex-1 space-y-4 py-1">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="max-w-2xl mx-auto text-center">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Unable to Load Product</h2>
          <p class="text-gray-600 mb-6">
            We couldn't find the product you're trying to review. This might be because:
          </p>
          <ul class="text-left text-gray-600 space-y-2 mb-6">
            <li>• The review link has expired</li>
            <li>• The product is no longer available</li>
            <li>• There was an error with the link</li>
          </ul>
          <NuxtLink to="/" class="btn-primary">
            Back to Templates
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import the ReviewForm component explicitly
import ReviewForm from '~/components/Reviews/ReviewForm.vue'

// SEO
useSeoMeta({
  title: 'Submit Review - Miracute',
  description: 'Share your experience with Miracute templates',
})

// Composables  
const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const product = ref(null)
const order = ref(null)
const userId = ref(null)
const isLoading = ref(true)

// Get query parameters
const productId = route.query.product as string
const orderId = route.query.order as string
const token = route.query.token as string

// Methods
const loadProductAndOrder = async () => {
  if (!productId) {
    isLoading.value = false
    return
  }
  
  try {
    // Load product details
    const productResponse = await $fetch(`/api/products/${productId}`)
    if (productResponse.success) {
      product.value = productResponse.product
    }
    
    // If we have order info, load order details and verify token
    if (orderId && token) {
      try {
        const orderResponse = await $fetch(`/api/orders/${orderId}/verify-review-token`, {
          method: 'POST',
          body: { token, product_id: productId }
        })
        
        if (orderResponse.success) {
          order.value = orderResponse.order
          userId.value = orderResponse.order.user_id
        }
      } catch (error) {
        console.warn('Could not verify review token, proceeding without order context')
      }
    }
    
  } catch (error) {
    console.error('Error loading product:', error)
  } finally {
    isLoading.value = false
  }
}

const handleReviewSuccess = (review: any) => {
  toast.success('Thank you for your review! 🌟')
  
  // Redirect to product page
  setTimeout(() => {
    router.push(`/templates/${product.value.slug}`)
  }, 2000)
}

const handleCancel = () => {
  if (product.value?.slug) {
    router.push(`/templates/${product.value.slug}`)
  } else {
    router.push('/')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Load data on mount
onMounted(() => {
  loadProductAndOrder()
})
</script>