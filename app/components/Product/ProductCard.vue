<template>
  <div class="group">
    <NuxtLink :to="`/templates/${product.slug}`" class="block">
      <!-- Large Image Card - Etsy Style -->
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
        <div class="flex items-center space-x-1 sm:space-x-2">
          <div class="flex items-center">
            <Icon name="heroicons:star-20-solid" class="w-2.5 h-2.5 sm:w-4 sm:h-4 text-yellow-400" />
            <Icon name="heroicons:star-20-solid" class="w-2.5 h-2.5 sm:w-4 sm:h-4 text-yellow-400" />
            <Icon name="heroicons:star-20-solid" class="w-2.5 h-2.5 sm:w-4 sm:h-4 text-yellow-400" />
            <Icon name="heroicons:star-20-solid" class="w-2.5 h-2.5 sm:w-4 sm:h-4 text-yellow-400" />
            <Icon name="heroicons:star-20-solid" class="w-2.5 h-2.5 sm:w-4 sm:h-4 text-yellow-400" />
          </div>
          <span class="text-[10px] sm:text-xs text-gray-600">({{ getReviewCount(product) }})</span>
        </div>

        <!-- Price -->
        <div class="flex items-center space-x-1 sm:space-x-2 flex-wrap">
          <span class="text-sm sm:text-lg font-bold text-gray-900">
            ${{ price.toFixed(2) }}
          </span>
          <span v-if="comparePrice" class="text-[10px] sm:text-sm text-gray-500 line-through">
            ${{ comparePrice.toFixed(2) }}
          </span>
          <span v-if="hasDiscount" class="text-[9px] sm:text-xs text-green-600 font-medium">
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
interface Product {
  id: string
  name: string
  slug: string
  price: string
  compare_at_price?: string
  preview_images?: string[]
  category?: {
    id: string
    name: string
    slug: string
  }
  software_required?: string[]
  is_featured?: boolean
}

interface Props {
  product: Product
}

const props = defineProps<Props>()

// Composables
const cartStore = useCartStore()
const wishlist = useWishlist()
const toast = useToast()

// Computed
const price = computed(() => parseFloat(props.product.price))
const comparePrice = computed(() => 
  props.product.compare_at_price ? parseFloat(props.product.compare_at_price) : null
)

const hasDiscount = computed(() => 
  comparePrice.value && comparePrice.value > price.value
)

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(((comparePrice.value! - price.value) / comparePrice.value!) * 100)
})

const isProductInCart = computed(() => {
  return cartStore.isInCart(props.product.id)
})

// Wishlist state
const isInWishlist = computed(() => wishlist.isInWishlist(props.product.id))

// Cart methods
const quickAddToCart = () => {
  cartStore.addToCart(props.product)
}

const toggleWishlist = () => {
  const success = wishlist.toggleWishlist(props.product)
  
  if (success) {
    if (wishlist.isInWishlist(props.product.id)) {
      toast.show('Added to wishlist', 'success')
    } else {
      toast.show('Removed from wishlist', 'success')
    }
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

const getReviewCount = (product: any) => {
  // Mock review count based on product ID for consistent display
  const hash = product.id.split('').reduce((a: number, b: string) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return Math.abs(hash % 500) + 50 // Between 50-549 reviews
}

</script>