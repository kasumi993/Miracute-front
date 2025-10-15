<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8 sm:py-16">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl sm:text-5xl font-heading font-medium text-gray-900 mb-6">
            My Wishlist
          </h1>
          <p class="text-xl text-gray-600 mb-4">
            Save your favorite templates for later and never lose track of the designs you love.
          </p>
          <ClientOnly>
            <div class="flex items-center justify-center space-x-2 text-brand-brown">
              <Icon name="heroicons:heart" class="w-5 h-5" />
              <span class="font-medium">{{ wishlist.wishlistCount.value }} item{{ wishlist.wishlistCount.value !== 1 ? 's' : '' }} in your wishlist</span>
            </div>
            <template #fallback>
              <div class="flex items-center justify-center space-x-2 text-brand-brown">
                <Icon name="heroicons:heart" class="w-5 h-5" />
                <span class="font-medium">Loading wishlist...</span>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- Wishlist Content -->
    <div class="container-custom py-8 sm:py-16">
      <ClientOnly>
        <!-- Empty State -->
        <div v-if="wishlist.wishlistCount.value === 0" class="text-center py-16">
          <div class="max-w-md mx-auto">
            <Icon name="heroicons:heart" class="w-24 h-24 mx-auto text-gray-300 mb-8" />
            <h2 class="text-2xl font-heading font-medium text-gray-900 mb-4">
              Your wishlist is empty
            </h2>
            <p class="text-gray-600 mb-8">
              Start browsing our beautiful templates and add your favorites to your wishlist by clicking the heart icon.
            </p>
            <NuxtLink to="/" class="btn-primary inline-flex items-center space-x-2">
              <Icon name="heroicons:heart" class="w-4 h-4" />
              <span>Start Shopping</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Wishlist Items -->
        <div v-else>
        <!-- Actions Bar -->
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-heading font-medium text-gray-900">
            {{ wishlist.wishlistCount.value }} item{{ wishlist.wishlistCount.value !== 1 ? 's' : '' }}
          </h2>
          <button 
            @click="handleClearWishlist"
            class="text-gray-500 hover:text-red-600 transition-colors"
          >
            <Icon name="heroicons:trash" class="w-5 h-5 mr-2 inline" />
            Clear All
          </button>
        </div>

        <!-- Items Grid -->
        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-8">
          <div
            v-for="item in wishlist.wishlistItems.value"
            :key="item.id"
            class="group"
          >
            <NuxtLink
              :to="`/listings/${item.slug}`"
              class="block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <!-- Product Image -->
              <div class="relative aspect-[4/3] bg-gray-100">
                <NuxtImg
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="heroicons:photo" class="w-12 h-12 text-gray-300" />
                </div>
                
                <!-- Remove from Wishlist Button -->
                <button
                  @click.prevent="handleRemoveFromWishlist(item.id)"
                  class="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-all shadow-sm z-10"
                  title="Remove from wishlist"
                >
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>
              </div>

              <!-- Product Info -->
              <div class="p-3 sm:p-6">
                <h3 class="text-sm sm:text-lg font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-sage transition-colors">
                  {{ item.name }}
                </h3>
                
                <p v-if="item.category" class="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4 hidden sm:block">
                  {{ item.category }}
                </p>
                
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <span class="text-lg sm:text-xl font-semibold text-gray-900">
                    ${{ parseFloat(item.price).toFixed(2) }}
                  </span>
                  
                  <!-- Add to Cart Button -->
                  <button
                    @click.prevent="handleAddToCart(item)"
                    :disabled="addingToCart.has(item.id)"
                    class="btn-primary px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:scale-105 transition-transform w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div v-if="addingToCart.has(item.id)" class="flex items-center justify-center space-x-1">
                      <Icon name="heroicons:arrow-path" class="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span class="hidden sm:inline">Adding...</span>
                    </div>
                    <div v-else>
                      <span class="sm:hidden">+</span>
                      <span class="hidden sm:inline">Add to Cart</span>
                    </div>
                  </button>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

          <!-- Continue Shopping -->
          <div class="text-center mt-16">
            <NuxtLink to="/" class="btn-outline inline-flex items-center space-x-2">
              <Icon name="heroicons:arrow-left" class="w-4 h-4" />
              <span>Continue Shopping</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Fallback for server-side rendering -->
        <template #fallback>
          <div class="text-center py-16">
            <div class="max-w-md mx-auto">
              <Icon name="heroicons:heart" class="w-24 h-24 mx-auto text-gray-300 mb-8" />
              <h2 class="text-2xl font-heading font-medium text-gray-900 mb-4">
                Loading your wishlist...
              </h2>
              <div class="animate-pulse bg-gray-200 h-4 w-32 mx-auto rounded"></div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
import { getProduct } from '@/services/ProductService'

// Composables
const wishlist = useWishlist()
const cartCounter = useCartCounter()
const toast = useToast()

// Loading states
const addingToCart = ref(new Set())

// SEO - Use static title to avoid hydration issues
useSeoMeta({
  title: 'My Wishlist - Miracute',
  description: 'Your saved favorite templates and designs. Never lose track of the templates you love.',
  ogTitle: 'My Wishlist - Miracute',
  ogDescription: 'Your saved favorite templates and designs.',
})

// Methods
const handleRemoveFromWishlist = (productId) => {
  const success = wishlist.removeFromWishlist(productId)
  if (success) {
    toast.show('Item removed from wishlist', 'success')
  }
}

const handleClearWishlist = () => {
  if (confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
    wishlist.clearWishlist()
    toast.show('Wishlist cleared', 'success')
  }
}

const handleAddToCart = async (item) => {
  // Prevent duplicate requests
  if (addingToCart.value.has(item.id)) return

  addingToCart.value.add(item.id)

  try {
    // Fetch full product data using ProductService
    const response = await getProduct(item.id)

    if (!response.success || !response.data) {
      toast.error('Product not found')
      return
    }

    // Add full product to cart
    cartCounter.addToCart(response.data)
    toast.success('Added to cart')
  } catch (error) {
    console.error('Error adding to cart from wishlist:', error)
    toast.error('Failed to add item to cart')
  } finally {
    addingToCart.value.delete(item.id)
  }
}
</script>