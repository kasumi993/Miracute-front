<template>
  <div class="card-product group">
    <NuxtLink :to="`/templates/${product.slug}`">
      <!-- Product Image -->
      <div class="relative aspect-[4/3] overflow-hidden">
        <NuxtImg 
          :src="product.preview_images?.[0] || '/images/placeholder-product.jpg'"
          :alt="product.name"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        <!-- Overlay on Hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="absolute bottom-4 left-4 right-4">
            <button class="btn-primary w-full text-sm">
              View Template
            </button>
          </div>
        </div>

        <!-- Badges -->
        <div class="absolute top-4 left-4 flex flex-col space-y-2">
          <span v-if="product.is_featured"
                class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Featured
          </span>
          
          <span v-if="product.category"
                class="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {{ product.category.name }}
          </span>
        </div>

        <!-- Discount Badge -->
        <div v-if="hasDiscount" class="absolute top-4 right-4">
          <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{{ discountPercentage }}%
          </span>
        </div>

        <!-- Quick Actions -->
        <div class="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             :class="{ 'right-16': hasDiscount }">
          <button @click.prevent="toggleWishlist"
                  class="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Icon :name="isInWishlist ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                  :class="isInWishlist ? 'text-red-500' : 'text-gray-600'"
                  class="w-4 h-4" />
          </button>
          
          <button @click.prevent="quickAddToCart"
                  :disabled="cart.isLoading.value"
                  class="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50">
            <Icon v-if="!cart.isLoading.value" name="heroicons:shopping-bag" class="w-4 h-4 text-gray-600" />
            <Icon v-else name="heroicons:arrow-path" class="w-4 h-4 text-gray-600 animate-spin" />
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-6">
        <!-- Product Name -->
        <h3 class="font-heading font-medium text-lg text-gray-900 mb-2 group-hover:text-brand-brown transition-colors line-clamp-2">
          {{ product.name }}
        </h3>

        <!-- Short Description -->
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">
          {{ product.short_description || product.description }}
        </p>

        <!-- Product Meta -->
        <div class="flex items-center space-x-3 mb-4 text-xs text-gray-500">
          <div v-if="product.difficulty_level" class="flex items-center space-x-1">
            <Icon name="heroicons:academic-cap" class="w-3 h-3" />
            <span>{{ product.difficulty_level }}</span>
          </div>
          
          <div v-if="product.file_formats?.length" class="flex items-center space-x-1">
            <Icon name="heroicons:document" class="w-3 h-3" />
            <span>{{ product.file_formats.join(', ') }}</span>
          </div>
          
          <div v-if="product.view_count > 0" class="flex items-center space-x-1">
            <Icon name="heroicons:eye" class="w-3 h-3" />
            <span>{{ formatViews(product.view_count) }}</span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="product.tags?.length" class="flex flex-wrap gap-1 mb-4">
          <span v-for="tag in product.tags.slice(0, 3)" 
                :key="tag"
                class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            {{ tag }}
          </span>
          <span v-if="product.tags.length > 3" 
                class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            +{{ product.tags.length - 3 }}
          </span>
        </div>

        <!-- Pricing and Actions -->
        <div class="flex items-center justify-between">
          <!-- Price -->
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-gray-900">
              ${{ price.toFixed(2) }}
            </span>
            <span v-if="comparePrice" 
                  class="text-lg text-gray-500 line-through">
              ${{ comparePrice.toFixed(2) }}
            </span>
          </div>

          <!-- Add to Cart Button -->
          <button @click.prevent="addToCart"
                  :disabled="cart.isLoading.value"
                  class="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="!cart.isLoading.value">Add to Cart</span>
            <span v-else class="flex items-center space-x-1">
              <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <span>Adding...</span>
            </span>
          </button>
        </div>

        <!-- Download Info -->
        <div class="flex items-center justify-center space-x-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:arrow-down-tray" class="w-3 h-3" />
            <span>Instant Download</span>
          </div>
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:device-phone-mobile" class="w-3 h-3" />
            <span>Mobile Ready</span>
          </div>
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:heart" class="w-3 h-3" />
            <span>Easy Setup</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
interface Props {
  product: any // Replace with proper Product type
}

const props = defineProps<Props>()

// Composables
const cart = useCart()

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

// Wishlist state (placeholder - implement with your wishlist system)
const isInWishlist = ref(false)

// Methods
const addToCart = async () => {
  try {
    await cart.addItem(props.product)
    cart.openDrawer()
  } catch (error) {
    console.error('Failed to add to cart:', error)
  }
}

const quickAddToCart = async () => {
  try {
    await cart.addItem(props.product)
    // Show success toast but don't open drawer for quick add
  } catch (error) {
    console.error('Failed to add to cart:', error)
  }
}

const toggleWishlist = () => {
  // Implement wishlist toggle
  isInWishlist.value = !isInWishlist.value
  
  // Here you would call your wishlist API
  if (isInWishlist.value) {
    // Add to wishlist
    useToast().success('Added to wishlist')
  } else {
    // Remove from wishlist
    useToast().success('Removed from wishlist')
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

// Initialize wishlist status
onMounted(() => {
  // Check if product is in user's wishlist
  // This would be implemented with your wishlist system
})
</script>