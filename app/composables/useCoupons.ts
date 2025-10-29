import type { ApiResponse } from '@/types'
import { getPublicCoupons } from '@/services/CouponService'

interface PublicCoupon {
  id: string
  code: string
  name: string
  description: string
  type: 'coupon' | 'promotion'
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_cart_amount: number | null
  maximum_discount_amount: number | null
  discount_display: string
  expires_soon: boolean
  usage_percentage: number
}

// Global state - simple reactive refs
const coupons = ref<PublicCoupon[]>([])
const isLoading = ref(false)

export const useCoupons = () => {
  // Fetch coupons from API
  const fetchCoupons = async () => {
    if (isLoading.value) return

    try {
      isLoading.value = true
      const response = await getPublicCoupons()

      if (response.success && response.data) {
        coupons.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Get best coupon for a product price (ignoring minimum cart amount for display)
  const getBestCoupon = () => {
    if (!coupons.value.length) return null

    // Return the highest percentage discount available
    return coupons.value
      .filter(coupon => coupon.discount_type === 'percentage')
      .sort((a, b) => b.discount_value - a.discount_value)[0] || null
  }

  // Calculate discount amount for a product
  const calculateDiscount = (productPrice: number, coupon: PublicCoupon | null) => {
    if (!coupon) return 0

    if (coupon.discount_type === 'percentage') {
      return (productPrice * coupon.discount_value) / 100
    } else {
      return Math.min(coupon.discount_value, productPrice)
    }
  }

  return {
    coupons: readonly(coupons),
    isLoading: readonly(isLoading),
    fetchCoupons,
    getBestCoupon,
    calculateDiscount
  }
}