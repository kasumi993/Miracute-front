<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
      <div class="min-w-0 flex-1">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900">
          {{ isEditing ? 'Edit Coupon' : 'Create Coupon' }}
        </h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          {{ isEditing ? 'Update coupon settings' : 'Create a new discount coupon' }}
        </p>
      </div>
      <div class="flex-shrink-0">
        <NuxtLink to="/dashboard/coupons" class="btn-secondary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg inline-flex">
          <Icon name="heroicons:arrow-left" class="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-1.5" />
          <span>Back to Coupons</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingCoupon" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4 text-brand-brown" />
          <p class="text-gray-500">Loading coupon data...</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
      <form @submit.prevent="saveCoupon" class="space-y-8">
        <!-- Basic Information -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code *
              </label>
              <div class="flex">
                <input
                  v-model="form.code"
                  type="text"
                  required
                  class="flex-1 px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto font-mono"
                  placeholder="e.g., SAVE20"
                  @input="form.code = form.code.toUpperCase()"
                >
                <button
                  type="button"
                  @click="generateCode"
                  class="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                placeholder="e.g., 20% Off Everything"
              >
            </div>
          </div>

          <!-- Coupon Type -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="relative cursor-pointer">
                <input
                  v-model="form.type"
                  type="radio"
                  value="coupon"
                  class="sr-only"
                >
                <div :class="[
                  'border-2 rounded-lg p-4 text-center transition-all',
                  form.type === 'coupon'
                    ? 'border-brand-sage bg-brand-sage/10 text-brand-sage'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                ]">
                  <div class="flex items-center justify-center mb-2">
                    <Icon name="heroicons:ticket" class="w-6 h-6" />
                  </div>
                  <div class="font-semibold">Coupon</div>
                  <div class="text-xs mt-1">Requires customer to enter code at checkout</div>
                </div>
              </label>

              <label class="relative cursor-pointer">
                <input
                  v-model="form.type"
                  type="radio"
                  value="promotion"
                  class="sr-only"
                >
                <div :class="[
                  'border-2 rounded-lg p-4 text-center transition-all',
                  form.type === 'promotion'
                    ? 'border-brand-pink bg-brand-pink/10 text-brand-pink'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                ]">
                  <div class="flex items-center justify-center mb-2">
                    <Icon name="heroicons:megaphone" class="w-6 h-6" />
                  </div>
                  <div class="font-semibold">Promotion</div>
                  <div class="text-xs mt-1">Automatically applied site-wide when active</div>
                </div>
              </label>
            </div>
          </div>

          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm"
              placeholder="Brief description of this coupon..."
            ></textarea>
          </div>
        </div>

        <!-- Discount Configuration -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Discount Configuration</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                v-model="form.discount_type"
                required
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
              >
                <option value="">Select discount type</option>
                <option value="percentage">Percentage Off</option>
                <option value="fixed_amount">Fixed Amount Off</option>
              </select>
            </div>

            <div v-if="form.discount_type">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span v-if="form.discount_type === 'percentage'">Percentage (%) *</span>
                <span v-else>Amount ($) *</span>
              </label>
              <input
                v-model.number="form.discount_value"
                type="number"
                :min="form.discount_type === 'percentage' ? 1 : 0.01"
                :max="form.discount_type === 'percentage' ? 100 : undefined"
                step="0.01"
                required
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                :placeholder="form.discount_type === 'percentage' ? 'e.g., 20' : 'e.g., 10.00'"
              >
            </div>
          </div>
        </div>

        <!-- Usage Limits -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Usage Limits</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Total Usage Limit
              </label>
              <input
                v-model.number="form.usage_limit"
                type="number"
                min="1"
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                placeholder="Unlimited"
              >
              <p class="text-xs text-gray-500 mt-1">Leave empty for unlimited usage</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Per Customer Limit
              </label>
              <input
                v-model.number="form.usage_limit_per_customer"
                type="number"
                min="1"
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                placeholder="1"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Minimum Cart Amount
              </label>
              <input
                v-model.number="form.minimum_cart_amount"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                placeholder="No minimum"
              >
              <p class="text-xs text-gray-500 mt-1">Minimum cart value required to use this coupon</p>
            </div>
          </div>

          <div class="mt-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Amount
              </label>
              <input
                v-model.number="form.maximum_discount_amount"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto md:w-1/3"
                placeholder="No maximum"
              >
              <p class="text-xs text-gray-500 mt-1">Maximum discount amount per order</p>
            </div>
          </div>
        </div>

        <!-- Customer Eligibility -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Customer Eligibility</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Who can use this coupon?
            </label>
            <select
              v-model="form.customer_eligibility"
              class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto md:w-1/2"
            >
              <option value="all">All Customers</option>
              <option value="new_customers">New Customers Only</option>
              <option value="returning_customers">Returning Customers Only</option>
            </select>
          </div>
        </div>

        <!-- Status -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Status</h3>
          <div class="flex items-center p-4 sm:p-2 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="h-5 w-5 sm:h-4 sm:w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
            >
            <label for="is_active" class="ml-3 sm:ml-2 block text-base sm:text-sm text-gray-700 font-medium sm:font-normal">
              Active (customers can use this coupon)
            </label>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-4">
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg font-medium order-1 sm:order-none inline-flex"
          >
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
            <Icon v-else :name="isEditing ? 'heroicons:check' : 'heroicons:plus'" class="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
            <span>{{ isEditing ? 'Update Coupon' : 'Create Coupon' }}</span>
          </button>

          <NuxtLink to="/dashboard/coupons" class="btn-secondary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg order-2 sm:order-none inline-flex">
            <span>Cancel</span>
          </NuxtLink>
        </div>
      </form>
    </div>

    <!-- Quick Templates -->
    <div v-if="!isEditing" class="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
      <h3 class="text-base sm:text-lg font-medium text-blue-900 mb-2">Quick Templates</h3>
      <p class="text-blue-700 mb-4 text-sm sm:text-base">Create coupons from common templates:</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          @click="applyTemplate('percentage')"
          class="bg-blue-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-left"
        >
          <div class="font-semibold">20% Off Everything</div>
          <div class="text-blue-100 text-xs">Percentage discount</div>
        </button>

        <button
          @click="applyTemplate('fixed')"
          class="bg-purple-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium text-left"
        >
          <div class="font-semibold">$10 Off Orders</div>
          <div class="text-purple-100 text-xs">Fixed amount discount</div>
        </button>

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
  title: 'Create Coupon | Dashboard',
  robots: 'noindex, nofollow'
})

