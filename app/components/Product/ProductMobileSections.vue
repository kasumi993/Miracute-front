<template>
  <div class="lg:hidden space-y-4">
    <!-- What's Included -->
    <ProductWhatIncluded />

    <!-- Description Section -->
    <ProductDescription
      :description="product.description || ''"
      :is-open="sectionStates.showDescription"
      @toggle="sectionStates.showDescription = !sectionStates.showDescription"
    />

    <!-- Reviews Section (Mobile/Tablet only - comes after description) -->
    <div class="border-t border-gray-200 pt-4">
      <button
        @click="sectionStates.showReviews = !sectionStates.showReviews"
        class="flex items-center justify-between w-full text-left py-2"
      >
        <span class="text-lg font-medium text-gray-900">Customer Reviews</span>
        <Icon
          :name="sectionStates.showReviews ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
          class="w-5 h-5 text-gray-400"
        />
      </button>
      <div :class="['overflow-hidden transition-all duration-300', sectionStates.showReviews ? 'max-h-none opacity-100' : 'max-h-0 opacity-0']">
        <ReviewsList
          :product-id="product.id"
          :user-id="userId"
          :can-write-review="canWriteReview"
          ref="reviewsList"
        />
      </div>
    </div>

    <!-- Technical Specs Section -->
    <ProductSpecs
      :product="product"
      :is-open="sectionStates.showSpecs"
      @toggle="sectionStates.showSpecs = !sectionStates.showSpecs"
    />

    <!-- Tags Section -->
    <ProductTags
      :tags="product.tags || []"
      :is-open="sectionStates.showTags"
      @toggle="sectionStates.showTags = !sectionStates.showTags"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '~/types/database'

interface Props {
  product: ProductWithCategory
  userId?: string
  canWriteReview: boolean
}

interface SectionStates {
  showDescription: boolean
  showReviews: boolean
  showSpecs: boolean
  showTags: boolean
}

const props = defineProps<Props>()

// Section states (default to open for better UX)
const sectionStates = reactive<SectionStates>({
  showDescription: true,
  showReviews: true,
  showSpecs: true,
  showTags: true
})

// Template refs
const reviewsList = ref(null)

// Expose the refs for parent component
defineExpose({
  reviewsList
})
</script>