<template>
  <div v-if="isLoading || recommendations.length > 0" class="space-y-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <h2 v-if="!isLoading" class="text-2xl font-medium text-gray-900">You might also like</h2>
      <div v-else class="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>

      <NuxtLink
        v-if="!isLoading"
        :to="seeMoreUrl"
        class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm transition-colors flex items-center space-x-1"
      >
        <span>See more</span>
        <Icon name="heroicons:arrow-right" class="w-4 h-4" />
      </NuxtLink>
      <div v-else class="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
    </div>

    <!-- Products Grid -->
    <ProductGrid
      :products="recommendations"
      :is-loading="isLoading"
      :columns="{ sm: 2, md: 2, lg: 4, xl: 4 }"
      :gap="4"
      :skeleton-count="8"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '@/types/database'

interface Props {
  currentProduct: ProductWithCategory
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 8
})

const { recommendations, isLoading, loadRecommendations, getSeeMoreUrl } = useProductRecommendations()

const seeMoreUrl = computed(() => getSeeMoreUrl(props.currentProduct))

// Load recommendations when component mounts or current product changes
onMounted(() => {
  if (props.currentProduct) {
    loadRecommendations(props.currentProduct, props.limit)
  }
})

watch(() => props.currentProduct, (newProduct) => {
  if (newProduct) {
    loadRecommendations(newProduct, props.limit)
  }
}, { deep: true })
</script>