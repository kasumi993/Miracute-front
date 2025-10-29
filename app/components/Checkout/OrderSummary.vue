<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
    <div class="p-6 border-b border-gray-100">
      <h3 class="text-xl font-semibold text-gray-900">Order Summary</h3>
    </div>
    
    <div class="p-6 space-y-6">
      <!-- Cart Items -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900">Templates ({{ cartItems.length }})</h4>
        <div class="space-y-3">
          <div v-for="item in cartItems" :key="item.id" class="flex items-center space-x-3">
            <!-- Product Image -->
            <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                v-if="item.product.preview_images && item.product.preview_images.length > 0"
                :src="item.product.preview_images[0]"
                :alt="item.product.name"
                class="w-full h-full object-cover"
              >
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <Icon name="heroicons:photo" class="w-6 h-6" />
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-gray-900 line-clamp-2">{{ item.product.name }}</h5>
              <p class="text-xs text-gray-500" v-if="item.product.category">{{ item.product.category.name }}</p>
            </div>
            
            <!-- Price -->
            <div class="text-sm font-semibold text-gray-900">
              ${{ parseFloat(item.price).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>


      <!-- Coupon Code -->
      <div class="space-y-3">
        <div v-if="!appliedCoupon">
          <div class="flex space-x-2">
            <input
              v-model="couponCode"
              type="text"
              placeholder="Coupon code"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm"
              @keyup.enter="applyCoupon"
              :disabled="isApplyingCoupon"
            >
            <button
              @click="applyCoupon"
              :disabled="!couponCode.trim() || isApplyingCoupon"
              class="px-4 py-2 bg-brand-sage text-white rounded-lg hover:bg-brand-sage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Icon v-if="isApplyingCoupon" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <span v-else>Apply</span>
            </button>
          </div>
          <p v-if="couponError" class="text-red-600 text-xs mt-1">{{ couponError }}</p>
        </div>

        <div v-else class="bg-green-50 border border-green-200 rounded-lg p-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:ticket" class="w-4 h-4 text-green-600" />
              <span class="text-green-800 font-medium text-sm">{{ appliedCoupon.code }}</span>
            </div>
            <button
              @click="removeCoupon"
              class="text-green-600 hover:text-green-800 transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>
          <p class="text-green-700 text-xs mt-1">{{ appliedCoupon.name }}</p>
        </div>
      </div>

      <!-- Order Totals -->
      <div class="space-y-3 pt-4 border-t border-gray-100">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Subtotal</span>
          <span class="text-gray-900 font-medium">${{ subtotal.toFixed(2) }}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Instant Download</span>
          <span class="text-green-600 font-medium">Free</span>
        </div>

        <!-- Modern Coupon/Promotion Display -->
        <div v-if="promotionDiscount > 0 || (appliedCoupon && discountAmount > 0)" class="space-y-2">
          <!-- Site-wide Promotion -->
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

          <!-- Manual Coupon -->
          <div v-if="appliedCoupon && discountAmount > 0" class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 -mx-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="heroicons:ticket" class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div class="text-sm font-medium text-blue-800">{{ appliedCoupon.code }}</div>
                  <div class="text-xs text-blue-600">{{ appliedCoupon.name }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-blue-700">-${{ discountAmount.toFixed(2) }}</div>
                <div class="text-xs text-blue-600">Coupon applied</div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t pt-3">
          <div class="flex justify-between text-lg font-bold">
            <span class="text-gray-900">Total</span>
            <span class="text-brand-brown">${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Complete Order Button -->
      <Button 
        :variant="'primary'"
        :size="'lg'"
        :block="true"
        :disabled="!canComplete || isProcessing"
        :loading="isProcessing"
        @click="handleCompleteOrder"
        class="bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown"
      >
        <template v-if="!isProcessing">
          <Icon name="heroicons:lock-closed" class="w-5 h-5 mr-2" />
          Complete Order - ${{ total.toFixed(2) }}
        </template>
        <template v-else>
          Processing Order...
        </template>
      </Button>

      <!-- Support Policy -->
      <div class="bg-gradient-to-br from-brand-sage/10 to-brand-pink/10 rounded-xl p-4">
        <h4 class="font-medium text-gray-900 mb-2 flex items-center">
          <Icon name="heroicons:heart" class="w-4 h-4 text-red-500 mr-2" />
          Our Promise
        </h4>
        <div class="space-y-2 text-xs text-gray-600">
          <p>✓ <strong>Instant Download:</strong> Get your templates immediately after purchase</p>
          <p>✓ <strong>Full Support:</strong> We're here to help with setup and customization</p>
          <p>✓ <strong>Quality Guarantee:</strong> Premium designs crafted by professionals</p>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="pt-4 border-t border-gray-100">
        <div class="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
          <div class="flex flex-col items-center space-y-1">
            <Icon name="heroicons:shield-check" class="w-6 h-6 text-green-500" />
            <span>SSL Secured</span>
          </div>
          <div class="flex flex-col items-center space-y-1">
            <Icon name="heroicons:arrow-down-tray" class="w-6 h-6 text-blue-500" />
            <span>Instant Access</span>
          </div>
          <div class="flex flex-col items-center space-y-1">
            <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-purple-500" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/UI/Button.vue'
import { CouponService } from '~/services'

interface Props {
  canComplete?: boolean
  isProcessing?: boolean
}

interface Emits {
  (e: 'complete-order'): void
  (e: 'coupon-applied', coupon: any, discountAmount: number): void
  (e: 'coupon-removed'): void
}

const props = withDefaults(defineProps<Props>(), {
  canComplete: false,
  isProcessing: false
})

const emit = defineEmits<Emits>()

// Get cart data
const cartCounter = useCartCounter()
const cartItems = cartCounter.cartItems
const cartTotal = cartCounter.cartTotal

// Get coupons
const { getBestCoupon, calculateDiscount } = useCoupons()
const bestCoupon = computed(() => getBestCoupon())

// Coupon state
const couponCode = ref('')
const appliedCoupon = ref(null)
const discountAmount = ref(0)
const isApplyingCoupon = ref(false)
const couponError = ref('')

// Get user data
const user = useSupabaseUser()

// Computed values
const subtotal = computed(() => cartTotal.value)

// Calculate promotion discount for the entire cart
const promotionDiscount = computed(() => {
  if (!bestCoupon.value) return 0
  return calculateDiscount(subtotal.value, bestCoupon.value)
})

// Total discount (promotion + manual coupon)
const totalDiscount = computed(() => {
  return discountAmount.value + promotionDiscount.value
})

const total = computed(() => Math.max(0, subtotal.value - totalDiscount.value))

const applyCoupon = async () => {
  if (!couponCode.value.trim()) return

  isApplyingCoupon.value = true
  couponError.value = ''

  try {
    // Prepare cart items for validation
    const cartItemsForValidation = cartItems.value.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity || 1,
      price: parseFloat(item.price),
      category_id: item.product?.category_id
    }))

    const response = await CouponService.validateCoupon({
      cart_items: cartItemsForValidation,
      subtotal: subtotal.value,
      coupon_code: couponCode.value.trim(),
      customer_email: user.value?.email,
      user_id: user.value?.id
    })

    if (response.success && response.data?.valid) {
      appliedCoupon.value = response.data.coupon
      discountAmount.value = response.data.discount_amount || 0
      couponCode.value = ''

      // Emit to parent component
      emit('coupon-applied', response.data.coupon, discountAmount.value)

      useToast().success(`Coupon applied! You saved $${discountAmount.value.toFixed(2)}`)
    } else {
      couponError.value = response.data?.error || response.error || 'Invalid coupon code'
    }
  } catch (error) {
    console.error('Error applying coupon:', error)
    couponError.value = 'Failed to apply coupon. Please try again.'
  } finally {
    isApplyingCoupon.value = false
  }
}

const removeCoupon = () => {
  appliedCoupon.value = null
  discountAmount.value = 0
  couponCode.value = ''
  couponError.value = ''

  // Emit to parent component
  emit('coupon-removed')

  useToast().success('Coupon removed')
}

const handleCompleteOrder = () => {
  emit('complete-order')
}
</script>