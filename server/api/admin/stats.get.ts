import { validateAdminAccess } from '../../utils/adminAuth'
import { createBusinessMetricsCalculator } from '../../utils/businessMetrics'

export default defineEventHandler(async (event) => {
  // Validate admin access and get authenticated supabase client
  const { supabase } = await validateAdminAccess(event)

  try {
    // Use the new business metrics calculator
    const metricsCalculator = createBusinessMetricsCalculator(supabase)
    const stats = await metricsCalculator.getDashboardStats()

    return {
      success: true,
      data: stats
    }

  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch admin statistics'
    })
  }
})
