// Create new coupon API
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { isAdminUser } from '../../utils/security/auth'

interface CreateCouponRequest {
  code: string
  name: string
  description?: string
  type: 'coupon' | 'promotion'
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  usage_limit?: number
  usage_limit_per_customer?: number
  minimum_cart_amount?: number
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
    // Check admin authentication
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const isAdmin = await isAdminUser(user.id, event)
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

    const body = await readBody<CreateCouponRequest>(event)

    // Validate required fields
    if (!body.code || !body.name || !body.type || !body.discount_type || body.discount_value === undefined) {
      return {
        success: false,
        error: 'Missing required fields: code, name, type, discount_type, discount_value'
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
        created_by: user.id
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
