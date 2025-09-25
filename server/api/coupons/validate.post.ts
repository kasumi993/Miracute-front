// Coupon validation API - Critical for conversion optimization
import { serverSupabaseServiceRole } from '#supabase/server'
import { rateLimit } from '../../utils/rateLimit'
import { createValidator, schemas } from '../../utils/validation'
import { z } from 'zod'

interface CartItem {
  product_id: string
  quantity: number
  price: number
  category_id?: string
}

interface CouponApplication {
  cart_items: CartItem[]
  subtotal: number
  coupon_code: string
  customer_email?: string
  user_id?: string
}

const validateCouponApplication = createValidator(z.object({
  cart_items: z.array(schemas.cartItem),
  subtotal: schemas.positiveNumber,
  coupon_code: schemas.couponCode,
  customer_email: schemas.email.optional(),
  user_id: schemas.uuid.optional()
}))

export default defineEventHandler(async (event) => {
  // Rate limiting for coupon validation
  await rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  })(event)

  try {
    const rawBody = await readBody(event)
    const body = validateCouponApplication(rawBody)
    const { cart_items, subtotal, coupon_code, customer_email, user_id } = body

    if (!coupon_code || !cart_items || cart_items.length === 0) {
      return {
        success: false,
        error: 'Invalid request: missing coupon code or cart items'
      }
    }

    const supabase = serverSupabaseServiceRole(event)

    // Get coupon by code
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (couponError || !coupon) {
      return {
        success: false,
        data: { valid: false, error: 'Invalid or expired coupon code' }
      }
    }

    // Check validity dates
    const now = new Date()
    const validFrom = new Date(coupon.valid_from)
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

    if (now < validFrom || (validUntil && now > validUntil)) {
      return {
        success: false,
        data: { valid: false, error: 'Coupon is not valid at this time' }
      }
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return {
        success: false,
        data: { valid: false, error: 'Coupon usage limit exceeded' }
      }
    }

    // Check minimum order amount
    if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
      return {
        success: false,
        data: {
          valid: false,
          error: `Minimum order amount of $${coupon.minimum_order_amount} required`
        }
      }
    }

    // Check customer eligibility
    if (customer_email && coupon.customer_eligibility !== 'all') {
      // Check if specific emails are targeted
      if (coupon.applicable_customer_emails && coupon.applicable_customer_emails.length > 0) {
        if (!coupon.applicable_customer_emails.includes(customer_email)) {
          return {
            success: false,
            data: { valid: false, error: 'This coupon is not available for your account' }
          }
        }
      }

      // Check customer segment eligibility
      if (coupon.customer_eligibility === 'new_customers') {
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_email', customer_email)
          .eq('payment_status', 'paid')
          .limit(1)

        if (existingOrders && existingOrders.length > 0) {
          return {
            success: false,
            data: { valid: false, error: 'This coupon is only for new customers' }
          }
        }
      }
    }

    // Check per-customer usage limit
    if (coupon.usage_limit_per_customer && customer_email) {
      const { data: userUsage, error: usageError } = await supabase
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('customer_email', customer_email)

      if (!usageError && userUsage && userUsage.length >= coupon.usage_limit_per_customer) {
        return {
          success: false,
          data: { valid: false, error: 'You have already used this coupon' }
        }
      }
    }

    // Calculate discount
    let discountAmount = 0
    let appliedProducts: string[] = []

    // Filter applicable products
    let eligibleItems = cart_items

    if (coupon.applicable_products && coupon.applicable_products.length > 0) {
      eligibleItems = cart_items.filter(item =>
        coupon.applicable_products!.includes(item.product_id)
      )
    }

    if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
      eligibleItems = eligibleItems.filter(item =>
        item.category_id && coupon.applicable_categories!.includes(item.category_id)
      )
    }

    if (coupon.excluded_products && coupon.excluded_products.length > 0) {
      eligibleItems = eligibleItems.filter(item =>
        !coupon.excluded_products!.includes(item.product_id)
      )
    }

    if (eligibleItems.length === 0) {
      return {
        success: false,
        data: { valid: false, error: 'Coupon is not applicable to items in your cart' }
      }
    }

    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    appliedProducts = eligibleItems.map(item => item.product_id)

    // Calculate discount based on type
    switch (coupon.discount_type) {
      case 'percentage':
        discountAmount = eligibleSubtotal * (coupon.discount_value / 100)
        break

      case 'fixed_amount':
        discountAmount = Math.min(coupon.discount_value, eligibleSubtotal)
        break

      case 'buy_x_get_y':
        // Complex BXGY logic
        const buyQty = coupon.buy_quantity || 1
        const getQty = coupon.get_quantity || 1
        const getDiscountPct = coupon.get_discount_percentage || 100

        // Sort items by price (descending) to give discount on most expensive items
        const sortedItems = [...eligibleItems].sort((a, b) => b.price - a.price)

        let totalBought = 0
        let discountItems = 0

        for (const item of sortedItems) {
          const availableQty = item.quantity
          const buyNeeded = Math.max(0, buyQty - totalBought)

          if (buyNeeded > 0) {
            const buyFromThis = Math.min(availableQty, buyNeeded)
            totalBought += buyFromThis

            // Apply discount to remaining items after buy requirement is met
            const remainingQty = availableQty - buyFromThis
            const discountQty = Math.min(remainingQty, getQty - discountItems)

            if (discountQty > 0) {
              discountAmount += item.price * discountQty * (getDiscountPct / 100)
              discountItems += discountQty
            }
          } else {
            // All buy requirements met, apply discount
            const discountQty = Math.min(item.quantity, getQty - discountItems)
            if (discountQty > 0) {
              discountAmount += item.price * discountQty * (getDiscountPct / 100)
              discountItems += discountQty
            }
          }

          if (discountItems >= getQty) {break}
        }
        break

      case 'free_shipping':
        // For now, set fixed shipping discount amount
        discountAmount = 10 // This should be dynamic based on actual shipping cost
        break

      default:
        return {
          success: false,
          data: { valid: false, error: 'Invalid coupon type' }
        }
    }

    // Apply maximum discount limit
    if (coupon.maximum_discount_amount && discountAmount > coupon.maximum_discount_amount) {
      discountAmount = coupon.maximum_discount_amount
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, subtotal)

    return {
      success: true,
      data: {
        valid: true,
        coupon,
        discount_amount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
        applied_products: appliedProducts
      }
    }

  } catch (error: any) {
    console.error('Coupon validation error:', error)
    return {
      success: false,
      error: 'Failed to validate coupon',
      details: error.message
    }
  }
})
