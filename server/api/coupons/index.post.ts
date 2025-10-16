// Create new coupon API
import { serverSupabaseServiceRole } from '#supabase/server'

interface CreateCouponRequest {
  code: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping'
  discount_value: number
  buy_quantity?: number
  get_quantity?: number
  get_discount_percentage?: number
  usage_limit?: number
  usage_limit_per_customer?: number
  minimum_order_amount?: number
  maximum_discount_amount?: number
  applicable_products?: string[]
  applicable_categories?: string[]
  excluded_products?: string[]
  customer_eligibility: 'all' | 'new_customers' | 'returning_customers' | 'vip_customers'
  applicable_customer_emails?: string[]
  valid_from: string
  valid_until?: string
  is_active: boolean
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateCouponRequest>(event)

    // Validate required fields
    if (!body.code || !body.name || !body.discount_type || body.discount_value === undefined) {
      return {
        success: false,
        error: 'Missing required fields: code, name, discount_type, discount_value'
      }
    }

    // Validate discount type specific fields
    if (body.discount_type === 'buy_x_get_y') {
      if (!body.buy_quantity || !body.get_quantity) {
        return {
          success: false,
          error: 'buy_quantity and get_quantity required for BXGY coupons'
        }
      }
    }

    const supabase = serverSupabaseServiceRole(event)

    // Check if coupon code already exists
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', body.code.toUpperCase())
      .single()

    if (existingCoupon) {
      return {
        success: false,
        error: 'Coupon code already exists'
      }
    }

    // Create coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        ...body,
        code: body.code.toUpperCase(),
        usage_count: 0,
        created_by: null // TODO: Get from auth when admin auth is implemented
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating coupon:', error)
      return {
        success: false,
        error: 'Failed to create coupon',
        details: error.message
      }
    }

    return {
      success: true,
      data: coupon
    }

  } catch (error: any) {
    console.error('Create coupon error:', error)
    return {
      success: false,
      error: 'Failed to create coupon',
      details: error.message
    }
  }
})
