<template>
  <div class="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3 flex-1 min-w-0">
        <div class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
          {{ rank }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 truncate">{{ page.title }}</p>
          <p class="text-xs text-gray-500 truncate">{{ page.path }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-gray-900">{{ formatNumber(page.views) }}</p>
        <p class="text-xs text-gray-500">views</p>
      </div>
    </div>
    
    <!-- Progress bar -->
    <div class="mt-3 w-full bg-gray-200 rounded-full h-1.5">
      <div 
        class="bg-brand-brown h-1.5 rounded-full transition-all duration-300" 
        :style="{ width: progressWidth + '%' }"
      ></div>
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
  page: Page
  rank: number
  maxViews: number
}

const props = defineProps<Props>()

const progressWidth = computed(() => {
  return props.maxViews > 0 ? (props.page.views / props.maxViews) * 100 : 0
})

const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K'
  }
  return number.toString()
}
</script>