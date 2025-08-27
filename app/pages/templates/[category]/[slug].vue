<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="container-custom py-16">
      <div class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
          <div class="space-y-4">
            <div class="h-6 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Not Found -->
    <div v-else-if="!product" class="container-custom py-16 text-center">
      <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h1 class="text-2xl font-heading font-medium text-gray-900 mb-2">Template Not Found</h1>
      <p class="text-gray-600 mb-6">The template you're looking for doesn't exist or has been removed.</p>
      <NuxtLink to="/templates" class="btn-primary">
        Browse All Templates
      </NuxtLink>
    </div>

    <!-- Product Details -->
    <div v-else>
      <!-- Breadcrumb -->
      <nav class="container-custom pt-8 pb-4">
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <NuxtLink to="/" class="hover:text-gray-900">Home</NuxtLink>
          <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          <NuxtLink to="/templates" class="hover:text-gray-900">Templates</NuxtLink>
          <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          <NuxtLink v-if="product.category" 
                    :to="`/categories/${product.category.slug}`"
                    class="hover:text-gray-900">
            {{ product.category.name }}
          </NuxtLink>
          <Icon v-if="product.category" name="heroicons:chevron-right" class="w-4 h-4" />
          <span class="text-gray-900 font-medium">{{ product.name }}</span>
        </div>
      </nav>

      <!-- Main Product Section -->
      <section class="container-custom py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Product Images -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-lg">
              <NuxtImg 
                :src="selectedImage"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Thumbnail Gallery -->
            <div v-if="product.preview_images && product.preview_images.length > 1" 
                 class="grid grid-cols-4 gap-2">
              <button v-for="(image, index) in product.preview_images.slice(0, 4)" 
                      :key="index"
                      @click="selectedImage = image"
                      :class="[
                        'aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                        selectedImage === image ? 'border-brand-sage' : 'border-transparent hover:border-gray-300'
                      ]">
                <NuxtImg 
                  :src="image"
                  :alt="`${product.name} preview ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Category Badge -->
            <div v-if="product.category" class="flex items-center space-x-2">
              <span class="bg-brand-pink text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                {{ product.category.name }}
              </span>
              <span v-if="product.is_featured"
                    class="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                Featured
              </span>
            </div>

            <!-- Product Name -->
            <div>
              <h1 class="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-3">
                {{ product.name }}
              </h1>
              <p class="text-xl text-gray-600 leading-relaxed">
                {{ product.short_description }}
              </p>
            </div>

            <!-- Pricing -->
            <div class="flex items-center space-x-4">
              <span class="text-4xl font-bold text-gray-900">
                ${{ price.toFixed(2) }}
              </span>
              <span v-if="comparePrice" 
                    class="text-2xl text-gray-500 line-through">
                ${{ comparePrice.toFixed(2) }}
              </span>
              <span v-if="hasDiscount" 
                    class="bg-red-100 text-red-800 text-sm font-bold px-2 py-1 rounded-full">
                Save {{ discountPercentage }}%
              </span>
            </div>

            <!-- Product Meta -->
            <div class="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div v-if="product.difficulty_level" class="flex items-center space-x-2">
                <Icon name="heroicons:academic-cap" class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">Difficulty</p>
                  <p class="font-medium">{{ product.difficulty_level }}</p>
                </div>
              </div>
              
              <div v-if="product.file_formats?.length" class="flex items-center space-x-2">
                <Icon name="heroicons:document" class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">Formats</p>
                  <p class="font-medium">{{ product.file_formats.join(', ') }}</p>
                </div>
              </div>
              
              <div v-if="product.file_size" class="flex items-center space-x-2">
                <Icon name="heroicons:folder" class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">File Size</p>
                  <p class="font-medium">{{ product.file_size }}</p>
                </div>
              </div>
              
              <div v-if="product.dimensions" class="flex items-center space-x-2">
                <Icon name="heroicons:rectangle-stack" class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">Dimensions</p>
                  <p class="font-medium">{{ product.dimensions }}</p>
                </div>
              </div>
            </div>

            <!-- Software Required -->
            <div v-if="product.software_required?.length" class="space-y-2">
              <h3 class="font-medium text-gray-900">Compatible With:</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="software in product.software_required" 
                      :key="software"
                      class="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                  {{ software }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-4">
              <div class="flex space-x-4">
                <button @click="addToCart"
                        :disabled="cart.isLoading.value"
                        class="btn-primary flex-1 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="!cart.isLoading.value">Add to Cart - ${{ price.toFixed(2) }}</span>
                  <span v-else class="flex items-center justify-center space-x-2">
                    <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                    <span>Adding...</span>
                  </span>
                </button>
                
                <button @click="toggleWishlist"
                        class="btn-secondary px-6 py-4">
                  <Icon :name="isInWishlist ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                        :class="isInWishlist ? 'text-red-500' : ''"
                        class="w-6 h-6" />
                </button>
              </div>

              <!-- Trust Badges -->
              <div class="flex items-center justify-center space-x-6 text-sm text-gray-500 pt-4">
                <div class="flex items-center space-x-2">
                  <Icon name="heroicons:shield-check" class="w-5 h-5 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Icon name="heroicons:arrow-down-tray" class="w-5 h-5 text-blue-500" />
                  <span>Instant Download</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Icon name="heroicons:arrow-path" class="w-5 h-5 text-yellow-500" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Description Section -->
      <section class="container-custom py-12">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 class="text-2xl font-heading font-medium text-gray-900 mb-6">About This Template</h2>
            <div class="prose prose-gray max-w-none">
              <p class="text-gray-700 leading-relaxed text-lg">{{ product.description }}</p>
            </div>
            
            <!-- Tags -->
            <div v-if="product.tags?.length" class="mt-8">
              <h3 class="font-medium text-gray-900 mb-3">Tags:</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in product.tags" 
                      :key="tag"
                      class="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0" class="container-custom py-12">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">You Might Also Like</h2>
          <p class="text-gray-600">More beautiful templates from the same category</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard v-for="relatedProduct in relatedProducts" 
                      :key="relatedProduct.id" 
                      :product="relatedProduct" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// Get route params
