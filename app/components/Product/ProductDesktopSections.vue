<template>
  <div class="hidden lg:block space-y-6">
    <!-- Description -->
    <ProductDescription
      :description="product.description || ''"
      :is-open="true"
      @toggle="() => {}"
    />

    <!-- Technical Specs -->
    <ProductSpecs
      :product="product"
      :is-open="true"
      @toggle="() => {}"
    />

    <!-- Tags -->
    <ProductTags
      :tags="product.tags || []"
      :is-open="true"
      @toggle="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '~/types/database'

interface Props {
  product: ProductWithCategory
}

defineProps<Props>()
</script>