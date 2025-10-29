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

    const supabase = serverSupabaseServiceRole(event)

    // Delete coupon (analytics preserved separately)
    const { data, error: deleteError } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId)
      .select('code')
      .single()

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Coupon not found'
        })
      }
      throw deleteError
    }

    return {
      success: true,
      data: {
        message: 'Coupon deleted successfully',
        coupon_code: data.code
      }
    }

  } catch (error: any) {
    console.error('Error deleting coupon:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete coupon',
      data: error
    })
  }
})