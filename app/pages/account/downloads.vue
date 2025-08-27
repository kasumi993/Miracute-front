<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-heading font-medium text-gray-900">My Downloads</h1>
            <p class="text-gray-600 mt-1">Access all your purchased templates</p>
          </div>
          
          <NuxtLink to="/account" class="text-brand-brown hover:text-brand-brown/80 font-medium">
            ← Back to Account
          </NuxtLink>
        </div>
      </div>
    </section>

    <div class="container-custom py-12">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <nav class="space-y-2">
              <NuxtLink to="/account" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:home" class="w-5 h-5" />
                <span>Dashboard</span>
              </NuxtLink>
              
              <NuxtLink to="/account/downloads" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-900 bg-gray-100 font-medium">
                <NuxtIcon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                <span>Downloads</span>
              </NuxtLink>
              
              <NuxtLink to="/account/orders" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:shopping-bag" class="w-5 h-5" />
                <span>Order History</span>
              </NuxtLink>
              
              <NuxtLink to="/account/profile" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:user" class="w-5 h-5" />
                <span>Profile Settings</span>
              </NuxtLink>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Filters -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 class="text-xl font-medium text-gray-900">Your Downloads</h2>
              <p class="text-gray-600">{{ totalDownloads }} template{{ totalDownloads !== 1 ? 's' : '' }} available</p>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Filter by status -->
              <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All Downloads</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="limit-reached">Limit Reached</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div class="w-24 h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <!-- No Downloads -->
          <div v-else-if="filteredDownloads.length === 0" class="text-center py-16">
            <NuxtIcon name="heroicons:arrow-down-tray" class="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 class="text-xl font-heading font-medium text-gray-900 mb-2">
              <span v-if="filterStatus">No {{ filterStatus }} downloads found</span>
              <span v-else>No downloads yet</span>
            </h3>
            <p class="text-gray-600 mb-8">
              <span v-if="!filterStatus">Purchase some templates to see your downloads here.</span>
              <span v-else>Try changing the filter to see more results.</span>
            </p>
            <NuxtLink v-if="!filterStatus" to="/templates" class="btn-primary">
              Browse Templates
            </NuxtLink>
          </div>

          <!-- Downloads List -->
          <div v-else class="space-y-4">
            <div v-for="download in filteredDownloads" 
                 :key="download.id"
                 class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              
              <div class="flex items-center space-x-6">
                <!-- Product Image -->
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <NuxtImg 
                    v-if="download.product?.preview_images?.[0]"
                    :src="download.product.preview_images[0]"
                    :alt="download.product_name"
                    class="w-full h-full object-cover"
                  />
                  <Icon v-else name="heroicons:document" class="w-8 h-8 text-gray-400 m-4" />
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 mb-1">
                    <NuxtLink :to="`/templates/${download.product_slug}`" 
                              class="hover:text-brand-brown transition-colors">
                      {{ download.product_name }}
                    </NuxtLink>
                  </h3>
                  
                  <div class="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>Order #{{ download.order_number }}</span>
                    <span>{{ formatDate(download.created_at) }}</span>
                  </div>

                  <!-- Download Info -->
                  <div class="flex items-center space-x-6 text-xs text-gray-500">
                    <div class="flex items-center space-x-1">
                      <NuxtIcon name="heroicons:arrow-down-tray" class="w-3 h-3" />
                      <span>{{ download.download_count }}/{{ download.max_downloads }} downloads used</span>
                    </div>
                    
                    <div v-if="download.download_expires_at" class="flex items-center space-x-1">
                      <NuxtIcon name="heroicons:clock" class="w-3 h-3" />
                      <span>Expires {{ formatDate(download.download_expires_at) }}</span>
                    </div>

                    <div v-if="download.product?.file_formats?.length" class="flex items-center space-x-1">
                      <NuxtIcon name="heroicons:document" class="w-3 h-3" />
                      <span>{{ download.product.file_formats.join(', ') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Download Actions -->
                <div class="flex-shrink-0">
                  <!-- Download Button -->
                  <a v-if="canDownload(download)" 
                     :href="download.download_url"
                     target="_blank"
                     @click="trackDownload(download.id)"
                     class="btn-primary text-sm px-6 py-3">
                    <NuxtIcon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
                    Download
                  </a>
                  
                  <!-- Expired/Limit Reached States -->
                  <div v-else class="text-center">
                    <div v-if="download.is_expired" 
                         class="px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                      <NuxtIcon name="heroicons:clock" class="w-4 h-4 inline mr-1" />
                      Expired
                    </div>
                    
                    <div v-else-if="download.is_download_limit_reached" 
                         class="px-4 py-2 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-200">
                      <NuxtIcon name="heroicons:exclamation-triangle" class="w-4 h-4 inline mr-1" />
                      Limit Reached
                    </div>
                    
                    <p class="text-xs text-gray-500 mt-2">
                      <NuxtLink to="/contact" class="text-brand-brown hover:underline">
                        Need help? Contact support
                      </NuxtLink>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Progress Bar for Downloads -->
              <div class="mt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs text-gray-500">Download Usage</span>
                  <span class="text-xs text-gray-500">
                    {{ Math.round((download.download_count / download.max_downloads) * 100) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    class="bg-brand-sage h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min((download.download_count / download.max_downloads) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMore && !isLoading" class="text-center mt-8">
            <button @click="loadMore" 
                    :disabled="isLoadingMore"
                    class="btn-secondary">
              <span v-if="!isLoadingMore">Load More Downloads</span>
              <span v-else class="flex items-center space-x-2">
                <NuxtIcon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </span>
            </button>
          </div>

          <!-- Download Tips -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 class="font-medium text-blue-900 mb-3 flex items-center">
              <NuxtIcon name="heroicons:light-bulb" class="w-5 h-5 mr-2" />
              Download Tips
            </h3>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• Save downloaded files to a safe location on your computer</li>
              <li>• Downloads expire 30 days after purchase</li>
              <li>• You can download each template up to 5 times</li>
              <li>• Need more downloads? <NuxtLink to="/contact" class="underline hover:no-underline">Contact our support team</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'auth'
})

// SEO
useSeoMeta({
  title: 'My Downloads | Miracute',
  description: 'Access and download your purchased website templates.',
  robots: 'noindex, nofollow'
})

// State
const downloads = ref([])
const totalDownloads = ref(0)
const hasMore = ref(false)
const currentPage = ref(1)
const isLoading = ref(true)
const isLoadingMore = ref(false)
const filterStatus = ref('')

const DOWNLOADS_PER_PAGE = 10

// Computed
const filteredDownloads = computed(() => {
  if (!filterStatus.value) return downloads.value

  return downloads.value.filter(download => {
    switch (filterStatus.value) {
      case 'active':
        return !download.is_expired && !download.is_download_limit_reached
      case 'expired':
        return download.is_expired
      case 'limit-reached':
        return download.is_download_limit_reached
      default:
        return true
    }
  })
})

// Methods
const loadDownloads = async (page = 1, append = false) => {
  if (!append) {
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  try {
    const { data, pagination } = await $fetch('/api/account/downloads', {
      query: {
        limit: DOWNLOADS_PER_PAGE,
        offset: (page - 1) * DOWNLOADS_PER_PAGE
      }
    })

    if (append) {
      downloads.value = [...downloads.value, ...data]
    } else {
      downloads.value = data
    }

    totalDownloads.value = pagination.total
    hasMore.value = pagination.hasMore
    currentPage.value = page

  } catch (error) {
    console.error('Failed to load downloads:', error)
    useToast().error('Failed to load downloads')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = () => {
  if (!isLoadingMore.value && hasMore.value) {
    loadDownloads(currentPage.value + 1, true)
  }
}

const canDownload = (download) => {
  return !download.is_expired && !download.is_download_limit_reached && download.download_url
}

const trackDownload = async (downloadId) => {
  // Track the download attempt
  try {
    await $fetch(`/api/downloads/${downloadId}/track`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('Failed to track download:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Initialize
onMounted(async () => {
  await loadDownloads()
})
</script>