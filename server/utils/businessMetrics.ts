import type { SupabaseClient } from '@supabase/supabase-js'

export interface DashboardStats {
  // Revenue metrics
  totalRevenue: string
  monthlyRevenue: string
  averageOrderValue: string
  
  // Order metrics
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  orderCompletionRate: number
  
  // Customer metrics
  totalCustomers: number
  newCustomersToday: number
  customerGrowthRate: number
  
  // Product metrics
  totalProducts: number
  activeProducts: number
  
  // Analytics metrics
  storeViewsToday: number
  uniqueVisitorsToday: number
  conversionRate: number
  
  // Growth indicators
  revenueGrowth: number
  orderGrowth: number
  customerGrowthPercentage: number
}

export interface PopularProduct {
  id: string
  name: string
  slug: string
  price: string
  preview_images?: string[]
  view_count: number
  download_count: number
  order_count: number
}

export interface RecentOrder {
  id: string
  order_number: string
  customer_email: string
  total_amount: string
  status: string
  created_at: string
  order_items?: Array<{
    product: {
      name: string
      slug: string
    }
  }>
}

export class BusinessMetricsCalculator {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        ordersData,
        productsData,
        customersData,
        revenueData,
        todayViewsData,
        todayCustomersData
      ] = await Promise.all([
        this.getOrdersStats(),
        this.getProductsStats(),
        this.getCustomersStats(),
        this.getRevenueStats(),
        this.getTodayViews(),
        this.getTodayCustomers()
      ])

      // Calculate derived metrics
      const conversionRate = todayViewsData > 0 
        ? (ordersData.totalOrders / todayViewsData * 100) 
        : 0

      return {
        // Revenue
        totalRevenue: revenueData.total.toFixed(2),
        monthlyRevenue: revenueData.monthly.toFixed(2),
        averageOrderValue: ordersData.totalOrders > 0 
          ? (revenueData.total / ordersData.totalOrders).toFixed(2) 
          : '0.00',
        
        // Orders
        totalOrders: ordersData.totalOrders,
        pendingOrders: ordersData.pendingOrders,
        completedOrders: ordersData.completedOrders,
        orderCompletionRate: ordersData.totalOrders > 0 
          ? Math.round((ordersData.completedOrders / ordersData.totalOrders) * 100)
          : 0,
        
        // Customers
        totalCustomers: customersData.total,
        newCustomersToday: todayCustomersData,
        customerGrowthRate: 0, // TODO: Calculate based on previous period
        
        // Products
        totalProducts: productsData.total,
        activeProducts: productsData.active,
        
        // Analytics
        storeViewsToday: todayViewsData,
        uniqueVisitorsToday: 0, // TODO: Implement unique visitors tracking
        conversionRate: Number(conversionRate.toFixed(2)),
        
        // Growth
        revenueGrowth: 0, // TODO: Calculate based on previous period
        orderGrowth: 0, // TODO: Calculate based on previous period
        customerGrowthPercentage: 0 // TODO: Calculate based on previous period
      }
    } catch (error) {
      console.error('Failed to calculate dashboard stats:', error)
      throw error
    }
  }

  /**
   * Get popular products with analytics data
   */
  async getPopularProducts(limit: number = 5): Promise<PopularProduct[]> {
    try {
      // For now, we'll use a simple query based on order items
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          preview_images,
          order_items!left (
            id,
            product_id
          )
        `)
        .eq('is_active', true)
        .limit(limit)

      if (error) throw error

      // Process the data to calculate metrics
      const productsWithMetrics = data?.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        preview_images: product.preview_images,
        view_count: 0, // TODO: Implement product view tracking
        download_count: 0, // TODO: Implement download tracking
        order_count: product.order_items?.length || 0
      })) || []

      // Sort by order count
      return productsWithMetrics.sort((a, b) => b.order_count - a.order_count)
    } catch (error) {
      console.error('Failed to get popular products:', error)
      return []
    }
  }

  /**
   * Get recent orders with details
   */
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_email,
          total_amount,
          status,
          created_at,
          order_items (
            product:products (
              name,
              slug
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Failed to get recent orders:', error)
      return []
    }
  }

  private async getOrdersStats() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('status')

    if (error) throw error

    const totalOrders = data?.length || 0
    const pendingOrders = data?.filter(order => order.status === 'pending').length || 0
    const completedOrders = data?.filter(order => order.status === 'completed').length || 0

    return {
      totalOrders,
      pendingOrders,
      completedOrders
    }
  }

  private async getProductsStats() {
    const [totalResult, activeResult] = await Promise.all([
      this.supabase.from('products').select('id', { count: 'exact', head: true }),
      this.supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true)
    ])

    return {
      total: totalResult.count || 0,
      active: activeResult.count || 0
    }
  }

  private async getCustomersStats() {
    const { count, error } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    if (error) throw error

    return {
      total: count || 0
    }
  }

  private async getRevenueStats() {
    const [totalResult, monthlyResult] = await Promise.all([
      this.supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid'),
      
      this.supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const totalRevenue = totalResult.data?.reduce((sum, order) => 
      sum + parseFloat(order.total_amount || '0'), 0) || 0
    
    const monthlyRevenue = monthlyResult.data?.reduce((sum, order) => 
      sum + parseFloat(order.total_amount || '0'), 0) || 0

    return {
      total: totalRevenue,
      monthly: monthlyRevenue
    }
  }

  private async getTodayViews(): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Try to get from page_views table, fallback to orders * multiplier
      try {
        const { count, error } = await this.supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        if (!error && count !== null) {
          return count
        }
      } catch (viewsError) {
        console.log('page_views table not available, using fallback')
      }

      // Fallback: use today's orders * 10 as approximation
      const { count } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      return (count || 0) * 10
    } catch (error) {
      console.error('Failed to get today views:', error)
      return 0
    }
  }

  private async getTodayCustomers(): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { count, error } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Failed to get today customers:', error)
      return 0
    }
  }
}

/**
 * Helper function to create business metrics calculator instance
 */
export function createBusinessMetricsCalculator(supabase: SupabaseClient): BusinessMetricsCalculator {
  return new BusinessMetricsCalculator(supabase)
}