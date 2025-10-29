<template>
  <div v-if="bundles && bundles.length > 0" class="space-y-4">
    <div
      v-for="bundle in bundles"
      :key="bundle.id"
      class="relative border-2 border-dashed border-orange-300 rounded-xl p-4 bg-gradient-to-br from-orange-50/80 to-amber-50/80 hover:border-orange-400 transition-all duration-200"
    >
      <!-- Urgency Badge -->
      <div class="absolute -top-2 left-4">
        <span class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
          🔥 LIMITED TIME
        </span>
      </div>

      <!-- Bundle Header -->
      <div class="mt-2 mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            BUNDLE DEAL
          </span>
          <div class="text-right">
            <div class="text-lg font-bold text-green-600">
              SAVE ${{ (bundle.original_price - bundle.bundle_price).toFixed(2) }}
            </div>
            <div class="text-xs text-green-600 font-medium">
              ({{ bundle.discount_percentage }}% OFF)
            </div>
          </div>
        </div>

        <h3 class="text-base font-bold text-gray-900 leading-tight">
          {{ bundle.name }}
        </h3>
      </div>

      <!-- Products List (Vertical for better conversion) -->
      <div class="space-y-2 mb-4">
        <div
          v-for="(product, index) in bundle.product_details"
          :key="product.id"
          class="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer group"
          @click="navigateToProduct(product)"
        >
          <!-- Product Number -->
          <div class="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">
            {{ index + 1 }}
          </div>

          <!-- Product Image -->
          <div class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
            <img
              v-if="product.preview_images?.[0]"
              :src="product.preview_images[0]"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="heroicons:photo" class="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="min-w-0 flex-1">
                <h4 class="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {{ product.name }}
                </h4>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-xs text-gray-500 line-through">${{ product.price }}</span>
                  <span class="text-xs font-bold text-green-600">
                    ${{ (product.price * (1 - bundle.discount_percentage / 100)).toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- Current product indicator -->
              <div v-if="product.id === currentProductId" class="flex-shrink-0 ml-2">
                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  This item
                </span>
              </div>
            </div>
          </div>

          <!-- Arrow -->
          <div class="flex-shrink-0">
            <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </div>
        </div>
      </div>

      <!-- Pricing Comparison -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-200">
        <div class="text-center">
          <div class="flex items-center justify-center space-x-2 mb-2">
            <span class="text-xs text-gray-600">Individual price:</span>
            <span class="text-lg text-gray-500 line-through font-bold">${{ bundle.original_price }}</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <span class="text-sm font-medium text-gray-700">Bundle price:</span>
            <span class="text-2xl font-bold text-green-600">${{ bundle.bundle_price }}</span>
          </div>
          <div class="text-xs text-green-600 font-bold mt-1">
            ✨ You save ${{ (bundle.original_price - bundle.bundle_price).toFixed(2) }} ({{ bundle.discount_percentage }}% OFF)
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <button
        @click="addBundleToCart(bundle)"
        :disabled="isAddingToCart"
        class="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div class="flex items-center justify-center space-x-2">
          <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
          <span v-if="isAddingToCart">Adding Bundle...</span>
          <span v-else>🛒 Add Bundle to Cart</span>
        </div>
        <div class="text-xs mt-1 opacity-90">
          Get all {{ bundle.product_details?.length || 0 }} items now
        </div>
      </button>

      <!-- Trust signals -->
      <div class="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div class="flex items-center space-x-1">
          <Icon name="heroicons:shield-check" class="w-3 h-3 text-green-500" />
          <span>Instant Download</span>
        </div>
        <div class="flex items-center space-x-1">
          <Icon name="heroicons:clock" class="w-3 h-3 text-blue-500" />
          <span>Limited Time</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductBundle } from '@/types/bundle'

interface Props {
  bundles: ProductBundle[]
  currentProductId: string
}

const props = defineProps<Props>()

const router = useRouter()
const isAddingToCart = ref(false)

const navigateToProduct = (product: any) => {
  // Navigate to the product detail page
  router.push(`/listings/${product.slug || product.id}`)
}

const addBundleToCart = async (bundle: ProductBundle) => {
  if (!bundle.product_details || bundle.product_details.length === 0) {
    useToast().error('Bundle products not available')
    return
  }

  isAddingToCart.value = true

  try {
    const { addToCart: addToCartStore, isInCart } = useCartCounter()
    let addedCount = 0

    // Calculate discount per product (proportional to individual prices)
    const totalOriginalPrice = bundle.original_price
    const totalDiscount = totalOriginalPrice - bundle.bundle_price

    for (const product of bundle.product_details) {
      console.log(`Checking product ${product.name} (${product.id}), in cart: ${isInCart(product.id)}`)

      if (!isInCart(product.id)) {
        // Calculate proportional discount for this product
        const productDiscountRatio = product.price / totalOriginalPrice
        const productDiscount = totalDiscount * productDiscountRatio
        const discountedPrice = product.price - productDiscount

        // Bundle metadata
        const bundleMetadata = {
          bundleId: bundle.id,
          bundleName: bundle.name,
          originalPrice: product.price,
          discountedPrice: discountedPrice,
          discount: productDiscount,
          addedAsBundle: true
        }

        await addToCartStore(product, undefined, bundleMetadata)
        addedCount++
        console.log(`Added ${product.name} to cart with bundle discount: $${productDiscount.toFixed(2)}`)
      } else {
        console.log(`${product.name} already in cart, skipping`)
      }
    }

    console.log(`Added ${addedCount} products from bundle to cart`)
    useToast().success(`${bundle.name} added to cart!`)
  } catch (error: any) {
    console.error('Error adding bundle to cart:', error)
    useToast().error('Failed to add bundle to cart')
  } finally {
    isAddingToCart.value = false
  }
}
</script>