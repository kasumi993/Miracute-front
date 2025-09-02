<template>
  <tr v-if="type === 'desktop'" class="animate-pulse">
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="flex-shrink-0 h-12 w-12">
          <div class="h-12 w-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div class="ml-4">
          <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-4 bg-gray-200 rounded w-12"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-6 bg-gray-200 rounded-full w-16"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-right">
      <div class="flex items-center justify-end space-x-2">
        <div class="h-8 w-8 bg-gray-200 rounded"></div>
        <div class="h-8 w-8 bg-gray-200 rounded"></div>
        <div class="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>

  <div v-else-if="type === 'card'" class="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Image skeleton -->
    <div class="w-full h-48 bg-gray-200"></div>
    
    <!-- Content skeleton -->
    <div class="p-4">
      <!-- Title -->
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <!-- Category -->
      <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      
      <!-- Price and status -->
      <div class="flex items-center justify-between mb-3">
        <div class="h-5 bg-gray-200 rounded w-16"></div>
        <div class="h-4 w-4 bg-gray-200 rounded"></div>
      </div>
      
      <!-- Stats row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="h-3 bg-gray-200 rounded w-8"></div>
          <div class="h-3 bg-gray-200 rounded w-8"></div>
        </div>
        <div class="h-3 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  </div>

  <div v-else class="animate-pulse p-4 border-b border-gray-200">
    <div class="flex items-start space-x-4">
      <!-- Product Image -->
      <div class="flex-shrink-0">
        <div class="h-16 w-16 bg-gray-200 rounded-lg"></div>
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div>
            <div class="h-3 bg-gray-200 rounded w-20 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div>
            <div class="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            <div class="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div>
            <div class="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'desktop' | 'mobile' | 'card'
}

withDefaults(defineProps<Props>(), {
  type: 'desktop'
})
</script>