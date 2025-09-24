<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <ProductDetailSkeleton v-if="isLoading" />

    <!-- Product Not Found -->
    <div v-else-if="error || !product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 class="text-2xl font-medium text-gray-900 mb-2">Template not found</h1>
      <p class="text-gray-600 mb-6">{{ error || 'This template may have been removed or doesn\'t exist.' }}</p>
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

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <!-- Mobile Product Header -->
        <ProductMobileHeader
          :product="product"
          :review-count="reviewCount"
        />

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-16 mb-8 lg:mb-16">
          <!-- Left Column: Images + What's Included + Reviews (Desktop) -->
          <div class="lg:col-span-3 space-y-4 lg:space-y-6">
            <!-- Product Images Gallery -->
            <ProductImageGallery
              :images="product.preview_images || []"
              :product-name="product.name"
              :initial-index="0"
            >
              <template #wishlist-button="{ class: customClass }">
                <button
                  @click="productActions.toggleFavorite"
                  :class="[
                    customClass,
                    'w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-white hover:scale-110',
                    productActions.isInWishlist.value ? 'border-2 border-red-300 bg-red-50' : ''
                  ]"
                >
                  <Icon
                    :name="productActions.isInWishlist.value ? 'heroicons:heart-solid' : 'heroicons:heart'"
                    :class="productActions.isInWishlist.value ? 'text-red-500' : 'text-gray-600'"
                    class="w-6 h-6"
                  />
                </button>
              </template>
            </ProductImageGallery>

            <!-- Mobile Actions -->
            <div class="lg:hidden">
              <ProductActions
                :product="product"
                :is-product-in-cart="productActions.isProductInCart.value"
                :is-in-wishlist="productActions.isInWishlist.value"
                @add-to-cart="productActions.addToCart"
                @buy-now="productActions.buyNow"
                @toggle-favorite="productActions.toggleFavorite"
              />
            </div>

            <!-- What's Included (Desktop only) -->
            <div class="hidden lg:block">
              <ProductWhatIncluded />
            </div>

            <!-- Reviews Section (Desktop only - in left column) -->
            <div class="hidden lg:block">
              <ReviewsList
                :product-id="product.id"
                :user-id="user?.id"
                :can-write-review="canUserReview"
                ref="reviewsListDesktop"
              />
            </div>
          </div>

          <!-- Right Column: Product Info + Actions + Sections -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Desktop Product Header -->
            <ProductDesktopHeader
              :product="product"
              :review-count="reviewCount"
              :download-count="downloadCount"
            />

            <!-- Desktop Actions -->
            <div class="hidden lg:block">
              <ProductActions
                :product="product"
                :is-product-in-cart="productActions.isProductInCart.value"
                :is-in-wishlist="productActions.isInWishlist.value"
                @add-to-cart="productActions.addToCart"
                @buy-now="productActions.buyNow"
                @toggle-favorite="productActions.toggleFavorite"
              />
            </div>

            <!-- Desktop Sections -->
            <ProductDesktopSections :product="product" />

            <!-- Mobile Collapsible Sections -->
            <ProductMobileSections
              :product="product"
              :user-id="user?.id"
              :can-write-review="canUserReview"
              ref="mobileSections"
            />
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
// Get route params
const route = useRoute()
const slug = route.params.slug as string

// Composables
const user = useSupabaseUser()

// Product detail logic
const productDetail = useProductDetail(slug)
const {
  product,
  relatedProducts,
  isLoading,
  error,
  canUserReview,
  getDownloadCount,
  initialize
} = productDetail

// Product actions
const productActions = useProductActions(product)

// Review count (will be updated by ReviewsList components)
const reviewCount = ref(0)
const downloadCount = computed(() => getDownloadCount())

// Template refs
const reviewsListDesktop = ref()
const mobileSections = ref()

// Review refresh functionality
const refreshAllReviews = () => {
  // Refresh desktop reviews
  if (reviewsListDesktop.value?.refreshReviews) {
    reviewsListDesktop.value.refreshReviews()
  }

  // Refresh mobile reviews
  if (mobileSections.value?.reviewsList?.refreshReviews) {
    mobileSections.value.reviewsList.refreshReviews()
  }
}

// Update review count from ReviewsList components
const updateReviewCount = () => {
  const desktopStats = reviewsListDesktop.value?.stats
  const mobileStats = mobileSections.value?.reviewsList?.stats

  const stats = desktopStats || mobileStats
  if (stats?.total_reviews) {
    reviewCount.value = stats.total_reviews
  }
}

// Watch for changes in ReviewsList components
watch([reviewsListDesktop, mobileSections], updateReviewCount, { deep: true })

// Provide refresh function to child components
provide('refreshAllReviews', refreshAllReviews)

// Initialize on mount
onMounted(async () => {
  await initialize()
})

// Watch for slug changes
watch(() => route.params.slug, async (newSlug) => {
  if (newSlug && newSlug !== slug) {
    await initialize()
  }
})

// SEO and meta
useHead({
  title: computed(() => product.value ? `${product.value.name} | Miracute Templates` : 'Loading...'),
  meta: [
    {
      name: 'description',
      content: computed(() => product.value?.short_description || product.value?.description || '')
    }
  ]
})
</script>

<style scoped>
/* Mobile sticky footer padding compensation */
@media (max-width: 1024px) {
  .lg\:hidden.sticky.bottom-0 ~ * {
    padding-bottom: 80px;
  }
}
</style>