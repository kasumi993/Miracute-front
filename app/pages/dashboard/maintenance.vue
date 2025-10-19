<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-medium text-gray-900">Maintenance</h1>
      <p class="text-gray-600 mt-2">System maintenance and cleanup tools</p>
    </div>

    <!-- Image Cleanup Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Image Cleanup</h2>
      <p class="text-gray-600 mb-4">
        Clean up orphaned images that are not linked to any product.
        This will delete all unused images from storage immediately.
      </p>
      
      <div class="flex items-center space-x-4">
        <button
          @click="runImageCleanup"
          :disabled="isRunningCleanup"
          class="btn-primary"
        >
          <Icon 
            :name="isRunningCleanup ? 'heroicons:arrow-path' : 'heroicons:trash'" 
            :class="['w-5 h-5 mr-2', { 'animate-spin': isRunningCleanup }]" 
          />
          {{ isRunningCleanup ? 'Running Cleanup...' : 'Run Image Cleanup' }}
        </button>
      </div>
      
      <!-- Cleanup Results -->
      <div v-if="cleanupResult" class="mt-4 p-4 rounded-lg" :class="cleanupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <div class="flex items-start">
          <Icon 
            :name="cleanupResult.success ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
            :class="['w-5 h-5 mr-2 mt-0.5', cleanupResult.success ? 'text-green-600' : 'text-red-600']" 
          />
          <div>
            <p :class="['font-medium', cleanupResult.success ? 'text-green-800' : 'text-red-800']">
              {{ cleanupResult.message }}
            </p>
            <div v-if="cleanupResult.success && cleanupResult.details" class="mt-2 text-sm text-green-700">
              <p>• Total files in storage: {{ cleanupResult.details.totalFiles }}</p>
              <p>• Orphaned files found: {{ cleanupResult.details.orphanedFiles }}</p>
              <p>• Files deleted: {{ cleanupResult.details.deletedCount }}</p>
              <p>• Images currently in use: {{ cleanupResult.details.usedImages }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AdminService } from '@/services'
// Middleware and SEO
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Maintenance | Dashboard',
  description: 'System maintenance and cleanup tools',
  robots: 'noindex, nofollow'
})

// State
const isRunningCleanup = ref(false)
const cleanupResult = ref<any>(null)

// Run image cleanup via service
const runImageCleanup = async () => {
  isRunningCleanup.value = true
  cleanupResult.value = null

  try {
    const response = await AdminService.cleanupImages()

    if (response.success && response.data) {
      cleanupResult.value = {
        success: true,
        message: response.data.message,
        details: {
          totalFiles: response.data.totalFiles,
          orphanedFiles: response.data.orphanedFiles,
          deletedCount: response.data.deletedCount,
          usedImages: response.data.usedImages
        }
      }
    } else {
      throw new Error(response.error || 'Cleanup failed')
    }
    
    useToast().success(response.message)
    
  } catch (error: any) {
    cleanupResult.value = {
      success: false,
      message: error.data?.message || 'Cleanup failed'
    }
    
    useToast().error('Cleanup failed')
  } finally {
    isRunningCleanup.value = false
  }
}
</script>