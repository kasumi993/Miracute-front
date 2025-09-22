// Public coupons API - Show available promotions for marketing
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get publicly visible active coupons
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select(`
        id,
        code,
        name,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        maximum_discount_amount,
        valid_from,
        valid_until,
        usage_limit,
        usage_count
      `)
      .eq('is_active', true)
      .or('valid_until.is.null,valid_until.gt.now()')
      .eq('customer_eligibility', 'all')
      .is('applicable_customer_emails', null)
      .order('discount_value', { ascending: false })

    if (error) {
      console.error('Error fetching public coupons:', error)
      return {
        success: false,
        error: 'Failed to fetch coupons'
      }
    }

    // Filter out expired or used up coupons
    const now = new Date()
    const availableCoupons = coupons?.filter(coupon => {
      // Check expiry
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return false
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return false
      }

      return true
    }) || []

    // Add computed fields for frontend display
    const enrichedCoupons = availableCoupons.map(coupon => ({
      ...coupon,
      discount_display: coupon.discount_type === 'percentage'
        ? `${coupon.discount_value}% OFF`
        : coupon.discount_type === 'fixed_amount'
        ? `$${coupon.discount_value} OFF`
        : coupon.discount_type === 'free_shipping'
        ? 'FREE SHIPPING'
        : 'SPECIAL OFFER',
      expires_soon: coupon.valid_until &&
        new Date(coupon.valid_until).getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000, // 7 days
      usage_percentage: coupon.usage_limit
        ? Math.round((coupon.usage_count / coupon.usage_limit) * 100)
        : 0
    }))

    return {
      success: true,
      data: enrichedCoupons
    }

  } catch (error: any) {
    console.error('Public coupons error:', error)
    return {
      success: false,
      error: 'Failed to fetch public coupons',
      details: error.message
    }
  }
})