<template>
  <div class="product-grid">
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in skeletonCount" :key="n" class="animate-pulse">
        <div class="bg-gray-200 aspect-[4/3] rounded-lg mb-4"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else-if="products.length > 0" :class="gridClass">
      <ProductCard 
        v-for="product in products" 
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon name="heroicons:magnifying-glass" class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-xl font-medium text-gray-900 mb-2">{{ emptyTitle }}</h3>
      <p class="text-gray-500 mb-8 max-w-md mx-auto">{{ emptyMessage }}</p>
      <NuxtLink v-if="emptyAction" :to="emptyAction.link" class="btn-primary">
        {{ emptyAction.text }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '~/types/database'

interface Props {
  products: ProductWithCategory[]
  isLoading?: boolean
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number
  skeletonCount?: number
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: {
    text: string
    link: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  columns: () => ({
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4
  }),
  gap: 6,
  skeletonCount: 8,
  emptyTitle: 'No templates found',
  emptyMessage: 'We couldn\'t find any templates matching your criteria. Try adjusting your filters or search terms.',
  emptyAction: () => ({
    text: 'Browse All Templates',
    link: '/templates'
  })
})

// Computed
const gridClass = computed(() => {
  const { sm, md, lg, xl } = props.columns
  const gap = props.gap
  
  return [
    'grid',
    `gap-${gap}`,
    sm && `grid-cols-${sm}`,
    md && `md:grid-cols-${md}`,
    lg && `lg:grid-cols-${lg}`,
    xl && `xl:grid-cols-${xl}`,
    props.columns['2xl'] && `2xl:grid-cols-${props.columns['2xl']}`
  ].filter(Boolean).join(' ')
})
</script>