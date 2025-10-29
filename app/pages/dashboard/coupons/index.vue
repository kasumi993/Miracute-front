<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
      <div class="min-w-0 flex-1">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900">
          Coupons & Promotions
        </h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Manage discount codes and promotional campaigns
        </p>
      </div>
      <div class="flex-shrink-0">
        <NuxtLink to="/dashboard/coupons/create" class="btn-primary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg inline-flex">
          <Icon name="heroicons:plus" class="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-1.5" />
          <span>Create Coupon</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
      <DashboardStatsCard
        icon="heroicons:ticket"
        icon-color="text-brand-sage"
        :value="stats.totalCoupons"
        label="Total Coupons"
      />

      <DashboardStatsCard
        icon="heroicons:chart-bar"
        icon-color="text-brand-brown"
        :value="stats.activeCoupons"
        label="Active"
      />

      <DashboardStatsCard
        icon="heroicons:currency-dollar"
        icon-color="text-brand-pink"
        :value="stats.totalSavings"
        label="Total Savings"
        format-as-currency
      />

      <DashboardStatsCard
        icon="heroicons:users"
        icon-color="text-brand-warm"
        :value="stats.totalUsages"
        label="Times Used"
      />
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search coupons..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm"
          >
            <option value="">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="free_shipping">Free Shipping</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Coupons List -->
    <div class="bg-white rounded-xl shadow-soft border border-gray-100">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4 text-brand-brown" />
          <p class="text-gray-500">Loading coupons...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredCoupons.length" class="text-center py-12">
        <Icon name="heroicons:ticket" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
        <p class="text-gray-500 mb-6">Get started by creating your first coupon.</p>
        <NuxtLink to="/dashboard/coupons/create" class="btn-primary">
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          Create Coupon
        </NuxtLink>
      </div>

      <!-- Coupons Grid -->
      <div v-else class="p-4 sm:p-6">
        <div class="space-y-4">
          <div v-for="coupon in filteredCoupons" :key="coupon.id"
               class="border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-gray-300 transition-all duration-150">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <!-- Coupon Header -->
                <div class="flex items-center space-x-3 mb-3">
                  <div class="font-mono text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                    {{ coupon.code }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="getStatusBadgeClass(coupon)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ getStatusText(coupon) }}
                    </span>
                    <span :class="getTypeBadgeClass(coupon.discount_type)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ getTypeText(coupon.discount_type) }}
                    </span>
                  </div>
                </div>

                <!-- Coupon Details -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div class="font-medium text-gray-900 mb-1">{{ coupon.name }}</div>
                    <div class="text-gray-600">{{ coupon.description || 'No description' }}</div>
                  </div>

                  <div>
                    <div class="font-medium text-gray-700 mb-2">Discount</div>
                    <div class="text-gray-900">
                      <span v-if="coupon.discount_type === 'percentage'">{{ coupon.discount_value }}% off</span>
                      <span v-else-if="coupon.discount_type === 'fixed_amount'">${{ coupon.discount_value }} off</span>
                      <span v-else-if="coupon.discount_type === 'free_shipping'">Free shipping</span>
                    </div>
                    <div v-if="coupon.minimum_cart_amount" class="text-xs text-gray-500 mt-1">
                      Min. order: ${{ coupon.minimum_cart_amount }}
                    </div>
                  </div>

                  <div>
                    <div class="font-medium text-gray-700 mb-2">Usage</div>
                    <div class="text-gray-900">
                      {{ coupon.usage_count }} / {{ coupon.usage_limit || '∞' }} used
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      Created {{ formatDate(coupon.created_at) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2 ml-4">
                <button
                  @click="copyCode(coupon.code)"
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy code"
                >
                  <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                </button>

                <NuxtLink
                  :to="`/dashboard/coupons/create?id=${coupon.id}`"
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit coupon"
                >
                  <Icon name="heroicons:pencil" class="w-4 h-4" />
                </NuxtLink>

                <button
                  @click="toggleCouponStatus(coupon)"
                  :class="coupon.is_active ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'"
                  class="p-2 transition-colors"
                  :title="coupon.is_active ? 'Deactivate' : 'Activate'"
                >
                  <Icon :name="coupon.is_active ? 'heroicons:pause' : 'heroicons:play'" class="w-4 h-4" />
                </button>

                <button
                  @click="deleteCoupon(coupon)"
                  class="p-2 text-red-400 hover:text-red-600 transition-colors"
                  title="Delete coupon"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Coupons | Dashboard',
  robots: 'noindex, nofollow'
})

