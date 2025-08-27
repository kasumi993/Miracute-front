<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Admin Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="container-custom py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-heading font-medium text-gray-900">Admin Dashboard</h1>
            <p class="text-gray-600 mt-1">Manage your Miracute platform</p>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-brand-brown hover:text-brand-brown/80 font-medium">
              ← Back to Site
            </NuxtLink>
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <NuxtIcon name="heroicons:shield-check" class="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-custom py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <nav class="space-y-2">
              <NuxtLink to="/admin" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-900 bg-gray-100 font-medium">
                <NuxtIcon name="heroicons:home" class="w-5 h-5" />
                <span>Dashboard</span>
              </NuxtLink>
              
              <NuxtLink to="/admin/products" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:squares-2x2" class="w-5 h-5" />
                <span>Products</span>
                <span v-if="stats.totalProducts" 
                      class="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {{ stats.totalProducts }}
                </span>
              </NuxtLink>
              
              <NuxtLink to="/admin/categories" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:folder" class="w-5 h-5" />
                <span>Categories</span>
              </NuxtLink>
              
              <NuxtLink to="/admin/orders" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:shopping-bag" class="w-5 h-5" />
                <span>Orders</span>
                <span v-if="stats.pendingOrders" 
                      class="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {{ stats.pendingOrders }}
                </span>
              </NuxtLink>
              
              <NuxtLink to="/admin/customers" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:users" class="w-5 h-5" />
                <span>Customers</span>
              </NuxtLink>
              
              <NuxtLink to="/admin/analytics" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <NuxtIcon name="heroicons:chart-bar" class="w-5 h-5" />
                <span>Analytics</span>
              </NuxtLink>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <NuxtIcon name="heroicons:currency-dollar" class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">${{ stats.totalRevenue }}</p>
                  <p class="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <NuxtIcon name="heroicons:shopping-bag" class="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
                  <p class="text-sm text-gray-600">Total Orders</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <NuxtIcon name="heroicons:users" class="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalCustomers }}</p>
                  <p class="text-sm text-gray-600">Total Customers</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <NuxtIcon name="heroicons:squares-2x2" class="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
                  <p class="text-sm text-gray-600">Total Products</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Recent Orders -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-heading font-medium text-gray-900">Recent Orders</h2>
                <NuxtLink to="/admin/orders" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                  View All →
                </NuxtLink>
              </div>

              <div v-if="recentOrders.length === 0" class="text-center py-8">
                <NuxtIcon name="heroicons:shopping-bag" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">No recent orders</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="order in recentOrders" 
                     :key="order.id"
                     class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">#{{ order.order_number }}</p>
                    <p class="text-sm text-gray-600">{{ order.customer_email }}</p>
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

            <!-- Popular Products -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-heading font-medium text-gray-900">Popular Products</h2>
                <NuxtLink to="/admin/products" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                  View All →
                </NuxtLink>
              </div>

              <div v-if="popularProducts.length === 0" class="text-center py-8">
                <NuxtIcon name="heroicons:squares-2x2" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">No products data</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="product in popularProducts" 
                     :key="product.id"
                     class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <NuxtImg 
                      v-if="product.preview_images?.[0]"
                      :src="product.preview_images[0]"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <Icon v-else name="heroicons:squares-2x2" class="w-6 h-6 text-gray-400 m-3" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ product.name }}</p>
                    <p class="text-sm text-gray-600">${{ parseFloat(product.price).toFixed(2) }}</p>
                  </div>

                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ product.view_count || 0 }} views</p>
                    <p class="text-sm text-gray-600">{{ product.download_count || 0 }} downloads</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 class="text-xl font-heading font-medium text-gray-900 mb-6">Quick Actions</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <NuxtLink to="/admin/products/create" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <NuxtIcon name="heroicons:plus" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">Add Product</span>
              </NuxtLink>

              <NuxtLink to="/admin/categories/create" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <NuxtIcon name="heroicons:folder-plus" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">Add Category</span>
              </NuxtLink>

              <NuxtLink to="/admin/orders?status=pending" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <NuxtIcon name="heroicons:clock" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">Pending Orders</span>
              </NuxtLink>

              <NuxtLink to="/admin/analytics" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <NuxtIcon name="heroicons:chart-bar" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">View Analytics</span>
              </NuxtLink>
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
  middleware: 'admin',
  layout: 'admin'
})

// SEO
useSeoMeta({
  title: 'Admin Dashboard | Miracute',
  description: 'Manage your Miracute platform - products, orders, customers and analytics.',
  robots: 'noindex, nofollow'
})

// State
const stats = ref({
  totalRevenue: '0.00',
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
  pendingOrders: 0
})

const recentOrders = ref([])
const popularProducts = ref([])
const isLoading = ref(true)

// Methods
const loadDashboardData = async () => {
  try {
    // Load dashboard statistics and recent data
    const [statsData, ordersData, productsData] = await Promise.all([
      $fetch('/api/admin/stats'),
      $fetch('/api/admin/orders?limit=5'),
      $fetch('/api/admin/products/popular?limit=5')
    ])

    stats.value = statsData.data || stats.value
    recentOrders.value = ordersData.data || []
    popularProducts.value = productsData.data || []

  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    useToast().error('Failed to load dashboard information')
  } finally {
    isLoading.value = false
  }
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
  await loadDashboardData()
})
</script>