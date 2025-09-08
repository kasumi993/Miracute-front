<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
    <div class="p-4 sm:p-6 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-900">Most Visited Pages</h2>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="p-4 sm:p-6 space-y-4">
      <div v-for="n in 5" :key="n" class="animate-pulse flex items-center justify-between">
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="topPages.length === 0" class="p-8 text-center text-gray-500">
      <Icon name="heroicons:chart-bar" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-medium mb-2">No page data available</p>
      <p class="text-sm">Page visit data will appear here once tracking begins</p>
    </div>

    <!-- Pages List -->
    <div v-else class="divide-y divide-gray-200">
      <AnalyticsTopPageItem
        v-for="(page, index) in topPages"
        :key="page.path"
        :page="page"
        :rank="index + 1"
        :max-views="topPages[0]?.views || 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Page {
  path: string
  title: string
  views: number
}

interface Props {
  topPages: Page[]
  isLoading: boolean
}

defineProps<Props>()
</script>