import { CouponService } from '~/services'

const isLoading = ref(true)
const coupons = ref([])
const stats = ref({
  totalCoupons: 0,
  activeCoupons: 0,
  totalSavings: 0,
  totalUsages: 0
})

const filters = ref({
  search: '',
  status: '',
  type: ''
})

const filteredCoupons = computed(() => {
  let filtered = coupons.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(coupon =>
      coupon.code.toLowerCase().includes(search) ||
      coupon.name.toLowerCase().includes(search) ||
      (coupon.description && coupon.description.toLowerCase().includes(search))
    )
  }

  if (filters.value.status) {
    filtered = filtered.filter(coupon => {
      if (filters.value.status === 'active') return coupon.is_active
      if (filters.value.status === 'inactive') return !coupon.is_active
      if (filters.value.status === 'expired') return coupon.valid_until && new Date(coupon.valid_until) < new Date()
      return true
    })
  }

  if (filters.value.type) {
    filtered = filtered.filter(coupon => coupon.discount_type === filters.value.type)
  }

  return filtered
})

const loadCoupons = async () => {
  try {
    isLoading.value = true
    const response = await CouponService.getCoupons()

    if (response.success && response.data) {
      coupons.value = response.data.coupons || []
      stats.value = response.data.stats || stats.value
    } else {
      useToast().error('Failed to load coupons')
    }
  } catch (error) {
    console.error('Error loading coupons:', error)
    useToast().error('Failed to load coupons')
  } finally {
    isLoading.value = false
  }
}

const toggleCouponStatus = async (coupon) => {
  try {
    const response = await CouponService.updateCoupon(coupon.id, {
      is_active: !coupon.is_active
    })

    if (response.success) {
      coupon.is_active = !coupon.is_active
      useToast().success(`Coupon ${coupon.is_active ? 'activated' : 'deactivated'}`)
    } else {
      useToast().error('Failed to update coupon status')
    }
  } catch (error) {
    console.error('Error updating coupon:', error)
    useToast().error('Failed to update coupon status')
  }
}

const deleteCoupon = async (coupon) => {
  if (!confirm(`Are you sure you want to delete the coupon "${coupon.code}"? This action cannot be undone.`)) {
    return
  }

  try {
    const response = await CouponService.deleteCoupon(coupon.id)

    if (response.success) {
      coupons.value = coupons.value.filter(c => c.id !== coupon.id)
      useToast().success('Coupon deleted successfully')
    } else {
      useToast().error('Failed to delete coupon')
    }
  } catch (error) {
    console.error('Error deleting coupon:', error)
    useToast().error('Failed to delete coupon')
  }
}

const copyCode = (code) => {
  navigator.clipboard.writeText(code)
  useToast().success('Coupon code copied to clipboard')
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    type: ''
  }
}

const getStatusBadgeClass = (coupon) => {
  if (!coupon.is_active) return 'bg-gray-100 text-gray-800'
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) return 'bg-red-100 text-red-800'
  return 'bg-green-100 text-green-800'
}

const getStatusText = (coupon) => {
  if (!coupon.is_active) return 'Inactive'
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) return 'Expired'
  return 'Active'
}

const getTypeBadgeClass = (type) => {
  const classes = {
    percentage: 'bg-blue-100 text-blue-800',
    fixed_amount: 'bg-purple-100 text-purple-800',
    free_shipping: 'bg-orange-100 text-orange-800',
    buy_x_get_y: 'bg-pink-100 text-pink-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getTypeText = (type) => {
  const texts = {
    percentage: 'Percentage',
    fixed_amount: 'Fixed Amount',
    free_shipping: 'Free Shipping',
    buy_x_get_y: 'Buy X Get Y'
  }
  return texts[type] || type
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadCoupons()
})
</script>