import { CouponService } from '~/services'

const route = useRoute()
const couponId = computed(() => route.query.id)
const isEditing = computed(() => !!couponId.value)

const isLoading = ref(false)
const isLoadingCoupon = ref(false)
const form = ref({
  code: '',
  name: '',
  description: '',
  type: 'promotion', // Default to promotion
  discount_type: '',
  discount_value: null,
  usage_limit: null,
  usage_limit_per_customer: 1,
  minimum_cart_amount: null,
  maximum_discount_amount: null,
  customer_eligibility: 'all',
  is_active: true
})

const generateCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  form.value.code = code
}

const applyTemplate = async (type) => {
  switch (type) {
    case 'percentage':
      Object.assign(form.value, {
        code: 'SAVE20',
        name: '20% Off Everything',
        description: 'Get 20% off your entire order',
        type: 'promotion',
        discount_type: 'percentage',
        discount_value: 20,
        minimum_cart_amount: 50
      })
      break
    case 'fixed':
      Object.assign(form.value, {
        code: 'SAVE10',
        name: '$10 Off Orders',
        description: 'Get $10 off orders over $75',
        type: 'promotion',
        discount_type: 'fixed_amount',
        discount_value: 10,
        minimum_cart_amount: 75
      })
      break
  }

  // Force reactivity update
  await nextTick()
}

const loadCoupon = async () => {
  if (!couponId.value) return

  isLoadingCoupon.value = true
  try {
    const response = await CouponService.getCoupon(couponId.value)
    if (response.success && response.data) {
      const coupon = response.data
      form.value = {
        code: coupon.code || '',
        name: coupon.name || '',
        description: coupon.description || '',
        type: coupon.type || 'promotion', // Default to promotion for backward compatibility
        discount_type: coupon.discount_type || '',
        discount_value: coupon.discount_value || null,
        usage_limit: coupon.usage_limit || null,
        usage_limit_per_customer: coupon.usage_limit_per_customer || 1,
        minimum_cart_amount: coupon.minimum_cart_amount || null,
        maximum_discount_amount: coupon.maximum_discount_amount || null,
        customer_eligibility: coupon.customer_eligibility || 'all',
        is_active: coupon.is_active !== undefined ? coupon.is_active : true
      }
    } else {
      useToast().error('Coupon not found')
      await navigateTo('/dashboard/coupons')
    }
  } catch (error) {
    console.error('Error loading coupon:', error)
    useToast().error('Failed to load coupon data')
    await navigateTo('/dashboard/coupons')
  } finally {
    isLoadingCoupon.value = false
  }
}

const saveCoupon = async () => {
  isLoading.value = true

  try {
    const couponData = { ...form.value }

    // Validate discount value is set for all types
    if (!couponData.discount_value || couponData.discount_value <= 0) {
      throw new Error('Discount value must be greater than 0')
    }

    let response
    if (isEditing.value) {
      response = await CouponService.updateCoupon(couponId.value, couponData)
    } else {
      response = await CouponService.createCoupon(couponData)
    }

    if (response.success) {
      useToast().success(`Coupon ${isEditing.value ? 'updated' : 'created'} successfully!`)
      await navigateTo('/dashboard/coupons')
    } else {
      throw new Error(response.error || `Failed to ${isEditing.value ? 'update' : 'create'} coupon`)
    }
  } catch (error) {
    console.error(`Error ${isEditing.value ? 'updating' : 'creating'} coupon:`, error)
    useToast().error(`Failed to ${isEditing.value ? 'update' : 'create'} coupon`)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) {
    await loadCoupon()
  }
})
</script>