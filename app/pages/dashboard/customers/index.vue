<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />
  
  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-heading font-medium text-gray-900">Customers</h1>
        <p class="text-gray-600 mt-2">Manage your customers, newsletter subscribers, and contact submissions</p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:users" class="w-8 h-8 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Customers</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalCustomers }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:shopping-bag" class="w-8 h-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Paying Customers</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.payingCustomers }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:envelope" class="w-8 h-8 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Newsletter Subscribers</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.newsletterSubscribers }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="heroicons:chat-bubble-left-right" class="w-8 h-8 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Contact Submissions</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.contactSubmissions }}</p>
          </div>
        </div>
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
            placeholder="Name, email..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
            @input="debouncedSearch"
          />
        </div>
        
        <!-- Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
          <select
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
            @change="fetchCustomers"
          >
            <option value="">All Types</option>
            <option value="registered">Registered Users</option>
            <option value="purchased">Purchased</option>
            <option value="newsletter">Newsletter Only</option>
            <option value="contact">Contact Only</option>
          </select>
        </div>
        
        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
            @change="fetchCustomers"
          />
        </div>
        
        <!-- Clear Filters -->
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full btn-outline"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Customers List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-flex items-center px-4 py-2 text-gray-600">
          <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
          Loading customers...
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!customers.length" class="p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
          <Icon name="heroicons:users" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
        <p class="text-gray-600">Customers will appear here when they register, subscribe, or contact you.</p>
      </div>

      <!-- Customers Table -->
      <div v-else class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Newsletter
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50">
                <!-- Customer Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-brand-brown flex items-center justify-center">
                        <span class="text-white font-medium">
                          {{ getInitials(customer.full_name || customer.email) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ customer.full_name || 'Guest Customer' }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ customer.email }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Customer Type -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="customer.stripe_customer_id" 
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Customer
                    </span>
                    <span v-if="customer.newsletter_subscribed" 
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      Newsletter
                    </span>
                    <span v-if="customer.contacted_at" 
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                      Contact
                    </span>
                    <span v-if="customer.role === 'admin'" 
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Admin
                    </span>
                  </div>
                </td>
                
                <!-- Order Count -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ customer.order_count || 0 }}
                </td>
                
                <!-- Total Spent -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${{ customer.total_spent ? parseFloat(customer.total_spent).toFixed(2) : '0.00' }}
                </td>
                
                <!-- Newsletter Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="customer.newsletter_subscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ customer.newsletter_subscribed ? 'Subscribed' : 'Not subscribed' }}
                  </span>
                </td>
                
                <!-- Join Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(customer.created_at) }}
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="viewCustomer(customer)"
                      class="text-brand-brown hover:text-brand-brown/80"
                    >
                      View
                    </button>
                    <button
                      v-if="!customer.newsletter_subscribed"
                      @click="subscribeToNewsletter(customer)"
                      class="text-purple-600 hover:text-purple-500"
                    >
                      Subscribe
                    </button>
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
              of {{ pagination.total }} customers
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
import { useDebounceFn } from '@vueuse/core'

// Admin Guard
const { isCheckingAccess, hasAdminAccess } = useAdminGuard()

// Middleware and SEO
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Customers | Dashboard',
  description: 'Manage customers, newsletter subscribers, and contact submissions',
  robots: 'noindex, nofollow'
})

// Extended customer type with additional fields
interface CustomerData {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
  // Extended fields
  newsletter_subscribed?: boolean
  contacted_at?: string
  order_count?: number
  total_spent?: string
  last_order_date?: string
}

// State
const loading = ref(false)
const customers = ref<CustomerData[]>([])
const stats = ref({
  totalCustomers: 0,
  payingCustomers: 0,
  newsletterSubscribers: 0,
  contactSubmissions: 0
})

const filters = ref({
  search: '',
  type: '',
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
  fetchCustomers()
}, 300)

// Fetch customers
const fetchCustomers = async () => {
  loading.value = true
  
  try {
    const query = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.type && { type: filters.value.type }),
      ...(filters.value.dateFrom && { date_from: filters.value.dateFrom })
    })
    
    const response = await $fetch(`/api/admin/customers?${query}`)
    
    customers.value = response.data
    pagination.value = response.pagination
    
  } catch (error: any) {
    console.error('Failed to fetch customers:', error)
    useToast().error('Failed to fetch customers')
  } finally {
    loading.value = false
  }
}

// Fetch stats
const fetchStats = async () => {
  try {
    const response = await $fetch('/api/admin/customers/stats')
    stats.value = response.data
  } catch (error: any) {
    console.error('Failed to fetch customer stats:', error)
  }
}

// Clear filters
const clearFilters = () => {
  filters.value = {
    search: '',
    type: '',
    dateFrom: ''
  }
  pagination.value.page = 1
  fetchCustomers()
}

// Change page
const changePage = (page: number) => {
  pagination.value.page = page
  fetchCustomers()
}

// Get initials from name or email
const getInitials = (name: string) => {
  if (!name) return '?'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  } else if (name.includes('@')) {
    return name[0].toUpperCase()
  } else {
    return name.slice(0, 2).toUpperCase()
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// View customer details
const viewCustomer = (customer: CustomerData) => {
  // TODO: Navigate to customer details page or open modal
  console.log('View customer:', customer)
}

// Subscribe customer to newsletter
const subscribeToNewsletter = async (customer: CustomerData) => {
  try {
    await $fetch(`/api/admin/customers/${customer.id}/subscribe`, {
      method: 'POST'
    })
    
    customer.newsletter_subscribed = true
    useToast().success(`${customer.full_name || customer.email} subscribed to newsletter`)
    
  } catch (error: any) {
    console.error('Failed to subscribe customer:', error)
    useToast().error('Failed to subscribe customer to newsletter')
  }
}

// Load data on mount
onMounted(() => {
  fetchCustomers()
  fetchStats()
})
</script>