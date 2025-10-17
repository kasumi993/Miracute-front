<template>
  <ClientOnly>
    <!-- Loading State -->
    <div v-if="isCheckingAccess" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown mb-4"></div>
        <p class="text-gray-600 font-medium">Verifying access...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="hasAdminAccess">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-blue-600" />
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
                  <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-green-600" />
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
                  <Icon name="heroicons:users" class="w-6 h-6 text-purple-600" />
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
                  <Icon name="heroicons:squares-2x2" class="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
                  <p class="text-sm text-gray-600">Total Products</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:eye" class="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.storeViewsToday }}</p>
                  <p class="text-sm text-gray-600">Store Views Today</p>
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
                <NuxtLink to="/dashboard/orders" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                  View All →
                </NuxtLink>
              </div>

              <div v-if="recentOrders.length === 0" class="text-center py-8">
                <Icon name="heroicons:shopping-bag" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                <NuxtLink to="/dashboard/products" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                  View All →
                </NuxtLink>
              </div>

              <div v-if="popularProducts.length === 0" class="text-center py-8">
                <Icon name="heroicons:squares-2x2" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
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

          <!-- Business Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:banknotes" class="w-5 h-5 text-green-600" />
                </div>
                <h3 class="text-lg font-heading font-medium text-gray-900">Revenue Metrics</h3>
              </div>
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Monthly Revenue</span>
                  <span class="text-lg font-semibold text-green-600">${{ stats.monthlyRevenue }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Average Order Value</span>
                  <span class="text-lg font-semibold text-blue-600">${{ stats.averageOrderValue }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Completion Rate</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-semibold text-gray-900">{{ stats.orderCompletionRate }}%</span>
                    <div class="w-12 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-500 h-2 rounded-full" :style="`width: ${stats.orderCompletionRate}%`"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:chart-bar-square" class="w-5 h-5 text-indigo-600" />
                </div>
                <h3 class="text-lg font-heading font-medium text-gray-900">Store Performance</h3>
              </div>
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Views Today</span>
                  <span class="text-lg font-semibold text-indigo-600">{{ stats.storeViewsToday }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Pending Orders</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-semibold text-yellow-600">{{ stats.pendingOrders }}</span>
                    <span v-if="stats.pendingOrders > 0" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Needs attention
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Active Products</span>
                  <span class="text-lg font-semibold text-gray-900">{{ stats.totalProducts }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:arrow-trending-up" class="w-5 h-5 text-purple-600" />
                </div>
                <h3 class="text-lg font-heading font-medium text-gray-900">Growth Insights</h3>
              </div>
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Total Customers</span>
                  <span class="text-lg font-semibold text-purple-600">{{ stats.totalCustomers }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Conversion Rate</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-semibold text-gray-900">
                      {{ stats.storeViewsToday > 0 ? ((stats.totalOrders / stats.storeViewsToday * 100) || 0).toFixed(1) : 0 }}%
                    </span>
                    <div class="w-12 bg-gray-200 rounded-full h-2">
                      <div class="bg-purple-500 h-2 rounded-full" 
                           :style="`width: ${stats.storeViewsToday > 0 ? Math.min(((stats.totalOrders / stats.storeViewsToday * 100) || 0), 100) : 0}%`"></div>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600">Revenue per Customer</span>
                  <span class="text-lg font-semibold text-green-600">
                    ${{ stats.totalCustomers > 0 ? (parseFloat(stats.totalRevenue) / stats.totalCustomers).toFixed(2) : '0.00' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 class="text-xl font-heading font-medium text-gray-900 mb-6">Quick Actions</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <NuxtLink to="/dashboard/products/create" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <Icon name="heroicons:plus" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">Add Product</span>
              </NuxtLink>

              <NuxtLink to="/dashboard/categories/create" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <Icon name="heroicons:folder-plus" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">Add Category</span>
              </NuxtLink>

              <NuxtLink to="/dashboard/orders?status=pending" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <Icon name="heroicons:clock" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">Pending Orders</span>
              </NuxtLink>

              <NuxtLink to="/dashboard/analytics" 
                        class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-sage hover:bg-gray-50 transition-colors">
                <Icon name="heroicons:chart-bar" class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-700">View Analytics</span>
              </NuxtLink>
            </div>
          </div>
    </div>

    <!-- Fallback for SSR -->
    <template #fallback>
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown mb-4"></div>
          <p class="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup>
// Imports
import { useAdminDashboardStore } from '~/stores/admin/dashboard'
import { useUserStore } from '~/stores/auth/user'

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

// Stores
const adminDashboardStore = useAdminDashboardStore()
const userStore = useUserStore()

// Computed from stores
const isCheckingAccess = computed(() => !userStore.isInitialized)
const hasAdminAccess = computed(() => userStore.isAdmin)
const stats = computed(() => ({
  totalRevenue: adminDashboardStore.totalRevenue || 0,
  totalOrders: adminDashboardStore.totalOrders || 0,
  totalCustomers: adminDashboardStore.totalCustomers || 0,
  totalProducts: adminDashboardStore.totalProducts || 0,
  monthlyRevenue: adminDashboardStore.totalRevenue || 0,
  averageOrderValue: adminDashboardStore.averageOrderValue || 0,
  orderCompletionRate: adminDashboardStore.conversionRate || 0,
  storeViewsToday: 0,
  pendingOrders: adminDashboardStore.pendingOrdersCount || 0
}))
const recentOrders = computed(() => adminDashboardStore.stats?.recentOrders || [])
const popularProducts = computed(() => adminDashboardStore.stats?.topProducts || [])


// Methods
const loadDashboardData = async () => {
  try {
    console.log('Starting to load dashboard data...')

    // Load dashboard data through store
    await adminDashboardStore.initialize()

  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    useToast().error(`Failed to load dashboard: ${error.statusMessage || error.message}`)
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

// Load dashboard data when component mounts
onMounted(async () => {
  console.log('Dashboard mounted, loading data...')
  await loadDashboardData()
})
</script>