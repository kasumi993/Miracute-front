import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { rateLimit } from '../../utils/security/rateLimit'
import { isAdminUser } from '../../utils/security/auth'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30
  })(event)

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

    const query = getQuery(event)
    const querySchema = z.object({
      period: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default(10)
    })

    const { period, limit } = querySchema.parse(query)
    const supabase = serverSupabaseServiceRole(event)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Get coupon usage analytics
    const { data: couponUsage, error: usageError } = await supabase
      .from('coupon_usages')
      .select(`
        coupon_id,
        coupon_code,
        discount_amount,
        created_at,
        order_id
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (usageError) {
      throw usageError
    }

    // Aggregate data by coupon
    const couponStats = couponUsage.reduce((acc, usage) => {
      const { coupon_code, discount_amount } = usage

      if (!acc[coupon_code]) {
        acc[coupon_code] = {
          coupon_code,
          usage_count: 0,
          total_discount: 0,
          total_savings: 0
        }
      }

      acc[coupon_code].usage_count++
      acc[coupon_code].total_discount += discount_amount
      acc[coupon_code].total_savings += discount_amount

      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort by usage count
    const topCoupons = Object.values(couponStats)
      .sort((a: any, b: any) => b.usage_count - a.usage_count)
      .slice(0, limit)

    // Calculate summary stats
    const totalUsages = couponUsage.length
    const totalSavings = couponUsage.reduce((sum, usage) => sum + usage.discount_amount, 0)
    const uniqueCoupons = Object.keys(couponStats).length

    return {
      success: true,
      data: {
        period,
        summary: {
          total_usages: totalUsages,
          total_savings: totalSavings,
          unique_coupons_used: uniqueCoupons,
          average_discount: totalUsages > 0 ? totalSavings / totalUsages : 0
        },
        top_coupons: topCoupons,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString()
      },
      error: null
    }

  } catch (error: any) {
    console.error('Coupon analytics error:', error)

    if (error.statusCode) {
      throw error
    }

    return {
      success: false,
      error: 'Failed to fetch coupon analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
})