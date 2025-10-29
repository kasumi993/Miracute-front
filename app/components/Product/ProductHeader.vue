<template>
  <div>
    <!-- Mobile Product Header -->
    <div class="lg:hidden mb-4">
      <div class="flex items-center space-x-3 mb-3">
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
      <h1 class="text-2xl font-medium text-gray-900 mb-2">{{ product.name }}</h1>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span :class="[
            'text-2xl font-semibold',
            hasDiscount ? 'text-green-600' : 'text-gray-900'
          ]">
            ${{ finalPrice.toFixed(2) }}
          </span>
          <span v-if="comparePrice" class="text-lg text-gray-500 line-through">
            ${{ comparePrice.toFixed(2) }}
          </span>
          <span v-if="hasDiscount" class="text-sm font-medium text-green-600">
            {{ discountPercentage }}% OFF
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="flex items-center">
            <Icon
              v-for="star in 5"
              :key="star"
              name="heroicons:star-20-solid"
              class="w-4 h-4 text-yellow-400"
            />
          </div>
          <span class="text-sm text-gray-600">({{ product.review_count || 0 }})</span>
        </div>
      </div>
    </div>

    <!-- Desktop Product Header -->
    <div class="hidden lg:block">
      <!-- Category and Software -->
      <div class="flex items-center space-x-3 mb-4">
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
      <div class="mb-4">
        <h1 class="text-3xl font-medium text-gray-900 mb-2">{{ product.name }}</h1>
        <p v-if="product.short_description" class="text-lg text-gray-600">
          {{ product.short_description }}
        </p>
      </div>

      <!-- Rating and Downloads -->
      <div class="flex items-center space-x-6 mb-4">
        <div class="flex items-center space-x-2">
          <div class="flex items-center">
            <Icon
              v-for="star in 5"
              :key="star"
              name="heroicons:star-20-solid"
              class="w-4 h-4 text-yellow-400"
            />
          </div>
          <span class="text-sm text-gray-600">({{ product.review_count || 0 }} reviews)</span>
        </div>
        <div class="text-sm text-gray-600">
          {{ downloadCount }} downloads
        </div>
      </div>

      <!-- Price -->
      <div class="flex items-center space-x-3 mb-6">
        <span :class="[
          'text-3xl font-semibold',
          hasDiscount ? 'text-green-600' : 'text-gray-900'
        ]">
          ${{ finalPrice.toFixed(2) }}
        </span>
        <span v-if="comparePrice" class="text-xl text-gray-500 line-through">
          ${{ comparePrice.toFixed(2) }}
        </span>
        <span v-if="hasDiscount" class="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
          {{ discountPercentage }}% off
        </span>
      </div>
    </div>

    <!-- Mobile: Short Description -->
    <div class="lg:hidden mb-4">
      <p v-if="product.short_description" class="text-base text-gray-600">
        {{ product.short_description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '@/types/database'

interface Product {
  id: string
  name: string
  price: string
  compare_at_price?: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  software_required?: string[]
  is_featured?: boolean
  short_description?: string
}

interface Props {
  product: ProductWithCategory
  downloadCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  downloadCount: 0
})

// Coupon logic
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
const finalPrice = computed(() => {
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
</script>