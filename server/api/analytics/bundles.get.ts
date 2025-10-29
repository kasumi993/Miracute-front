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

    // Get bundle sales analytics
    const { data: bundleSales, error: salesError } = await supabase
      .from('bundle_sales')
      .select(`
        bundle_id,
        bundle_name,
        bundle_price,
        savings_amount,
        sold_at,
        order_id
      `)
      .gte('sold_at', startDate.toISOString())
      .lte('sold_at', endDate.toISOString())
      .order('sold_at', { ascending: false })

    if (salesError) {
      throw salesError
    }

    // Aggregate data by bundle
    const bundleStats = bundleSales.reduce((acc, sale) => {
      const { bundle_id, bundle_name, bundle_price, savings_amount } = sale

      if (!acc[bundle_id]) {
        acc[bundle_id] = {
          bundle_id,
          bundle_name,
          sales_count: 0,
          total_revenue: 0,
          total_savings: 0
        }
      }

      acc[bundle_id].sales_count++
      acc[bundle_id].total_revenue += bundle_price
      acc[bundle_id].total_savings += savings_amount

      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort by sales count
    const topBundles = Object.values(bundleStats)
      .sort((a: any, b: any) => b.sales_count - a.sales_count)
      .slice(0, limit)

    // Calculate summary stats
    const totalSales = bundleSales.length
    const totalRevenue = bundleSales.reduce((sum, sale) => sum + sale.bundle_price, 0)
    const totalSavings = bundleSales.reduce((sum, sale) => sum + sale.savings_amount, 0)
    const uniqueBundles = Object.keys(bundleStats).length

    return {
      success: true,
      data: {
        period,
        summary: {
          total_sales: totalSales,
          total_revenue: totalRevenue,
          total_savings_given: totalSavings,
          unique_bundles_sold: uniqueBundles,
          average_sale_value: totalSales > 0 ? totalRevenue / totalSales : 0
        },
        top_bundles: topBundles,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString()
      },
      error: null
    }

  } catch (error: any) {
    console.error('Bundle analytics error:', error)

    if (error.statusCode) {
      throw error
    }

    return {
      success: false,
      error: 'Failed to fetch bundle analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
})