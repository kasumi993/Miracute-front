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

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Coupon not found'
        })
      }
      throw error
    }

    return {
      success: true,
      data: coupon
    }

  } catch (error: any) {
    console.error('Error fetching coupon:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch coupon',
      data: error
    })
  }
})