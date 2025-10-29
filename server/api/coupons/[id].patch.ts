import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
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

  try {
    const couponId = getRouterParam(event, 'id')
    if (!couponId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Coupon ID is required'
      })
    }

    const body = await readBody(event)
    const supabase = serverSupabaseServiceRole(event)

    // Prepare update data
    const updateData = { ...body }
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase()
    }

    // Validate discount value if provided
    if (updateData.discount_type && updateData.discount_value !== undefined) {
      if (updateData.discount_type === 'percentage' && (updateData.discount_value < 0 || updateData.discount_value > 100)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Percentage discount must be between 0 and 100'
        })
      }

      if (updateData.discount_type === 'fixed_amount' && updateData.discount_value < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Fixed amount discount must be positive'
        })
      }
    }

    // Update coupon - let database handle uniqueness constraint
    const { data: updatedCoupon, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', couponId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Coupon not found'
        })
      }
      // Handle unique constraint violation for coupon code
      if (error.code === '23505' && error.message.includes('code')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Coupon code already exists'
        })
      }
      throw error
    }

    return {
      success: true,
      data: updatedCoupon
    }

  } catch (error: any) {
    console.error('Error updating coupon:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update coupon',
      data: error
    })
  }
})