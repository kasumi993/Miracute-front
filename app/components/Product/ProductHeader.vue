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
        <span class="text-2xl font-semibold text-gray-900">
          ${{ parseFloat(product.price).toFixed(2) }}
        </span>
        <div class="flex items-center space-x-2">
          <div class="flex items-center">
            <Icon
              v-for="star in 5"
              :key="star"
              name="heroicons:star-20-solid"
              class="w-4 h-4 text-yellow-400"
            />
          </div>
          <span class="text-sm text-gray-600">({{ reviewCount }})</span>
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
          <span class="text-sm text-gray-600">({{ reviewCount }} reviews)</span>
        </div>
        <div class="text-sm text-gray-600">
          {{ downloadCount }} downloads
        </div>
      </div>

      <!-- Price -->
      <div class="flex items-center space-x-3 mb-6">
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
interface Product {
  id: string
  name: string
  price: string
  compare_at_price?: string | null
  category?: {
    id: string
    name: string
    slug: string
  }
  software_required?: string[]
  is_featured?: boolean
  short_description?: string
}

interface Props {
  product: Product
  reviewCount?: number
  downloadCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  reviewCount: 0,
  downloadCount: 0
})

// Computed
const hasDiscount = computed(() =>
  props.product?.compare_at_price && parseFloat(props.product.compare_at_price) > parseFloat(props.product.price)
)

const discountPercentage = computed(() => {
  if (!hasDiscount.value || !props.product.compare_at_price) return 0
  const original = parseFloat(props.product.compare_at_price)
  const current = parseFloat(props.product.price)
  return Math.round(((original - current) / original) * 100)
})
</script>