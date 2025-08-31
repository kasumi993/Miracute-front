<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="aspect-[4/3] bg-gray-200 rounded-lg"></div>
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Not Found -->
    <div v-else-if="!product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 class="text-2xl font-medium text-gray-900 mb-2">Template not found</h1>
      <p class="text-gray-600 mb-6">This template may have been removed or doesn't exist.</p>
      <NuxtLink to="/templates" class="text-brand-brown hover:text-brand-brown/80 font-medium">
        ← Back to templates
      </NuxtLink>
    </div>

    <!-- Product Details -->
    <div v-else>
      <!-- Breadcrumb -->
      <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav class="flex items-center space-x-2 text-sm">
            <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">Home</NuxtLink>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
            <NuxtLink to="/templates" class="text-gray-500 hover:text-gray-700">Templates</NuxtLink>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
            <span class="text-gray-900">{{ product.name }}</span>
          </nav>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <!-- Product Images -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <img 
                v-if="selectedImage"
                :src="selectedImage" 
                :alt="product.name"
                class="w-full h-full object-cover"
              >
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="heroicons:photo" class="w-16 h-16 text-gray-400" />
              </div>
            </div>

            <!-- Thumbnail Gallery -->
            <div v-if="product.preview_images?.length > 1" class="grid grid-cols-4 gap-2">
              <button 
                v-for="(image, index) in product.preview_images.slice(0, 4)" 
                :key="index"
                @click="selectedImage = image"
                :class="[
                  'aspect-square rounded overflow-hidden border-2 transition-colors',
                  selectedImage === image ? 'border-brand-brown' : 'border-transparent hover:border-gray-300'
                ]"
              >
                <img :src="image" :alt="`Preview ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Category and Software -->
            <div class="flex items-center space-x-3">
              <span v-if="product.category?.name" class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {{ product.category.name }}
              </span>
              <span v-if="product.software_required?.length" class="text-xs text-white bg-brand-brown px-2 py-1 rounded">
                {{ product.software_required[0] }}
              </span>
              <span v-if="product.is_featured" class="text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
                Featured
              </span>
            </div>

            <!-- Product Name -->
            <div>
              <h1 class="text-3xl font-medium text-gray-900 mb-2">{{ product.name }}</h1>
              <p v-if="product.short_description" class="text-lg text-gray-600">
                {{ product.short_description }}
              </p>
            </div>

            <!-- Rating and Downloads -->
            <div class="flex items-center space-x-6">
              <div class="flex items-center space-x-2">
                <div class="flex items-center">
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                </div>
                <span class="text-sm text-gray-600">({{ getReviewCount() }} reviews)</span>
              </div>
              <div class="text-sm text-gray-600">
                {{ getDownloadCount() }} downloads
              </div>
            </div>

            <!-- Price -->
            <div class="flex items-center space-x-3">
              <span class="text-3xl font-semibold text-gray-900">
                ${{ parseFloat(product.price).toFixed(2) }}
              </span>
              <span v-if="product.compare_at_price" class="text-xl text-gray-500 line-through">
                ${{ parseFloat(product.compare_at_price).toFixed(2) }}
              </span>
              <span v-if="hasDiscount" class="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                {{ discountPercentage }}% off
              </span>
            </div>

            <!-- Actions -->
            <div class="space-y-4">
              <div class="flex space-x-4">
                <button 
                  @click="addToCart"
                  class="flex-1 bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-800 transition-colors"
                >
                  Add to cart
                </button>
                <button 
                  @click="toggleFavorite"
                  class="px-6 py-3 border border-gray-300 rounded hover:border-gray-400 transition-colors"
                >
                  <Icon name="heroicons:heart" class="w-5 h-5" />
                </button>
              </div>
              
              <!-- Trust badges -->
              <div class="flex items-center justify-center space-x-6 text-sm text-gray-500 py-4">
                <div class="flex items-center space-x-1">
                  <Icon name="heroicons:shield-check" class="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div class="flex items-center space-x-1">
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                  <span>Instant download</span>
                </div>
                <div class="flex items-center space-x-1">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4" />
                  <span>30-day guarantee</span>
                </div>
              </div>
            </div>

            <!-- Product Meta -->
            <div class="border-t border-gray-200 pt-6">
              <dl class="grid grid-cols-2 gap-4 text-sm">
                <div v-if="product.difficulty_level">
                  <dt class="text-gray-500">Difficulty</dt>
                  <dd class="font-medium">{{ product.difficulty_level }}</dd>
                </div>
                <div v-if="product.file_formats?.length">
                  <dt class="text-gray-500">Formats</dt>
                  <dd class="font-medium">{{ product.file_formats.join(', ') }}</dd>
                </div>
                <div v-if="product.file_size">
                  <dt class="text-gray-500">File size</dt>
                  <dd class="font-medium">{{ product.file_size }}</dd>
                </div>
                <div v-if="product.dimensions">
                  <dt class="text-gray-500">Dimensions</dt>
                  <dd class="font-medium">{{ product.dimensions }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="mb-16">
          <div class="border-b border-gray-200 pb-4 mb-8">
            <h2 class="text-2xl font-medium text-gray-900">Reviews ({{ getReviewCount() }})</h2>
          </div>
          
          <div class="space-y-6">
            <div v-for="review in sampleReviews" :key="review.id" class="border-b border-gray-200 pb-6">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">{{ review.name.charAt(0) }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-medium text-gray-900">{{ review.name }}</h4>
                    <div class="flex items-center">
                      <Icon v-for="i in review.rating" :key="i" name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                      <Icon v-for="i in (5 - review.rating)" :key="i + review.rating" name="heroicons:star" class="w-4 h-4 text-gray-300" />
                    </div>
                    <span class="text-sm text-gray-500">{{ review.date }}</span>
                  </div>
                  <p class="text-gray-700">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-16">
          <h2 class="text-2xl font-medium text-gray-900 mb-6">Description</h2>
          <div class="prose prose-gray max-w-none">
            <p class="text-gray-700 leading-relaxed">{{ product.description }}</p>
          </div>
          
          <!-- Tags -->
          <div v-if="product.tags?.length" class="mt-6">
            <h3 class="font-medium text-gray-900 mb-3">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in product.tags" :key="tag" class="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div v-if="relatedProducts.length > 0">
          <h2 class="text-2xl font-medium text-gray-900 mb-6">Similar templates</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="related in relatedProducts" :key="related.id" class="group">
              <NuxtLink :to="`/templates/${related.slug}`" class="block">
                <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                  <img 
                    v-if="related.preview_images?.[0]"
                    :src="related.preview_images[0]" 
                    :alt="related.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  >
                </div>
                <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown">{{ related.name }}</h3>
                <p class="text-sm text-gray-600">${{ parseFloat(related.price).toFixed(2) }}</p>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'
// Get route params
const route = useRoute()
const slug = route.params.slug

// Composables
const { fetchProduct, getRelatedProducts } = useProducts()
const cart = useCart()

// State
const product = ref<Product | null>(null)
const relatedProducts = ref([])
const isLoading = ref(true)
const selectedImage = ref('')

// Enhanced sample reviews data
const generateSampleReviews = (productName) => {
  const reviewPool = [
    {
      name: 'Sarah M.',
      rating: 5,
      comment: `Amazing ${productName.toLowerCase()}! So easy to customize and looks incredibly professional. My clients love the final result.`,
      date: '2 weeks ago'
    },
    {
      name: 'Jennifer K.',
      rating: 5,
      comment: `Perfect for my business. The design is elegant and the files are well organized. Highly recommend this ${productName.toLowerCase()}!`,
      date: '1 month ago'
    },
    {
      name: 'Michael R.',
      rating: 4,
      comment: 'Great quality and fast download. Everything was exactly as described. Will definitely buy more templates.',
      date: '1 month ago'
    },
    {
      name: 'Emma L.',
      rating: 5,
      comment: `This ${productName.toLowerCase()} saved me hours of work! Clean design and super easy to edit. Worth every penny.`,
      date: '3 weeks ago'
    },
    {
      name: 'David P.',
      rating: 5,
      comment: 'Exceeded my expectations. The template is beautifully designed and came with clear instructions. Perfect!',
      date: '2 months ago'
    },
    {
      name: 'Lisa Chen',
      rating: 4,
      comment: 'Really impressed with the quality. The layout is modern and the colors work perfectly for my brand.',
      date: '5 weeks ago'
    },
    {
      name: 'Amanda R.',
      rating: 5,
      comment: `Love this ${productName.toLowerCase()}! It\'s exactly what I was looking for. The customization options are endless.`,
      date: '1 week ago'
    },
    {
      name: 'James W.',
      rating: 5,
      comment: 'Outstanding template! Professional looking and easy to work with. My website looks amazing now.',
      date: '6 weeks ago'
    }
  ]
  
  // Return 3-5 random reviews
  const shuffled = reviewPool.sort(() => 0.5 - Math.random())
  const count = Math.floor(Math.random() * 3) + 3 // 3-5 reviews
  return shuffled.slice(0, count).map((review, index) => ({
    ...review,
    id: index + 1
  }))
}

const sampleReviews = ref([])

// Computed
const hasDiscount = computed(() => 
  product.value?.compare_at_price && parseFloat(product.value.compare_at_price) > parseFloat(product.value.price)
)

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0
  const original = parseFloat(product.value.compare_at_price)
  const current = parseFloat(product.value.price)
  return Math.round(((original - current) / original) * 100)
})

