<template>
  <div class="group">
    <NuxtLink :to="`/listings/${product.slug}`" class="block">
      <!-- Large Image Card -->
      <div class="aspect-[4/5] bg-white rounded-2xl overflow-hidden mb-3 group-hover:shadow-xl transition-all duration-300 relative border border-gray-100">
        <img 
          v-if="product.preview_images?.[0]"
          :src="product.preview_images[0]" 
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        >
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
          <Icon name="heroicons:photo" class="w-20 h-20" />
        </div>
        
        <!-- Software Type Badge -->
        <div class="absolute top-3 left-3">
          <span v-if="product.software_required?.length" class="bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur">
            {{ product.software_required[0] }}
          </span>
        </div>
        
        <!-- Favorite Button -->
        <button @click.prevent="toggleWishlist" class="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 shadow-lg">
          <Icon :name="isInWishlist ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                :class="isInWishlist ? 'text-red-500' : 'text-gray-600'"
                class="w-5 h-5 hover:text-red-500 transition-colors" />
        </button>

        <!-- Quick Add to Cart Button -->
        <button 
          @click.prevent="quickAddToCart"
          class="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div :class="[
            'backdrop-blur text-white rounded-lg px-3 py-2 text-center font-medium text-sm transition-colors',
            isProductInCart ? 'bg-green-600/95 hover:bg-green-600' : 'bg-brand-brown/95 hover:bg-brand-brown'
          ]">
            <span v-if="isProductInCart">✓ In Cart</span>
            <span v-else>Add to Cart</span>
          </div>
        </button>
      </div>
      
      <!-- Product Info - Etsy Style -->
      <div class="space-y-1 sm:space-y-2 px-0.5 sm:px-1">
        <!-- Title -->
        <h3 class="text-xs sm:text-base font-medium text-gray-900 line-clamp-2 group-hover:text-brand-sage transition-colors leading-tight">
          {{ product.name }}
        </h3>
        
        <!-- Seller Info - Hidden on mobile for compactness -->
        <div class="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-brand-sage to-brand-pink flex items-center justify-center">
            <span class="text-[8px] text-white font-medium">M</span>
          </div>
          <span>Miracute</span>
        </div>
        
        <!-- Rating - Compact on mobile -->
        <div v-if="product.review_count && product.review_count > 0" class="flex items-center space-x-1 sm:space-x-2">
          <div class="flex items-center">
            <Icon
              v-for="star in 5"
              :key="star"
              name="heroicons:star-20-solid"
              :class="star <= Math.round(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
              class="w-2.5 h-2.5 sm:w-4 sm:h-4"
            />
          </div>
          <span class="text-[10px] sm:text-xs text-gray-600">
            {{ product.average_rating?.toFixed(1) }} ({{ product.review_count }})
          </span>
        </div>
        <div v-else class="flex items-center space-x-1 sm:space-x-2">
          <div class="flex items-center">
            <Icon
              v-for="star in 5"
              :key="star"
              name="heroicons:star-20-solid"
              class="w-2.5 h-2.5 sm:w-4 sm:h-4 text-gray-300"
            />
          </div>
          <span class="text-[10px] sm:text-xs text-gray-600">No reviews yet</span>
        </div>

        <!-- Price -->
        <div class="flex items-center space-x-2 flex-wrap">
          <span :class="[
            'text-sm sm:text-lg font-bold',
            hasDiscount ? 'text-green-600' : 'text-gray-900'
          ]">
            ${{ price.toFixed(2) }}
          </span>
          <span v-if="comparePrice" class="text-xs sm:text-sm text-gray-500 line-through">
            ${{ comparePrice.toFixed(2) }}
          </span>
          <span v-if="hasDiscount" class="text-xs font-medium text-green-600">
            {{ discountPercentage }}% OFF
          </span>
        </div>

        <!-- Category Tag - Hidden on mobile -->
        <div v-if="product.category?.name" class="pt-1 hidden sm:block">
          <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {{ product.category.name }}
          </span>
        </div>

      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '@/types/database'

type Product = ProductWithCategory & {
  price: string
  compare_at_price?: string | null
  preview_images?: string[] | null
  software_required?: string[] | null
  is_featured?: boolean
  review_count?: number
  average_rating?: number
}

interface Props {
  product: Product
}

const props = defineProps<Props>()

// Composables
const cartCounter = useCartCounter()
const wishlist = useWishlist()
const toast = useToast()
const { getBestCoupon, calculateDiscount } = useCoupons()

// Computed
const basePrice = computed(() => parseFloat(props.product.price))
const originalComparePrice = computed(() =>
  props.product.compare_at_price ? parseFloat(props.product.compare_at_price) : null
)

// Get best coupon available
const bestCoupon = computed(() => getBestCoupon())

// Calculate discount amount
const discountAmount = computed(() => {
  if (!bestCoupon.value) return 0
  return calculateDiscount(basePrice.value, bestCoupon.value)
})

// Final price after discount
const price = computed(() => {
  if (discountAmount.value > 0) {
    return basePrice.value - discountAmount.value
  }
  return basePrice.value
})

// Compare price logic
const comparePrice = computed(() => {
  if (discountAmount.value > 0) {
    return basePrice.value // Show original price when discounted
  }
  return originalComparePrice.value // Show compare_at_price if set
})

// Check if product has any discount
const hasDiscount = computed(() => {
  return discountAmount.value > 0 || (originalComparePrice.value && originalComparePrice.value > basePrice.value)
})

// Discount percentage for display
const discountPercentage = computed(() => {
  if (discountAmount.value > 0 && bestCoupon.value) {
    if (bestCoupon.value.discount_type === 'percentage') {
      return bestCoupon.value.discount_value
    } else {
      return Math.round((discountAmount.value / basePrice.value) * 100)
    }
  }

  if (originalComparePrice.value && originalComparePrice.value > basePrice.value) {
    return Math.round(((originalComparePrice.value - basePrice.value) / originalComparePrice.value) * 100)
  }

  return 0
})

const isProductInCart = computed(() => cartCounter.isInCart(props.product.id))

// Wishlist state
const isInWishlist = computed(() => wishlist.isInWishlist(props.product.id))

// Cart methods
const quickAddToCart = () => {
  cartCounter.addToCart(props.product)
}

const toggleWishlist = () => {
  const success = wishlist.toggleWishlist(props.product)
  
  if (success) {
    const method = wishlist.isInWishlist(props.product.id) ? 'success' : 'success'
    toast[method]((wishlist.isInWishlist(props.product.id) ? 'Added to' : 'Removed from') + ' wishlist')
  }
}

const formatViews = (views: number) => {
  if (views >= 1000000) {
    return Math.floor(views / 100000) / 10 + 'M'
  } else if (views >= 1000) {
    return Math.floor(views / 100) / 10 + 'K'
  }
  return views.toString()
}

// No longer needed - using real review data from API

</script>