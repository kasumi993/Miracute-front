import { requireAdminAuthentication } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Validate admin access and get authenticated supabase client
  const { supabase } = await requireAdminAuthentication(event)

  try {
    // Create business metrics calculator
    const metricsCalculator = createBusinessMetricsCalculator(supabase)

    // Get dashboard data in parallel
    const [stats, recentOrders, popularProducts] = await Promise.all([
      metricsCalculator.getDashboardStats(),
      metricsCalculator.getRecentOrders(5),
      metricsCalculator.getPopularProducts(5)
    ])

    return {
      success: true,
      data: {
        stats,
        recentOrders,
        popularProducts
      }
    }

  } catch (error: any) {
    console.error('Error fetching dashboard data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dashboard data'
    })
  }
})