const route = useRoute()
const slug = route.params.slug

// Composables
const { fetchProduct, getRelatedProducts } = useProducts()
const cart = useCart()

// State
const product = ref(null)
const relatedProducts = ref([])
const isLoading = ref(true)
const selectedImage = ref('')
const isInWishlist = ref(false)

// Computed
const price = computed(() => product.value ? parseFloat(product.value.price) : 0)
const comparePrice = computed(() => 
  product.value?.compare_at_price ? parseFloat(product.value.compare_at_price) : null
)

const hasDiscount = computed(() => 
  comparePrice.value && comparePrice.value > price.value
)

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(((comparePrice.value - price.value) / comparePrice.value) * 100)
})

// Methods
const addToCart = async () => {
  if (!product.value) return
  
  try {
    await cart.addItem(product.value)
    cart.openDrawer()
  } catch (error) {
    console.error('Failed to add to cart:', error)
    useToast().error('Failed to add to cart')
  }
}

const toggleWishlist = () => {
  isInWishlist.value = !isInWishlist.value
  
  if (isInWishlist.value) {
    useToast().success('Added to wishlist')
  } else {
    useToast().success('Removed from wishlist')
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
    selectedImage.value = productData.preview_images?.[0] || '/images/placeholder-product.jpg'
    
    // Load related products
    if (productData.category_id) {
      relatedProducts.value = await getRelatedProducts(
        productData.id, 
        productData.category_id, 
        4
      )
    }
    
    // Set SEO meta tags
    useSeoMeta({
      title: `${productData.seo_title || productData.name} | Miracute`,
      description: productData.seo_description || productData.short_description || productData.description,
      keywords: productData.meta_keywords?.join(', ') || productData.tags?.join(', '),
      ogTitle: productData.name,
      ogDescription: productData.short_description || productData.description,
      ogImage: productData.preview_images?.[0],
      ogType: 'product'
    })
    
    // Structured data for products
    useJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.name,
      description: productData.short_description || productData.description,
      image: productData.preview_images || [],
      category: productData.category?.name,
      offers: {
        '@type': 'Offer',
        price: productData.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `https://miracute.com/templates/${productData.slug}`
      },
      brand: {
        '@type': 'Brand',
        name: 'Miracute'
      }
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
  if (route.params.slug !== slug) {
    loadProduct()
  }
})
</script>