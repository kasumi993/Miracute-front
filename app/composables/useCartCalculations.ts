import type { CartItem } from '@/types/commerce/cart'
import type { Coupon } from '@/services/CouponService'

export interface BundleDiscount {
  bundle_id: string
  bundle_name: string
  product_ids: string[]
  original_total: number
  bundle_price: number
  savings_amount: number
  discount_percentage: number
}

export interface AppliedDiscount {
  type: 'bundle' | 'coupon' | 'automatic'
  id: string
  name: string
  description: string
  discount_amount: number
  discount_percentage?: number
  applied_to: 'items' | 'subtotal' | 'shipping'
}

export interface CartCalculationResult {
  subtotal: number
  bundle_discounts: AppliedDiscount[]
  coupon_discounts: AppliedDiscount[]
  total_discount_amount: number
  total_discount_percentage: number
  tax: number
  shipping: number
  final_total: number
  applied_discounts: AppliedDiscount[]
}

export const useCartCalculations = () => {
  /**
   * Calculate cart subtotal
   */
  const calculateSubtotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + parseFloat(String(item.price)), 0)
  }

  /**
   * Calculate original subtotal (before bundle discounts)
   */
  const calculateOriginalSubtotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      const originalPrice = item.bundleMetadata?.originalPrice ?? item.price
      return total + parseFloat(String(originalPrice))
    }, 0)
  }

  /**
   * Detect bundle discounts already applied in cart
   */
  const detectAppliedBundleDiscounts = (items: CartItem[]): AppliedDiscount[] => {
    const bundleGroups = new Map<string, CartItem[]>()

    // Group items by bundle ID
    items.forEach(item => {
      if (item.bundleMetadata?.bundleId) {
        const bundleId = item.bundleMetadata.bundleId
        if (!bundleGroups.has(bundleId)) {
          bundleGroups.set(bundleId, [])
        }
        bundleGroups.get(bundleId)!.push(item)
      }
    })

    const appliedDiscounts: AppliedDiscount[] = []

    // Create discount entry for each complete bundle
    bundleGroups.forEach((bundleItems, bundleId) => {
      if (bundleItems.length > 0) {
        const firstItem = bundleItems[0]
        const totalDiscount = bundleItems.reduce((sum, item) =>
          sum + (item.bundleMetadata?.discount ?? 0), 0
        )

        if (totalDiscount > 0) {
          appliedDiscounts.push({
            type: 'bundle',
            id: bundleId,
            name: firstItem.bundleMetadata!.bundleName,
            description: `Bundle discount`,
            discount_amount: totalDiscount,
            applied_to: 'items'
          })
        }
      }
    })

    return appliedDiscounts
  }

  /**
   * Calculate tax amount
   */
  const calculateTax = (subtotal: number, taxRate = 0.0): number => {
    return subtotal * taxRate
  }


  /**
   * Calculate total including tax (no shipping for digital products)
   */
  const calculateTotal = (items: CartItem[], options?: {
    taxRate?: number
  }): {
    subtotal: number
    tax: number
    total: number
  } => {
    const { taxRate = 0.0 } = options || {}

    const subtotal = calculateSubtotal(items)
    const tax = calculateTax(subtotal, taxRate)
    const total = subtotal + tax

    return {
      subtotal,
      tax,
      total
    }
  }

  /**
   * Get cart summary for display/checkout
   */
  const getCartSummary = (items: CartItem[]) => {
    const calculations = calculateTotal(items)
    const itemCount = items.length // Each item is quantity 1

    return {
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.price,
        variant: item.selectedVariant
      })),
      ...calculations,
      itemCount
    }
  }

  /**
   * Detect bundle groupings in cart
   */
  const detectBundleDiscounts = (items: CartItem[], availableBundles: BundleDiscount[]): AppliedDiscount[] => {
    const appliedBundles: AppliedDiscount[] = []

    for (const bundle of availableBundles) {
      // Check if all bundle products are in cart
      const bundleProductsInCart = bundle.product_ids.every(productId =>
        items.some(item => item.product.id === productId)
      )

      if (bundleProductsInCart) {
        appliedBundles.push({
          type: 'bundle',
          id: bundle.bundle_id,
          name: bundle.bundle_name,
          description: `Bundle discount: ${bundle.discount_percentage}% off`,
          discount_amount: bundle.savings_amount,
          discount_percentage: bundle.discount_percentage,
          applied_to: 'items'
        })
      }
    }

    return appliedBundles
  }

  /**
   * Apply coupon discounts with stacking rules
   */
  const applyCouponDiscounts = (
    subtotal: number,
    coupons: Coupon[],
    bundleDiscounts: AppliedDiscount[]
  ): AppliedDiscount[] => {
    const appliedCoupons: AppliedDiscount[] = []
    const hasBundles = bundleDiscounts.length > 0

    // Sort coupons by priority
    const sortedCoupons = [...coupons].sort((a, b) => a.priority_order - b.priority_order)

    for (const coupon of sortedCoupons) {
      // Check bundle compatibility
      if (hasBundles && !coupon.can_stack_with_bundles) {
        continue
      }

      if (coupon.requires_bundle_in_cart && !hasBundles) {
        continue
      }

      // Check minimum cart amount
      if (coupon.minimum_cart_amount && subtotal < coupon.minimum_cart_amount) {
        continue
      }

      let discountAmount = 0

      if (coupon.discount_type === 'percentage') {
        discountAmount = subtotal * (coupon.discount_value / 100)
      } else if (coupon.discount_type === 'fixed_amount') {
        discountAmount = Math.min(coupon.discount_value, subtotal)
      }

      // Apply maximum discount cap
      if (coupon.maximum_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.maximum_discount_amount)
      }

      if (discountAmount > 0) {
        appliedCoupons.push({
          type: 'coupon',
          id: coupon.id,
          name: coupon.name,
          description: coupon.description || `${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : '$'} off`,
          discount_amount: discountAmount,
          discount_percentage: coupon.discount_type === 'percentage' ? coupon.discount_value : undefined,
          applied_to: coupon.discount_type === 'free_shipping' ? 'shipping' : 'subtotal'
        })

        // Update subtotal for next coupon calculation
        if (coupon.discount_type !== 'free_shipping') {
          subtotal -= discountAmount
        }

        // Most e-commerce sites allow only 1 coupon code
        break
      }
    }

    return appliedCoupons
  }

  /**
   * Calculate cart with full discount stacking
   */
  const calculateCartWithDiscounts = (
    items: CartItem[],
    bundleDiscounts: BundleDiscount[] = [],
    coupons: Coupon[] = [],
    options?: { taxRate?: number }
  ): CartCalculationResult => {
    // Step 1: Calculate original subtotal
    let originalSubtotal = calculateSubtotal(items)

    // Step 2: Apply bundle discounts (automatic, highest priority)
    const appliedBundles = detectBundleDiscounts(items, bundleDiscounts)
    const bundleDiscountAmount = appliedBundles.reduce((sum, discount) => sum + discount.discount_amount, 0)
    let subtotalAfterBundles = originalSubtotal - bundleDiscountAmount

    // Step 3: Apply coupon discounts (manual, applied to bundle-adjusted price)
    const appliedCoupons = applyCouponDiscounts(subtotalAfterBundles, coupons, appliedBundles)
    const couponDiscountAmount = appliedCoupons.reduce((sum, discount) =>
      discount.applied_to === 'subtotal' ? sum + discount.discount_amount : sum, 0
    )

    // Step 4: Calculate totals
    const totalDiscountAmount = bundleDiscountAmount + couponDiscountAmount
    const discountedSubtotal = originalSubtotal - totalDiscountAmount
    const totalDiscountPercentage = originalSubtotal > 0 ? (totalDiscountAmount / originalSubtotal) * 100 : 0

    // Step 5: Apply maximum discount protection (70% max)
    const maxDiscountCap = 0.70
    let finalSubtotal = discountedSubtotal

    if (totalDiscountPercentage > maxDiscountCap * 100) {
      finalSubtotal = originalSubtotal * (1 - maxDiscountCap)
      const adjustedDiscountAmount = originalSubtotal - finalSubtotal

      // Proportionally adjust applied discounts
      const adjustmentRatio = adjustedDiscountAmount / totalDiscountAmount
      appliedBundles.forEach(discount => {
        discount.discount_amount *= adjustmentRatio
      })
      appliedCoupons.forEach(discount => {
        if (discount.applied_to === 'subtotal') {
          discount.discount_amount *= adjustmentRatio
        }
      })
    }

    // Step 6: Calculate tax and final total
    const { taxRate = 0.0 } = options || {}
    const tax = calculateTax(finalSubtotal, taxRate)
    const shipping = 0 // Digital products
    const finalTotal = finalSubtotal + tax + shipping

    return {
      subtotal: originalSubtotal,
      bundle_discounts: appliedBundles,
      coupon_discounts: appliedCoupons,
      total_discount_amount: originalSubtotal - finalSubtotal,
      total_discount_percentage: ((originalSubtotal - finalSubtotal) / originalSubtotal) * 100,
      tax,
      shipping,
      final_total: finalTotal,
      applied_discounts: [...appliedBundles, ...appliedCoupons]
    }
  }

  return {
    calculateSubtotal,
    calculateOriginalSubtotal,
    calculateTax,
    calculateTotal,
    getCartSummary,
    detectBundleDiscounts,
    detectAppliedBundleDiscounts,
    applyCouponDiscounts,
    calculateCartWithDiscounts
  }
}