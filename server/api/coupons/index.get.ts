import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Try to get user, but don't fail if not authenticated
  let user = null
  try {
    user = await serverSupabaseUser(event)
  } catch {
    // User is not authenticated, which is fine for public access
  }

  // Check if user is admin to determine what data to return
  const isAdmin = user ? await isAdminUser(user.id, event) : false

  try {
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const search = query.search as string || ''
    const status = query.status as string || ''

    const supabase = serverSupabaseServiceRole(event)

    // Build query with different select based on admin status
    let couponQuery = supabase
      .from('coupons')
      .select(
        isAdmin
          ? '*'
          : 'id, code, name, description, discount_type, discount_value, minimum_cart_amount, maximum_discount_amount, valid_from, valid_until, usage_limit, usage_count',
        { count: 'exact' }
      )
      .order(isAdmin ? 'created_at' : 'discount_value', { ascending: false })

    // Non-admin users get filtered public coupons
    if (!isAdmin) {
      couponQuery = couponQuery
        .eq('is_active', true)
        .or('valid_until.is.null,valid_until.gt.now()')
        .eq('customer_eligibility', 'all')
        .is('applicable_customer_emails', null)
    } else {
      // Admin filters
      if (search) {
        couponQuery = couponQuery.or(`code.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (status === 'active') {
        couponQuery = couponQuery.eq('is_active', true)
      } else if (status === 'inactive') {
        couponQuery = couponQuery.eq('is_active', false)
      } else if (status === 'expired') {
        couponQuery = couponQuery.lt('valid_until', new Date().toISOString())
      }
    }

    // Pagination
    const offset = (page - 1) * limit
    couponQuery = couponQuery.range(offset, offset + limit - 1)

    // For non-admin requests, return enriched public data without stats
    if (!isAdmin) {
      const { data: coupons, error: couponsError } = await couponQuery

      if (couponsError) {
        throw couponsError
      }

      // Filter and enrich for public display
      const now = new Date()
      const availableCoupons = coupons?.filter(coupon => {
        // Check usage limit
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
          return false
        }
        return true
      }) || []

      // Add computed fields for frontend display
      const enrichedCoupons = availableCoupons.map(coupon => ({
        ...coupon,
        type: 'promotion',
        discount_display: coupon.discount_type === 'percentage'
          ? `${coupon.discount_value}% OFF`
          : coupon.discount_type === 'fixed_amount'
            ? `$${coupon.discount_value} OFF`
            : 'SPECIAL OFFER',
        expires_soon: coupon.valid_until &&
          new Date(coupon.valid_until).getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000,
        usage_percentage: coupon.usage_limit
          ? Math.round((coupon.usage_count / coupon.usage_limit) * 100)
          : 0
      }))

      return {
        success: true,
        data: enrichedCoupons
      }
    }

    // Admin request - include stats
    const [couponResult, statsResult] = await Promise.all([
      couponQuery,
      supabase.rpc('get_coupon_stats')
    ])

    const { data: coupons, error: couponsError, count } = couponResult
    const { data: statsData, error: statsError } = statsResult

    if (couponsError) {
      throw couponsError
    }

    if (statsError) {
      console.warn('Stats query error:', statsError)
    }

    const stats = statsData && statsData.length > 0 ? {
      totalCoupons: statsData[0].total_coupons || 0,
      activeCoupons: statsData[0].active_coupons || 0,
      totalSavings: statsData[0].total_savings || 0,
      totalUsages: statsData[0].total_usages || 0
    } : {
      totalCoupons: count || 0,
      activeCoupons: 0,
      totalSavings: 0,
      totalUsages: 0
    }

    return {
      success: true,
      data: {
        coupons: coupons || [],
        stats
      }
    }

  } catch (error: any) {
    console.error('Error fetching coupons:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch coupons',
      data: error
    })
  }
})