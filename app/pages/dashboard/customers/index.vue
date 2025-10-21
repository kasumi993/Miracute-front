<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />

  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <!-- Header -->
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900">Customers</h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your customers, newsletter subscribers, and contact submissions</p>
      </div>
    </div>

    <!-- Stats Overview -->
    <AdminCustomerStatsGrid :stats="stats" />

    <!-- Filters -->
    <AdminCustomerFilters
      :filters="filters"
      @update:search="updateSearch"
      @update:type="updateType"
      @update:date-from="updateDateFrom"
      @clear-filters="clearFilters"
    />

    <!-- Customers Table -->
    <AdminCustomerTable
      :customers="customers"
      :loading="loading"
      :pagination="pagination"
      @view-customer="viewCustomer"
      @subscribe-to-newsletter="subscribeToNewsletter"
      @change-page="changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { UserService } from '@/services/UserService'

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
  first_name: string | null
  last_name: string | null
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

// Fetch customers
const fetchCustomers = async () => {
  loading.value = true

  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.type && { type: filters.value.type }),
      ...(filters.value.dateFrom && { date_from: filters.value.dateFrom })
    }

    const response = await UserService.getUsers(params)

    customers.value = response.data?.data || response.data || []
    pagination.value = response.data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }

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
    const response = await UserService.getCustomerStats()
    stats.value = response.data || stats.value
  } catch (error: any) {
    console.error('Failed to fetch customer stats:', error)
  }
}

// Filter event handlers
const updateSearch = useDebounceFn((value: string) => {
  filters.value.search = value
  pagination.value.page = 1
  fetchCustomers()
}, 300)

const updateType = (value: string) => {
  filters.value.type = value
  pagination.value.page = 1
  fetchCustomers()
}

const updateDateFrom = (value: string) => {
  filters.value.dateFrom = value
  pagination.value.page = 1
  fetchCustomers()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    type: '',
    dateFrom: ''
  }
  pagination.value.page = 1
  fetchCustomers()
}

// Table event handlers
const changePage = (page: number) => {
  pagination.value.page = page
  fetchCustomers()
}

const viewCustomer = (customer: CustomerData) => {
  // TODO: Navigate to customer details page or open modal
  console.log('View customer:', customer)
}

const subscribeToNewsletter = async (customer: CustomerData) => {
  try {
    await UserService.subscribeCustomerToNewsletter(customer.id)

    // Update the customer in the local array
    const index = customers.value.findIndex(c => c.id === customer.id)
    if (index !== -1 && customers.value[index]) {
      customers.value[index].newsletter_subscribed = true
    }

    const customerName = customer.first_name || customer.last_name
      ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
      : customer.email

    useToast().success(`${customerName} subscribed to newsletter`)

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