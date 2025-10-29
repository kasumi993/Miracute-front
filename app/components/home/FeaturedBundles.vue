<template>
  <section v-if="!isLoading && featuredBundles.length > 0" class="py-5 sm:py-5 bg-white">
    <div class="container-custom">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 sm:mb-10 px-4 sm:px-0">
        <div>
          <h2 class="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-1 sm:mb-2">
            Bundle Deals
          </h2>
          <p class="text-sm sm:text-base text-gray-600">Save more with curated template collections</p>
        </div>
        <NuxtLink to="/bundles"
                  class="hidden sm:flex items-center text-brand-brown hover:text-brand-brown/80 font-medium group text-sm md:text-base">
          View All Bundles
          <Icon name="heroicons:arrow-right" class="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <UICardSkeleton
        v-if="isLoading"
        :count="3"
        card-width="lg"
        image-height="md"
        :show-title="true"
        :show-description="true"
        :show-tags="true"
        :tag-count="3"
      />

      <!-- Bundles -->
      <div v-else class="overflow-x-auto pb-4 px-4 sm:px-0 -mx-4 sm:mx-0">
        <div class="flex space-x-4 sm:space-x-6 min-w-max pl-4 sm:pl-0">
          <div v-for="bundle in featuredBundles" :key="bundle.id" class="group flex-none w-80 sm:w-96">
            <div class="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-brand-brown/20 hover:shadow-lg transition-all duration-300">

              <!-- Bundle Images Grid -->
              <div class="relative h-48 sm:h-52 bg-gray-100 overflow-hidden">
                <!-- Special Bundle Badge -->
                <div class="absolute top-3 left-3 z-10">
                  <span class="bg-brand-brown text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    Bundle Deal
                  </span>
                </div>

                <!-- Savings Badge -->
                <div class="absolute top-3 right-3 z-10">
                  <span class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Save ${{ (bundle.original_price - bundle.bundle_price).toFixed(2) }}
                  </span>
                </div>

                <!-- Template Images Mosaic -->
                <div class="grid grid-cols-2 gap-0.5 h-full">
                  <div
                    v-for="(product, index) in (bundle.product_details || []).slice(0, 4)"
                    :key="product.id"
                    class="relative overflow-hidden cursor-pointer group/img"
                    :class="{
                      'col-span-2': index === 0 && bundle.product_details.length === 1,
                      'row-span-2': index === 0 && bundle.product_details.length > 2
                    }"
                    @click="navigateToProduct(product)"
                  >
                    <img
                      v-if="product.preview_images?.[0]"
                      :src="product.preview_images[0]"
                      :alt="product.name"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                      <Icon name="heroicons:photo" class="w-6 h-6 text-gray-400" />
                    </div>

                    <!-- Hover overlay -->
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div class="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium">
                        View
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Template Count -->
                <div class="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                  {{ bundle.product_details?.length || 0 }} Templates
                </div>
              </div>

              <!-- Bundle Content -->
              <div class="p-5 sm:p-6">
                <!-- Bundle Title -->
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand-brown transition-colors">
                  {{ bundle.name || 'Template Bundle' }}
                </h3>

                <!-- Bundle Description -->
                <p v-if="bundle.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
                  {{ bundle.description }}
                </p>

                <!-- Pricing -->
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <div class="flex items-baseline space-x-2">
                      <span class="text-2xl font-bold text-gray-900">${{ bundle.bundle_price }}</span>
                      <span class="text-lg text-gray-400 line-through">${{ bundle.original_price }}</span>
                    </div>
                    <span class="text-sm font-medium text-green-600">{{ bundle.discount_percentage }}% OFF</span>
                  </div>
                </div>

                <!-- What's Included -->
                <div class="mb-4">
                  <div class="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">What's Included:</div>
                  <div class="space-y-1">
                    <div
                      v-for="product in (bundle.product_details || []).slice(0, 2)"
                      :key="product.id"
                      class="flex items-center text-xs text-gray-600"
                    >
                      <Icon name="heroicons:check" class="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      <span class="truncate">{{ product.name }}</span>
                    </div>
                    <div
                      v-if="(bundle.product_details?.length || 0) > 2"
                      class="flex items-center text-xs text-gray-600"
                    >
                      <Icon name="heroicons:plus" class="w-3 h-3 text-brand-brown mr-2 flex-shrink-0" />
                      <span>{{ (bundle.product_details?.length || 0) - 2 }} more template{{ (bundle.product_details?.length || 0) - 2 > 1 ? 's' : '' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Action Button -->
                <button
                  @click="addBundleToCart(bundle)"
                  :disabled="isAddingToCart[bundle.id]"
                  class="w-full bg-brand-brown hover:bg-brand-brown/90 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <div class="flex items-center justify-center space-x-2">
                    <Icon name="heroicons:shopping-cart" class="w-4 h-4" />
                    <span v-if="isAddingToCart[bundle.id]">Adding to Cart...</span>
                    <span v-else>Add Bundle to Cart</span>
                  </div>
                </button>

                <!-- Trust Signals -->
                <div class="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-500">
                  <div class="flex items-center space-x-1">
                    <Icon name="heroicons:arrow-down-tray" class="w-3 h-3" />
                    <span>Instant Download</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Icon name="heroicons:shield-check" class="w-3 h-3" />
                    <span>Commercial License</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Consolidated bundle service
import { BundleService } from '@/services/BundleService'
import type { ProductBundle } from '@/types/bundle'

const router = useRouter()
const { addToCart } = useProductActions()

// State
const featuredBundles = ref<ProductBundle[]>([])
const isLoading = ref(true)
const isAddingToCart = ref<{[key: string]: boolean}>({})

// Navigation
const navigateToProduct = (product: any) => {
  router.push(`/listings/${product.slug || product.id}`)
}

// Add bundle to cart
const addBundleToCart = async (bundle: ProductBundle) => {
  if (!bundle.product_details || bundle.product_details.length === 0) {
    useToast().error('Bundle products not available')
    return
  }

  isAddingToCart.value[bundle.id] = true

  try {
    // Calculate discount per product
    const totalOriginalPrice = bundle.original_price
    const totalDiscount = totalOriginalPrice - bundle.bundle_price

    // Add each product to cart with distributed discount
    for (const product of bundle.product_details) {
      const productDiscountRatio = product.price / totalOriginalPrice
      const productDiscount = totalDiscount * productDiscountRatio
      const discountedPrice = product.price - productDiscount

      await addToCart(product.id, 1, {
        bundleId: bundle.id,
        bundleName: bundle.name,
        originalPrice: product.price,
        discountedPrice: discountedPrice,
        discount: productDiscount
      })
    }

    useToast().success(`${bundle.name} added to cart!`)
  } catch (error: any) {
    console.error('Error adding bundle to cart:', error)
    useToast().error('Failed to add bundle to cart')
  } finally {
    isAddingToCart.value[bundle.id] = false
  }
}

// Fetch featured bundles
const fetchFeaturedBundles = async () => {
  try {
    isLoading.value = true
    const response = await BundleService.getBundles({
      featured: true,
      active: true,
      limit: 3
    })

    if (response.success && response.data) {
      featuredBundles.value = response.data.bundles
    }
  } catch (error) {
    console.error('Error fetching featured bundles:', error)
  } finally {
    isLoading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchFeaturedBundles()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Floating Animation */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Gradient Text */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}
</style>