<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
    <div class="p-6 border-b border-gray-100">
      <h3 class="text-xl font-semibold text-gray-900">Order Summary</h3>
    </div>

    <div class="p-6 space-y-4">
      <!-- Summary Details -->
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Items ({{ itemCount }})</span>
          <span class="text-gray-900 font-medium">${{ calculatedSubtotal.toFixed(2) }}</span>
        </div>

        <!-- Bundle Discounts -->
        <div v-if="bundleDiscounts.length > 0" class="space-y-2">
          <div
            v-for="discount in bundleDiscounts"
            :key="discount.id"
            class="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3 -mx-1"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="heroicons:gift" class="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div class="text-sm font-medium text-orange-800">{{ discount.name }}</div>
                  <div class="text-xs text-orange-600">Bundle savings</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-orange-700">-${{ discount.discount_amount.toFixed(2) }}</div>
                <div class="text-xs text-orange-600">Auto-applied</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Instant Download</span>
          <span class="text-green-600 font-medium">Free</span>
        </div>

        <!-- Modern Coupon/Promotion Display -->
        <div v-if="promotionDiscount > 0" class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 -mx-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:sparkles" class="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div class="text-sm font-medium text-green-800">Discount</div>
                <div class="text-xs text-green-600">{{ bestCoupon?.name || 'Special Discount' }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-green-700">-${{ promotionDiscount.toFixed(2) }}</div>
              <div class="text-xs text-green-600">Auto-applied</div>
            </div>
          </div>
        </div>

        <div class="border-t pt-3">
          <div class="flex justify-between text-lg font-semibold">
            <span class="text-gray-900">Total</span>
            <span class="text-brand-brown">${{ finalTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>


      <!-- Checkout Button -->
      <NuxtLink
        to="/cart/checkout"
        class="w-full bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-center block"
      >
        <div class="flex items-center justify-center space-x-2">
          <Icon name="heroicons:lock-closed" class="w-5 h-5" />
          <span>Secure Checkout</span>
        </div>
      </NuxtLink>

      <!-- Additional Actions -->
      <div class="space-y-3 pt-4 border-t border-gray-100">
        <button
          @click="$emit('clear-cart')"
          class="w-full text-red-600 hover:text-red-700 font-medium py-2 text-sm transition-colors"
        >
          Clear Cart
        </button>
        <div class="text-center">
          <NuxtLink to="/listings" class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm inline-flex items-center space-x-1">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            <span>Continue Shopping</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="pt-4 border-t border-gray-100">
        <div class="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
            <span>Secure Payment</span>
          </div>
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-blue-500" />
            <span>Instant Access</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartCalculations } from '@/composables/useCartCalculations'

const props = defineProps({
  itemCount: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  }
})

defineEmits(['clear-cart'])

// Get coupons and cart calculations
const { getBestCoupon, calculateDiscount } = useCoupons()
const { detectAppliedBundleDiscounts } = useCartCalculations()
const bestCoupon = computed(() => getBestCoupon())

// Bundle discounts from cart items
const bundleDiscounts = computed(() => {
  return detectAppliedBundleDiscounts(props.items)
})

// Current cart subtotal (after bundle discounts but before coupons)
const calculatedSubtotal = computed(() => props.total)

// Calculate promotion discount for the entire cart
const promotionDiscount = computed(() => {
  if (!bestCoupon.value) return 0
  return calculateDiscount(calculatedSubtotal.value, bestCoupon.value)
})

const finalTotal = computed(() => Math.max(0, calculatedSubtotal.value - promotionDiscount.value))
</script>