<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-heading font-medium text-gray-900">
              Your Downloads
            </h1>
            <p class="text-gray-600 mt-1">Access all your purchased templates and manage your preferences</p>
          </div>
          
          <div class="hidden sm:flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-500">Member since</p>
              <p class="font-medium">
                {{ formatDate(user?.created_at) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-brand-pink rounded-full flex items-center justify-center text-lg font-medium text-gray-700">
              {{ getUserInitials() }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container-custom py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <nav class="space-y-2">
              <NuxtLink to="/account" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-900 bg-gray-100 font-medium">
                <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                <span>My Downloads</span>
              </NuxtLink>
              
              <NuxtLink to="/account/preferences" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
                <span>Preferences</span>
              </NuxtLink>
              
              <div class="border-t border-gray-200 pt-2 mt-2">
                <button @click="auth.signOut()" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors w-full text-left">
                  <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:arrow-down-tray" class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalDownloads }}</p>
                  <p class="text-sm text-gray-600">Downloads</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
                  <p class="text-sm text-gray-600">Orders</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">${{ stats.totalSpent }}</p>
                  <p class="text-sm text-gray-600">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-heading font-medium text-gray-900">Recent Orders</h2>
              <NuxtLink to="/account/orders" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                View All →
              </NuxtLink>
            </div>

            <div v-if="recentOrders.length === 0" class="text-center py-8">
              <Icon name="heroicons:shopping-bag" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">No orders yet</p>
              <NuxtLink to="/templates" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                Start shopping →
              </NuxtLink>
            </div>

            <div v-else class="space-y-4">
              <div v-for="order in recentOrders" 
                   :key="order.id"
                   class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon name="heroicons:shopping-bag" class="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">#{{ order.order_number }}</p>
                    <p class="text-sm text-gray-600">{{ formatDate(order.created_at) }}</p>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="font-medium text-gray-900">${{ parseFloat(order.total_amount).toFixed(2) }}</p>
                  <p class="text-sm" :class="getStatusColor(order.status)">
                    {{ capitalizeFirst(order.status) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Downloads -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-heading font-medium text-gray-900">Recent Downloads</h2>
              <NuxtLink to="/account/downloads" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                View All →
              </NuxtLink>
            </div>

            <div v-if="recentDownloads.length === 0" class="text-center py-8">
              <Icon name="heroicons:arrow-down-tray" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">No downloads yet</p>
            </div>

            <div v-else class="space-y-4">
              <div v-for="download in recentDownloads" 
                   :key="download.id"
                   class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
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
                    {{ download.download_count }}/{{ download.max_downloads }} downloads used
                  </p>
                </div>

                <div class="flex-shrink-0">
                  <button
                    v-if="download.download_count < download.max_downloads"
                    @click="initiateDownload(download.id)"
                    :disabled="downloadingItems.includes(download.id)"
                    class="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Icon v-if="downloadingItems.includes(download.id)" name="heroicons:arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                    <Icon v-else name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
                    {{ downloadingItems.includes(download.id) ? 'Preparing...' : 'Download' }}
                  </button>
                  <span v-else class="text-sm text-gray-500">Limit Reached</span>
                </div>
              </div>
            </div>
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
  title: 'My Account | Miracute',
  description: 'Manage your Miracute account, view your orders and downloads.',
  robots: 'noindex, nofollow'
})

// Composables
const user = useSupabaseUser()
const auth = useAuth() // Keep for backwards compatibility with signOut method

// Services
import { AccountService } from '~/services'

// State
const stats = ref({
  totalDownloads: 0,
  totalOrders: 0,
  totalSpent: '0.00'
})

const recentOrders = ref([])
const recentDownloads = ref([])
const isLoading = ref(true)
const downloadingItems = ref([])

// Methods
const loadAccountData = async () => {
  try {
    // Load account statistics and recent data
    const [statsResult, ordersResult, downloadsResult] = await Promise.allSettled([
      AccountService.getAccountStats(),
      AccountService.getUserOrders(1, 5),
      AccountService.getUserDownloads(1, 5)
    ])

    // Handle stats
    if (statsResult.status === 'fulfilled' && statsResult.value?.success) {
      stats.value = statsResult.value.data || stats.value
    } else {
      console.warn('Failed to load stats:', statsResult.status === 'rejected' ? statsResult.reason : statsResult.value?.error)
    }

    // Handle orders
    if (ordersResult.status === 'fulfilled' && ordersResult.value?.success) {
      recentOrders.value = ordersResult.value.data || []
    } else {
      console.warn('Failed to load orders:', ordersResult.status === 'rejected' ? ordersResult.reason : ordersResult.value?.error)
    }

    // Handle downloads
    if (downloadsResult.status === 'fulfilled' && downloadsResult.value?.success) {
      recentDownloads.value = downloadsResult.value.data || []
    } else {
      console.warn('Failed to load downloads:', downloadsResult.status === 'rejected' ? downloadsResult.reason : downloadsResult.value?.error)
    }

  } catch (error) {
    console.error('Failed to load account data:', error)
    // Don't show error toast, just log it since we're handling individual failures above
  } finally {
    isLoading.value = false
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

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'text-green-600'
    case 'processing':
      return 'text-yellow-600'
    case 'pending':
      return 'text-blue-600'
    case 'cancelled':
    case 'refunded':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const getUserInitials = () => {
  if (!user.value?.user_metadata?.full_name) {
    return user.value?.email?.charAt(0).toUpperCase() || 'U'
  }
  const names = user.value.user_metadata.full_name.split(' ')
  return names.length > 1
    ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    : names[0].charAt(0).toUpperCase()
}

const initiateDownload = async (orderItemId) => {
  if (downloadingItems.value.includes(orderItemId)) return

  try {
    downloadingItems.value.push(orderItemId)

    // Get secure download URL from API
    const response = await $fetch(`/api/downloads/${orderItemId}`)

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

      // Refresh the downloads list to update counts
      await loadAccountData()
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

// Initialize
onMounted(async () => {
  await loadAccountData()
})
</script>