<template>
  <div class="lg:hidden mb-4">
    <!-- Category Badges -->
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

    <!-- Product Name -->
    <h1 class="text-2xl font-medium text-gray-900 mb-2">{{ product.name }}</h1>

    <!-- Price and Rating -->
    <div class="flex items-center justify-between mb-4">
      <span class="text-2xl font-semibold text-gray-900">
        ${{ formatPrice(product.price) }}
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

    <!-- Short Description -->
    <p v-if="product.short_description" class="text-base text-gray-600">
      {{ product.short_description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '@/types/database'

interface Props {
  product: ProductWithCategory
  reviewCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  reviewCount: 0
})

const formatPrice = (price: string) => {
  return parseFloat(price).toFixed(2)
}
</script>