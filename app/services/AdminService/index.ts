import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'


const baseService = new BaseApiService()


/**
 * Get order statistics
 */
export const getOrderStats = async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/stats/orders', params)
}

/**
 * Get product statistics
 */
export const getProductStats = async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/stats/products', params)
}

/**
 * Compute overview statistics from orders and products data
 */
const computeOverviewStats = (ordersData: any, productsData: any) => {
  const orderStats = ordersData?.orderStats || {}
  const productStats = productsData?.productStats || {}

  // Calculate total revenue from recent orders (simplified)
  const totalRevenue = ordersData?.recentOrders?.reduce((sum: number, order: any) => {
    return sum + (parseFloat(order.total_amount) || 0)
  }, 0) || 0

  // Extract customer count from orders data (would need proper calculation)
  const totalCustomers = orderStats.totalOrders || 0 // Simplified

  return {
    totalRevenue,
    totalOrders: orderStats.totalOrders || 0,
    totalCustomers,
    totalProducts: productStats.totalProducts || 0,
    revenueGrowth: 0, // Would need historical data
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0
  }
}

/**
 * Get aggregated dashboard statistics by calling multiple endpoints
 */
export const getDashboardStats = async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
  try {
    // Fetch all stats in parallel with error handling
    const [ordersRes, productsRes] = await Promise.allSettled([
      getOrderStats(params),
      getProductStats(params)
    ])

    // Extract data from successful responses, provide defaults for failures
    const ordersData = ordersRes.status === 'fulfilled' && ordersRes.value?.success
      ? ordersRes.value.data
      : {
          recentOrders: [],
          orderStats: {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            paidOrders: 0,
            failedOrders: 0,
            cancelledOrders: 0
          }
        }

    const productsData = productsRes.status === 'fulfilled' && productsRes.value?.success
      ? productsRes.value.data
      : {
          productStats: {
            totalProducts: 0,
            activeProducts: 0,
            inactiveProducts: 0,
            featuredProducts: 0,
            outOfStock: 0,
            lowStock: 0
          }
        }


    // Compute overview stats from the fetched data
    const overview = computeOverviewStats(ordersData, productsData)

    // Combine all stats
    const dashboardStats = {
      overview,
      recentOrders: ordersData.recentOrders || [],
      orderStats: ordersData.orderStats || {},
      productStats: productsData.productStats || {},
      customerStats: {
        totalCustomers: overview.totalCustomers || 0,
        newCustomers: 0,
        returningCustomers: 0,
        averageOrderValue: (overview.totalOrders && overview.totalOrders > 0)
          ? (overview.totalRevenue || 0) / overview.totalOrders
          : 0
      },
      revenueByPeriod: [],
      topProducts: []
    }

    return {
      success: true,
      data: dashboardStats,
      error: null
    }

  } catch (error: any) {
    console.error('Dashboard stats aggregation error:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to fetch dashboard stats'
    }
  }
}

export const AdminService = {
  getOrderStats,
  getProductStats,
  getDashboardStats
}