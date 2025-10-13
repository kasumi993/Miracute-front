<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-heading font-medium text-gray-900">Your Downloads</h2>
      <div class="text-sm text-gray-500">
        {{ userDownloads.length }} template{{ userDownloads.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <div v-if="userDownloads.length === 0" class="text-center py-8">
      <Icon name="heroicons:arrow-down-tray" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">No downloads yet</p>
      <NuxtLink to="/listings" class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm mt-2 block">
        Browse Templates →
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="download in userDownloads"
        :key="download.id"
        class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
      >
        <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <NuxtImg
            v-if="download.product?.preview_images?.[0]"
            :src="download.product.preview_images[0]"
            :alt="download.product_name"
            class="w-full h-full object-cover"
          />
          <Icon v-else name="heroicons:document" class="w-6 h-6 text-gray-400 m-3" />
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900">{{ download.product_name }}</h3>
          <p class="text-sm text-gray-600">
            Available for download
          </p>
        </div>

        <div class="flex-shrink-0">
          <button
            @click="initiateDownload(download.id)"
            :disabled="downloadingItems.includes(download.id)"
            class="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="downloadingItems.includes(download.id)" name="heroicons:arrow-path" class="w-4 h-4 mr-1 animate-spin" />
            <Icon v-else name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
            {{ downloadingItems.includes(download.id) ? 'Preparing...' : 'Download' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userDownloads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// Internal state for downloading items
const downloadingItems = ref([])

const initiateDownload = async (orderItemId) => {
  if (downloadingItems.value.includes(orderItemId)) return

  try {
    downloadingItems.value.push(orderItemId)

    // Get secure download URL using service
    const response = await OrderService.getDownloadUrl(orderItemId)

    if (response.success && response.data.downloadUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = response.data.fileName || 'download.zip'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Show success message
      useToast().success('Download started successfully!')

      // Emit refresh event to parent
      emit('refresh')
    } else {
      throw new Error(response.error || 'Failed to generate download link')
    }
  } catch (error) {
    console.error('Download error:', error)
    useToast().error(error.message || 'Failed to download file')
  } finally {
    // Remove from downloading list
    const index = downloadingItems.value.indexOf(orderItemId)
    if (index > -1) {
      downloadingItems.value.splice(index, 1)
    }
  }
}
</script>