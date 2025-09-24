<template>
  <div>
    <!-- Mobile: Sticky Action Bar -->
    <div class="lg:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 -mx-4">
      <div class="flex space-x-3">
        <button
          @click="handleAddToCart"
          :class="[
            'flex-1 px-4 py-3 rounded-lg font-medium transition-colors border text-center',
            isProductInCart
              ? 'bg-green-50 text-green-700 border-green-300'
              : 'bg-white text-gray-900 border-gray-300'
          ]"
        >
          <span v-if="isProductInCart">✓ In Cart</span>
          <span v-else>Add to Cart</span>
        </button>
        <button
          @click="handleBuyNow"
          class="flex-1 bg-brand-purple text-white px-4 py-3 rounded-lg font-medium hover:bg-brand-purple-dark transition-colors text-center"
        >
          Buy Now
        </button>
      </div>
    </div>

    <!-- Desktop: Actions -->
    <div class="hidden lg:block space-y-3">
      <!-- Buy Now Button -->
      <button
        @click="handleBuyNow"
        class="w-full bg-brand-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-purple-dark transition-colors"
      >
        Buy Now
      </button>

      <!-- Add to Cart + Wishlist -->
      <div class="flex space-x-3">
        <button
          @click="handleAddToCart"
          :class="[
            'flex-1 px-6 py-3 rounded-lg font-medium transition-colors border',
            isProductInCart
              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
              : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
          ]"
        >
          <span v-if="isProductInCart">✓ Added to Cart</span>
          <span v-else>Add to Cart</span>
        </button>
        <button
          @click="handleToggleFavorite"
          :class="[
            'px-6 py-3 border rounded-lg transition-all',
            isInWishlist
              ? 'border-red-300 bg-red-50 text-red-600 hover:border-red-400'
              : 'border-gray-300 hover:border-gray-400'
          ]"
        >
          <Icon
            :name="isInWishlist ? 'heroicons:heart-solid' : 'heroicons:heart'"
            :class="isInWishlist ? 'text-red-500' : 'text-gray-600'"
            class="w-5 h-5"
          />
        </button>
      </div>
    </div>

    <!-- Trust Badges -->
    <div class="flex items-center justify-center space-x-3 lg:space-x-6 text-xs lg:text-sm text-gray-600 py-3 lg:py-4 border-t border-gray-200 mt-4">
      <div class="flex items-center space-x-1">
        <Icon name="heroicons:shield-check" class="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
        <span class="hidden sm:inline">Secure Payment</span>
        <span class="sm:hidden">Secure</span>
      </div>
      <div class="flex items-center space-x-1">
        <Icon name="heroicons:arrow-down-tray" class="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
        <span class="hidden sm:inline">Instant Download</span>
        <span class="sm:hidden">Instant</span>
      </div>
      <div class="flex items-center space-x-1">
        <Icon name="heroicons:arrow-path" class="w-3 h-3 lg:w-4 lg:h-4 text-amber-600" />
        <span class="hidden sm:inline">30-Day Guarantee</span>
        <span class="sm:hidden">Guarantee</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: string
  name: string
  price: string
}

interface Props {
  product: Product
  isProductInCart: boolean
  isInWishlist: boolean
}

interface Emits {
  (e: 'addToCart'): void
  (e: 'buyNow'): void
  (e: 'toggleFavorite'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleAddToCart = () => {
  emit('addToCart')
}

const handleBuyNow = () => {
  emit('buyNow')
}

const handleToggleFavorite = () => {
  emit('toggleFavorite')
}
</script>