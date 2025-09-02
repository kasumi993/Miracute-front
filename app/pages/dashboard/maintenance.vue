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

    <!-- Run Task Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Manual Task Execution</h2>
      <p class="text-gray-600 mb-4">
        Run maintenance tasks manually using the task runner.
      </p>
      
      <div class="flex items-center space-x-4">
        <button
          @click="runTask"
          :disabled="isRunningTask"
          class="btn-outline"
        >
          <Icon 
            :name="isRunningTask ? 'heroicons:arrow-path' : 'heroicons:cog-6-tooth'" 
            :class="['w-5 h-5 mr-2', { 'animate-spin': isRunningTask }]" 
          />
          {{ isRunningTask ? 'Running Task...' : 'Run Cleanup Task' }}
        </button>
      </div>
      
      <!-- Task Results -->
      <div v-if="taskResult" class="mt-4 p-4 rounded-lg" :class="taskResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <div class="flex items-start">
          <Icon 
            :name="taskResult.success ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
            :class="['w-5 h-5 mr-2 mt-0.5', taskResult.success ? 'text-green-600' : 'text-red-600']" 
          />
          <div>
            <p :class="['font-medium', taskResult.success ? 'text-green-800' : 'text-red-800']">
              Task {{ taskResult.success ? 'completed successfully' : 'failed' }}
            </p>
            <pre v-if="taskResult.details" class="mt-2 text-xs overflow-auto max-h-32" :class="taskResult.success ? 'text-green-700' : 'text-red-700'">{{ JSON.stringify(taskResult.details, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const isRunningTask = ref(false)
const cleanupResult = ref<any>(null)
const taskResult = ref<any>(null)

// Run image cleanup via API
const runImageCleanup = async () => {
  isRunningCleanup.value = true
  cleanupResult.value = null
  
  try {
    const response = await $fetch('/api/admin/cleanup-images', {
      method: 'POST'
    })
    
    cleanupResult.value = {
      success: true,
      message: response.message,
      details: {
        totalFiles: response.totalFiles,
        orphanedFiles: response.orphanedFiles,
        deletedCount: response.deletedCount,
        usedImages: response.usedImages
      }
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

// Run task via task runner
const runTask = async () => {
  isRunningTask.value = true
  taskResult.value = null
  
  try {
    // Note: In production, you would call this via a proper task runner API
    // For now, we'll just call the cleanup API
    const response = await $fetch('/api/admin/cleanup-images', {
      method: 'POST'
    })
    
    taskResult.value = {
      success: true,
      details: response
    }
    
    useToast().success('Task completed successfully')
    
  } catch (error: any) {
    taskResult.value = {
      success: false,
      details: error.data || error.message
    }
    
    useToast().error('Task failed')
  } finally {
    isRunningTask.value = false
  }
}
</script>