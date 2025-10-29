<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
      <div class="min-w-0 flex-1">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900">
          Product Bundles
        </h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Create and manage product bundle offers
        </p>
      </div>
      <div class="flex-shrink-0">
        <NuxtLink to="/dashboard/bundles/create" class="btn-primary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg inline-flex">
          <Icon name="heroicons:plus" class="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-1.5" />
          <span>Create Bundle</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
      <DashboardStatsCard
        icon="heroicons:squares-plus"
        icon-color="text-brand-sage"
        :value="stats.totalBundles"
        label="Total Bundles"
      />

      <DashboardStatsCard
        icon="heroicons:eye"
        icon-color="text-brand-brown"
        :value="stats.activeBundles"
        label="Active"
      />

      <DashboardStatsCard
        icon="heroicons:star"
        icon-color="text-brand-pink"
        :value="stats.featuredBundles"
        label="Featured"
      />

      <DashboardStatsCard
        icon="heroicons:currency-dollar"
        icon-color="text-green-600"
        :value="stats.totalSavings"
        label="Total Savings"
        format-as-currency
      />
    </div>

    <!-- Bundles List -->
    <div class="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown"></div>
        <p class="text-gray-600 mt-2">Loading bundles...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="bundles.length === 0" class="p-8 text-center">
        <Icon name="heroicons:squares-plus" class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No bundles yet</h3>
        <p class="text-gray-600 mb-6">Create your first product bundle to start offering savings to customers.</p>
        <NuxtLink to="/dashboard/bundles/create" class="btn-primary inline-flex items-center">
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          Create Bundle
        </NuxtLink>
      </div>

      <!-- Bundles Grid -->
      <div v-else class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="bundle in bundles"
            :key="bundle.id"
            class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <!-- Bundle Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 text-lg">{{ bundle.name }}</h3>
                <p v-if="bundle.description" class="text-gray-600 text-sm mt-1 line-clamp-2">
                  {{ bundle.description }}
                </p>
              </div>
              <div class="ml-4 flex items-center space-x-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    bundle.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ bundle.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span
                  v-if="bundle.featured"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                >
                  Featured
                </span>
              </div>
            </div>

            <!-- Pricing -->
            <div class="mb-4">
              <div class="flex items-baseline space-x-2">
                <span class="text-2xl font-bold text-gray-900">${{ bundle.bundle_price }}</span>
                <span class="text-sm text-gray-500 line-through">${{ bundle.original_price }}</span>
              </div>
              <div class="text-sm text-green-600 font-medium">
                Save ${{ (bundle.original_price - bundle.bundle_price).toFixed(2) }}
                ({{ bundle.discount_percentage }}%)
              </div>
            </div>

            <!-- Products Display -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600 font-medium">
                  {{ bundle.products?.length || 0 }} product{{ (bundle.products?.length || 0) !== 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Product thumbnails -->
              <div v-if="bundle.product_details && bundle.product_details.length > 0" class="space-y-2">
                <div
                  v-for="product in bundle.product_details.slice(0, 3)"
                  :key="product.id"
                  class="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                >
                  <img
                    v-if="product.preview_images?.[0]"
                    :src="product.preview_images[0]"
                    :alt="product.name"
                    class="w-8 h-8 object-cover rounded"
                  />
                  <div v-else class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-4 h-4 text-gray-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-gray-900 truncate">{{ product.name }}</p>
                    <p class="text-xs text-gray-500">${{ product.price }}</p>
                  </div>
                </div>

                <!-- Show "and X more" if there are more than 3 products -->
                <div v-if="bundle.product_details.length > 3" class="text-xs text-gray-500 pl-2">
                  + {{ bundle.product_details.length - 3 }} more product{{ bundle.product_details.length - 3 !== 1 ? 's' : '' }}
                </div>
              </div>

              <!-- Fallback when no product details are loaded -->
              <div v-else-if="bundle.products?.length > 0" class="text-xs text-gray-500 italic">
                Loading product details...
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
              <NuxtLink
                :to="`/dashboard/bundles/create?id=${bundle.id}`"
                class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center font-medium"
              >
                Edit
              </NuxtLink>
              <button
                @click="deleteBundle(bundle.id)"
                class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BundleService } from '@/services/BundleService'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Bundles | Dashboard',
  robots: 'noindex, nofollow'
})

const isLoading = ref(true)
const bundles = ref<any[]>([])
const stats = ref({
  totalBundles: 0,
  activeBundles: 0,
  featuredBundles: 0,
  totalSavings: 0
})

const loadBundles = async () => {
  try {
    isLoading.value = true
    const response = await BundleService.getBundles()

    if (response.success && response.data) {
      bundles.value = response.data.bundles || []
      if (response.data.stats) {
        stats.value = {
          totalBundles: response.data.stats.totalBundles || 0,
          activeBundles: response.data.stats.activeBundles || 0,
          featuredBundles: response.data.stats.featuredBundles || 0,
          totalSavings: response.data.stats.totalSavings || 0
        }
      }
    } else {
      console.error('Error loading bundles:', response.error)
    }
  } catch (error: any) {
    console.error('Error loading bundles:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteBundle = async (bundleId: string) => {
  if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
    return
  }

  try {
    const response = await BundleService.delete(bundleId)
    if (response.success) {
      // Remove from local list
      const index = bundles.value.findIndex(b => b.id === bundleId)
      if (index > -1) {
        bundles.value.splice(index, 1)
      }
      // Update stats
      stats.value.totalBundles = Math.max(0, stats.value.totalBundles - 1)
    } else {
      console.error('Error deleting bundle:', response.error)
      alert('Failed to delete bundle')
    }
  } catch (error: any) {
    console.error('Error deleting bundle:', error)
    alert('Failed to delete bundle')
  }
}

// Load data on mount
onMounted(() => {
  loadBundles()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>