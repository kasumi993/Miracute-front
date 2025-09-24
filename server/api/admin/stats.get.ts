import { requireAdminAuthentication } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Validate admin access and get authenticated supabase client
  const { supabase } = await requireAdminAuthentication(event)

  try {
    // Basic admin dashboard stats
    const [ordersResult, productsResult, reviewsResult] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact' }),
      supabase.from('products').select('*', { count: 'exact' }),
      supabase.from('reviews').select('*', { count: 'exact' })
    ])

    const stats = {
      orders: ordersResult.count || 0,
      products: productsResult.count || 0,
      reviews: reviewsResult.count || 0,
      revenue: 0 // Placeholder for revenue calculation
    }

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