// Helper methods
const getReviewCount = () => {
  return product.value?.review_count || Math.floor(Math.random() * 100) + 25
}

const getDownloadCount = () => {
  return product.value?.download_count || Math.floor(Math.random() * 500) + 100
}

// Methods
const addToCart = () => {
  cart.addItem(product.value)
  cart.openCart()
}

const toggleFavorite = () => {
  // Toggle favorite functionality
}

// Load product data
const loadProduct = async () => {
  try {
    isLoading.value = true
    
    const productData = await fetchProduct(slug)
    
    if (!productData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Template not found'
      })
    }
    
    product.value = productData
    selectedImage.value = productData.preview_images?.[0] || ''
    
    // Generate sample reviews for this product
    sampleReviews.value = generateSampleReviews(productData.name)
    
    // Load related products
    if (productData.category_id) {
      try {
        relatedProducts.value = await getRelatedProducts(
          productData.id, 
          productData.category_id, 
          4
        )
      } catch (error) {
        console.warn('Failed to load related products:', error)
      }
    }
    
    // Set SEO meta tags
    useSeoMeta({
      title: `${productData.name} | Miracute Templates`,
      description: productData.short_description || productData.description,
      ogTitle: productData.name,
      ogDescription: productData.short_description || productData.description,
      ogImage: productData.preview_images?.[0]
    })
    
  } catch (error) {
    console.error('Failed to load product:', error)
    if (error.statusCode === 404) {
      throw error
    }
  } finally {
    isLoading.value = false
  }
}

// Initialize
onMounted(() => {
  loadProduct()
})

// Watch for slug changes
watch(() => route.params.slug, () => {
  loadProduct()
})
</script>