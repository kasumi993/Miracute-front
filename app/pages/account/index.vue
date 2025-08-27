<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-heading font-medium text-gray-900">
              Welcome back, {{ auth.authUser.value?.full_name || 'there' }}!
            </h1>
            <p class="text-gray-600 mt-1">Manage your account and downloads</p>
          </div>
          
          <div class="hidden sm:flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-500">Member since</p>
              <p class="font-medium">
                {{ formatDate(auth.authUser.value?.created_at) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-brand-pink rounded-full flex items-center justify-center text-lg font-medium text-gray-700">
              {{ auth.userInitials.value }}
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
                <Icon name="heroicons:home" class="w-5 h-5" />
                <span>Dashboard</span>
              </NuxtLink>
              
              <NuxtLink to="/account/downloads" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                <span>Downloads</span>
              </NuxtLink>
              
              <NuxtLink to="/account/orders" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Icon name="heroicons:shopping-bag" class="w-5 h-5" />
                <span>Order History</span>
              </NuxtLink>
              
              <NuxtLink to="/account/profile" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Icon name="heroicons:user" class="w-5 h-5" />
                <span>Profile Settings</span>
              </NuxtLink>
              
              <hr class="border-gray-200 my-4">
              
              <button @click="auth.signOut()" 
                      class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full text-left">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
                <span>Sign Out</span>
              </button>
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
                  <a v-if="download.download_url" 
                     :href="download.download_url"
                     target="_blank"
                     class="btn-primary text-sm px-4 py-2">
                    <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
                    Download
                  </a>
                  <span v-else class="text-sm text-gray-500">Expired</span>
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
const auth = useAuth()

// State
const stats = ref({
  totalDownloads: 0,
  totalOrders: 0,
  totalSpent: '0.00'
})

const recentOrders = ref([])
const recentDownloads = ref([])
const isLoading = ref(true)

// Methods
const loadAccountData = async () => {
  try {
    // Load account statistics and recent data
    const [statsData, ordersData, downloadsData] = await Promise.all([
      $fetch('/api/account/stats'),
      $fetch('/api/account/orders?limit=5'),
      $fetch('/api/account/downloads?limit=5')
    ])

    stats.value = statsData.data || stats.value
    recentOrders.value = ordersData.data || []
    recentDownloads.value = downloadsData.data || []

  } catch (error) {
    console.error('Failed to load account data:', error)
    useToast().error('Failed to load account information')
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

// Initialize
onMounted(async () => {
  await loadAccountData()
})
</script>