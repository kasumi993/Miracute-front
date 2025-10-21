<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
    <div v-for="n in 4" :key="n" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div class="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>

  <!-- Visitor Metrics Cards -->
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
    <!-- Total Visitors -->
    <AnalyticsCard
      :title="`${periodLabel} Visitors`"
      :value="analytics.visitors"
      :change="analytics.visitorsChange"
      icon="heroicons:users"
      icon-color="blue"
      :show-change="true"
    />

    <!-- Page Views -->
    <AnalyticsCard
      title="Page Views"
      :value="analytics.pageViews"
      :change="analytics.pageViewsChange"
      icon="heroicons:eye"
      icon-color="green"
      :show-change="true"
    />

    <!-- Product Views -->
    <AnalyticsCard
      title="Product Views"
      :value="analytics.productViews"
      :subtitle="analytics.pageViews && analytics.productViews ? `${Math.round((analytics.productViews / analytics.pageViews) * 100)}% of all page views` : ''"
      icon="heroicons:shopping-bag"
      icon-color="purple"
      :show-change="false"
    />

    <!-- Add to Carts -->
    <AnalyticsCard
      title="Add to Carts"
      :value="analytics.addToCarts"
      :subtitle="analytics.productViews && analytics.addToCarts ? `${Math.round((analytics.addToCarts / analytics.productViews) * 100)}% conversion rate` : ''"
      icon="heroicons:shopping-cart"
      icon-color="orange"
      :show-change="false"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  analytics: {
    visitors: number
    visitorsChange: number
    pageViews: number
    pageViewsChange: number
    productViews: number
    addToCarts: number
  }
  isLoading: boolean
  periodLabel: string
}

defineProps<Props>()
</script>