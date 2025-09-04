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
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-16">
          <!-- Left Column: Images + Trust Badges + Product Details -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Product Images Carousel - Etsy Style -->
            <div class="flex space-x-4">
              <!-- Vertical Thumbnail Strip -->
              <div v-if="product.preview_images?.length > 1" class="flex-shrink-0">
                <div class="flex flex-col space-y-2 max-h-96 overflow-y-auto">
                  <button
                    v-for="(image, index) in product.preview_images"
                    :key="index"
                    @click="goToImage(index)"
                    :class="[
                      'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0',
                      currentImageIndex === index 
                        ? 'border-brand-brown ring-2 ring-brand-brown/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    ]"
                  >
                    <img :src="image" :alt="`Thumbnail ${index + 1}`" class="w-full h-full object-cover" />
                  </button>
                </div>
              </div>

              <!-- Main Image Container -->
              <div class="relative flex-1 flex items-start">
                <div class="relative w-full max-w-full" style="aspect-ratio: 1/1;">
                  <div class="rounded-lg overflow-hidden bg-gray-100 group w-full h-full">
                  <img 
                    v-if="selectedImage"
                    :src="selectedImage" 
                    :alt="product.name"
                    class="w-full h-full object-cover transition-all duration-300"
                  >
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-16 h-16 text-gray-400" />
                  </div>

                  <!-- Navigation Arrows -->
                  <div v-if="product.preview_images?.length > 1" class="absolute inset-0 flex items-center justify-between p-4">
                    <!-- Previous Button -->
                    <button 
                      @click="previousImage"
                      class="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      :disabled="currentImageIndex === 0"
                      :class="currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''"
                    >
                      <Icon name="heroicons:chevron-left" class="w-5 h-5 text-gray-700" />
                    </button>

                    <!-- Next Button -->
                    <button 
                      @click="nextImage"
                      class="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      :disabled="currentImageIndex === product.preview_images.length - 1"
                      :class="currentImageIndex === product.preview_images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''"
                    >
                      <Icon name="heroicons:chevron-right" class="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <!-- Image Counter -->
                  <div v-if="product.preview_images?.length > 1" class="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
                    {{ currentImageIndex + 1 }} / {{ product.preview_images.length }}
                  </div>

                  <!-- Zoom Icon -->
                  <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div class="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                      <Icon name="heroicons:magnifying-glass-plus" class="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  </div>
                </div>

                <!-- Thumbnail Dots Navigation (Mobile Only) -->
                <div v-if="product.preview_images?.length > 1" class="flex justify-center space-x-2 mt-4 md:hidden">
                  <button
                    v-for="(image, index) in product.preview_images"
                    :key="index"
                    @click="goToImage(index)"
                    :class="[
                      'w-2 h-2 rounded-full transition-all duration-200',
                      currentImageIndex === index 
                        ? 'bg-brand-brown scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    ]"
                  />
                </div>
              </div>
            </div>

            <!-- What We Offer -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div class="text-center mb-5">
                <h4 class="text-xl font-bold text-gray-900 mb-2">What's Included</h4>
                <p class="text-sm text-gray-500">Everything you need for success</p>
              </div>
              
              <div class="space-y-4">
                <div class="relative pl-8">
                  <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-sage to-brand-sage/80 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:sparkles" class="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h5 class="font-semibold text-gray-900 text-sm">Premium Design</h5>
                    <p class="text-xs text-gray-500 mt-1">Professionally crafted templates</p>
                  </div>
                </div>
                
                <div class="relative pl-8">
                  <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-pink to-brand-pink/80 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:pencil-square" class="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h5 class="font-semibold text-gray-900 text-sm">Easy Editing</h5>
                    <p class="text-xs text-gray-500 mt-1">Customize colors, text & layout</p>
                  </div>
                </div>
                
                <div class="relative pl-8">
                  <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-brown to-brand-brown/80 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h5 class="font-semibold text-gray-900 text-sm">30 Days Support</h5>
                    <p class="text-xs text-gray-500 mt-1">Personal help from the designer</p>
                  </div>
                </div>
                
                <div class="relative pl-8">
                  <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-sage/70 to-brand-pink/70 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:building-office" class="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h5 class="font-semibold text-gray-900 text-sm">Commercial Rights</h5>
                    <p class="text-xs text-gray-500 mt-1">Use for client & business projects</p>
                  </div>
                </div>
                
                <div class="mt-4 p-3 bg-gradient-to-r from-brand-sage/10 to-brand-pink/10 rounded-xl border border-brand-sage/20">
                  <div class="flex items-center justify-center space-x-2">
                    <Icon name="heroicons:infinity" class="w-5 h-5 text-brand-sage" />
                    <span class="text-sm font-semibold text-gray-900">Lifetime Access</span>
                  </div>
                  <p class="text-center text-xs text-gray-600 mt-1">Download forever, no subscriptions</p>
                </div>
              </div>
            </div>

            <!-- Reviews Section -->
            <div>
              <div class="mb-6">
                <h2 class="text-xl font-medium text-gray-900 mb-2">Reviews</h2>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <div class="flex items-center space-x-1">
                    <div class="flex items-center">
                      <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                      <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                      <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                      <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                      <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                    </div>
                    <span class="font-medium">5.0</span>
                  </div>
                  <span>{{ getReviewCount() }} reviews</span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div 
                  v-for="review in (showAllReviews ? sampleReviews : sampleReviews.slice(0, 4))" 
                  :key="review.id" 
                  class="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-xs font-medium text-gray-600">{{ review.name.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2 mb-1">
                        <h4 class="text-sm font-medium text-gray-900">{{ review.name }}</h4>
                        <div class="flex items-center">
                          <Icon v-for="i in review.rating" :key="i" name="heroicons:star-20-solid" class="w-3 h-3 text-yellow-400" />
                          <Icon v-for="i in (5 - review.rating)" :key="i + review.rating" name="heroicons:star" class="w-3 h-3 text-gray-300" />
                        </div>
                        <span class="text-xs text-gray-500">{{ review.date }}</span>
                      </div>
                      <p class="text-sm text-gray-700" :class="showAllReviews ? '' : 'line-clamp-3'">{{ review.comment }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                v-if="sampleReviews.length > 4"
                @click="toggleReviews"
                class="mt-6 text-sm text-brand-sage hover:text-brand-sage-dark font-medium transition-colors"
              >
                {{ showAllReviews ? 'Show less' : `See all ${getReviewCount()} reviews` }}
              </button>
            </div>

          </div>

          <!-- Right Column: Product Info + Actions + Description -->
          <div class="lg:col-span-2 space-y-6">
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
            <div class="space-y-3">
              <!-- Buy Now Button -->
              <button 
                @click="buyNow"
                class="w-full bg-brand-sage text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-sage-dark transition-colors"
              >
                Buy Now
              </button>
              
              <!-- Add to Cart + Wishlist -->
              <div class="flex space-x-3">
                <button 
                  @click="addToCart"
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
                  @click="toggleFavorite"
                  :class="[
                    'px-6 py-3 border rounded-lg transition-all',
                    product && wishlist.isInWishlist(product.id) ? 
                      'border-red-300 bg-red-50 text-red-600 hover:border-red-400' : 
                      'border-gray-300 hover:border-gray-400'
                  ]"
                >
                  <Icon 
                    :name="product && wishlist.isInWishlist(product.id) ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                    :class="product && wishlist.isInWishlist(product.id) ? 'text-red-500' : 'text-gray-600'"
                    class="w-5 h-5" 
                  />
                </button>
              </div>
            </div>

            <!-- Trust Badges -->
            <div class="flex items-center justify-center space-x-6 text-sm text-gray-600 py-4 border-t border-gray-200">
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-blue-600" />
                <span>Instant Download</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:arrow-path" class="w-4 h-4 text-amber-600" />
                <span>30-Day Guarantee</span>
              </div>
            </div>

            <!-- Description -->
            <div class="border-t border-gray-200 pt-6">
              <h2 class="text-xl font-medium text-gray-900 mb-4">Description</h2>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">{{ product.description }}</p>
              </div>
              
              <!-- Product Details -->
              <div class="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="text-center mb-5">
                  <h3 class="text-lg font-bold text-gray-900 mb-2">Technical Specs</h3>
                  <p class="text-sm text-gray-500">Everything you need to know</p>
                </div>
                
                <div class="space-y-3">
                  <div v-if="product.difficulty_level" class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-brand-sage rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:academic-cap" class="w-4 h-4 text-white" />
                      </div>
                      <span class="text-sm font-medium text-gray-700">Difficulty Level</span>
                    </div>
                    <span class="text-sm font-semibold text-brand-brown">{{ product.difficulty_level }}</span>
                  </div>
                  
                  <div v-if="product.template_type" class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-brand-pink rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:tag" class="w-4 h-4 text-white" />
                      </div>
                      <span class="text-sm font-medium text-gray-700">Template Type</span>
                    </div>
                    <span class="text-sm font-semibold text-brand-brown">{{ product.template_type }}</span>
                  </div>
                  
                  <div v-if="product.file_size" class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-brand-brown rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:cloud-arrow-down" class="w-4 h-4 text-white" />
                      </div>
                      <span class="text-sm font-medium text-gray-700">Download Size</span>
                    </div>
                    <span class="text-sm font-semibold text-brand-brown">{{ product.file_size }}</span>
                  </div>
                  
                  <div v-if="product.dimensions" class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-gradient-to-br from-brand-sage to-brand-pink rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:arrows-pointing-out" class="w-4 h-4 text-white" />
                      </div>
                      <span class="text-sm font-medium text-gray-700">Dimensions</span>
                    </div>
                    <span class="text-sm font-semibold text-brand-brown">{{ product.dimensions }}</span>
                  </div>
                  
                  <div v-if="product.software_required?.length" class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-gradient-to-br from-brand-pink to-brand-brown rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:computer-desktop" class="w-4 h-4 text-white" />
                      </div>
                      <span class="text-sm font-medium text-gray-700">Required Software</span>
                    </div>
                    <span class="text-sm font-semibold text-brand-brown">{{ product.software_required.join(', ') }}</span>
                  </div>
                </div>
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
          </div>
        </div>


        <!-- Related Products -->
        <div v-if="relatedProducts.length > 0">
          <h2 class="text-2xl font-medium text-gray-900 mb-6">Similar templates</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard 
              v-for="related in relatedProducts" 
              :key="related.id" 
              :product="related"
            />
          </div>
        </div>
      </div>
    </div>
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
  description?: string
  short_description?: string
  template_type?: string
  difficulty_level?: string
  file_formats?: string[]
  file_size?: string
  dimensions?: string
}
// Get route params
const route = useRoute()
const slug = route.params.slug

// Composables
const { fetchProduct, getRelatedProducts } = useProducts()
const cartCounter = useCartCounter()
const wishlist = useWishlist()
const toast = useToast()

// State
const product = ref<Product | null>(null)
const relatedProducts = ref([])
const isLoading = ref(true)
const selectedImage = ref('')
const showAllReviews = ref(false)
const currentImageIndex = ref(0)

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
const isProductInCart = computed(() => {
  return product.value ? cartCounter.isInCart(product.value.id) : false
})

const addToCart = () => {
  cartCounter.addToCart(product.value)
}

const buyNow = () => {
  // Add to cart first
  cartCounter.addToCart(product.value)
  // Navigate directly to checkout
  navigateTo('/cart/checkout')
}

const toggleFavorite = () => {
  if (!product.value) return
  
  const success = wishlist.toggleWishlist(product.value)
  
  if (success) {
    if (wishlist.isInWishlist(product.value.id)) {
      toast.show('Added to wishlist', 'success')
    } else {
      toast.show('Removed from wishlist', 'success')
    }
  }
}

const toggleReviews = () => {
  showAllReviews.value = !showAllReviews.value
}

// Image carousel methods
const goToImage = (index) => {
  if (product.value?.preview_images && index >= 0 && index < product.value.preview_images.length) {
    currentImageIndex.value = index
    selectedImage.value = product.value.preview_images[index]
  }
}

const nextImage = () => {
  if (product.value?.preview_images && currentImageIndex.value < product.value.preview_images.length - 1) {
    goToImage(currentImageIndex.value + 1)
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    goToImage(currentImageIndex.value - 1)
  }
}

// Keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'ArrowLeft') {
    previousImage()
  } else if (event.key === 'ArrowRight') {
    nextImage()
  }
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
    currentImageIndex.value = 0
    
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
  // Add keyboard navigation
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up keyboard event listener
  document.removeEventListener('keydown', handleKeydown)
})

// Watch for slug changes
watch(() => route.params.slug, () => {
  loadProduct()
})
</script>