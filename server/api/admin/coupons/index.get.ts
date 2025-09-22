// Admin coupons management API
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all'
    } = query

    const supabase = serverSupabaseServiceRole(event)

    // Build query
    let queryBuilder = supabase
      .from('coupons')
      .select(`
        *,
        coupon_usage (
          id,
          customer_email,
          discount_amount,
          used_at
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      queryBuilder = queryBuilder.or(`code.ilike.%${search}%,name.ilike.%${search}%`)
    }

    if (status === 'active') {
      queryBuilder = queryBuilder
        .eq('is_active', true)
        .or('valid_until.is.null,valid_until.gt.now()')
    } else if (status === 'inactive') {
      queryBuilder = queryBuilder.eq('is_active', false)
    } else if (status === 'expired') {
      queryBuilder = queryBuilder.lt('valid_until', new Date().toISOString())
    }

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit)
    queryBuilder = queryBuilder
      .range(offset, offset + Number(limit) - 1)
      .order('created_at', { ascending: false })

    const { data: coupons, error, count } = await queryBuilder

    if (error) {
      console.error('Error fetching coupons:', error)
      return {
        success: false,
        error: 'Failed to fetch coupons'
      }
    }

    // Calculate analytics for each coupon
    const enrichedCoupons = coupons?.map(coupon => {
      const usageData = coupon.coupon_usage || []
      const totalUsage = usageData.length
      const totalDiscount = usageData.reduce((sum: number, usage: any) =>
        sum + Number(usage.discount_amount), 0)

      return {
        ...coupon,
        analytics: {
          total_usage: totalUsage,
          total_discount_given: totalDiscount,
          usage_rate: coupon.usage_limit
            ? Math.round((totalUsage / coupon.usage_limit) * 100)
            : 0,
          last_used: usageData.length > 0
            ? usageData[usageData.length - 1].used_at
            : null
        }
      }
    }) || []

    const totalPages = Math.ceil((count || 0) / Number(limit))

    return {
      success: true,
      data: {
        data: enrichedCoupons,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages
        }
      }
    }

  } catch (error: any) {
    console.error('Admin coupons fetch error:', error)
    return {
      success: false,
      error: 'Failed to fetch coupons',
      details: error.message
    }
  }
})