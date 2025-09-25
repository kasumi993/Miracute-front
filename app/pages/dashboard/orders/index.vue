<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />
  
  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-heading font-medium text-gray-900">Orders</h1>
        <p class="text-gray-600 mt-2">Manage customer orders and payments</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Order number, customer..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
            @input="debouncedSearch"
          />
        </div>
        
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
            @change="fetchOrders"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        
        <!-- Payment Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Payment</label>
          <select
            v-model="filters.paymentStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
            @change="fetchOrders"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        
        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
            @change="fetchOrders"
          />
        </div>
      </div>
    </div>

    <!-- Orders List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-flex items-center px-4 py-2 text-gray-600">
          <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
          Loading orders...
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!orders.length" class="p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
          <Icon name="heroicons:shopping-bag" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p class="text-gray-600">Orders will appear here when customers make purchases.</p>
      </div>

      <!-- Orders Table -->
      <div v-else class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                <!-- Order Number -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      #{{ order.order_number }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ order.id.slice(0, 8) }}...
                    </div>
                  </div>
                </td>
                
                <!-- Customer -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ order.customer_name || 'Guest' }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ order.customer_email }}
                    </div>
                  </div>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    :value="order.status"
                    class="text-xs px-2 py-1 rounded-full border-0 font-medium focus:ring-2 focus:ring-brand-brown"
                    :class="getStatusClasses(order.status)"
                    @change="updateOrderStatus(order.id, ($event.target as HTMLSelectElement)?.value)"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                
                <!-- Payment Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getPaymentStatusClasses(order.payment_status)"
                  >
                    {{ order.payment_status }}
                  </span>
                </td>
                
                <!-- Total -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${{ parseFloat(order.total_amount).toFixed(2) }}
                </td>
                
                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.created_at) }}
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <NuxtLink
                      :to="`/dashboard/orders/${order.id}`"
                      class="text-brand-brown hover:text-brand-brown/80"
                    >
                      View
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
              of {{ pagination.total }} orders
            </div>
            <div class="flex space-x-1">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="!pagination.hasPrev"
                class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="!pagination.hasNext"
                class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '@/types/database'
import { useDebounceFn } from '@vueuse/core'
import { AdminService } from '@/services'

// Admin Guard
const { isCheckingAccess, hasAdminAccess } = useAdminGuard()

// Middleware and SEO
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Orders | Dashboard',
  description: 'Manage customer orders and payments',
  robots: 'noindex, nofollow'
})

// State
const loading = ref(false)
const orders = ref<Order[]>([])
const filters = ref({
  search: '',
  status: '',
  paymentStatus: '',
  dateFrom: ''
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
})

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  fetchOrders()
}, 300)

// Fetch orders from API
const fetchOrders = async () => {
  loading.value = true
  
  try {
    const query = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.paymentStatus && { payment_status: filters.value.paymentStatus }),
      ...(filters.value.dateFrom && { date_from: filters.value.dateFrom })
    })
    
    const response = await AdminService.getOrders({
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.paymentStatus && { payment_status: filters.value.paymentStatus }),
      ...(filters.value.dateFrom && { date_from: filters.value.dateFrom })
    })
    
    orders.value = response.data
    pagination.value = response.pagination
    
  } catch (error: any) {
    console.error('Failed to fetch orders:', error)
    useToast().error('Failed to fetch orders')
  } finally {
    loading.value = false
  }
}

// Update order status
const updateOrderStatus = async (orderId: string, status: string) => {
  if (!status || !orderId) return
  
  try {
    await AdminService.updateOrder(orderId, { status })
    
    // Update local state
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status as any
    }
    
    useToast().success('Order status updated')
    
  } catch (error: any) {
    console.error('Failed to update order status:', error)
    useToast().error('Failed to update order status')
  }
}

// Change page
const changePage = (page: number) => {
  pagination.value.page = page
  fetchOrders()
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Status styling
const getStatusClasses = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

// Payment status styling
const getPaymentStatusClasses = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

// Load orders on mount
onMounted(() => {
  fetchOrders()
})
</script>
