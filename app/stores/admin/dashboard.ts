import { defineStore } from 'pinia'
import { AdminService } from '@/services'
import type { Database } from '@/types/database'

type Order = Database['public']['Tables']['orders']['Row']
type Product = Database['public']['Tables']['products']['Row']
type User = Database['public']['Tables']['users']['Row']

export interface DashboardStats {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    revenueGrowth: number
    ordersGrowth: number
    customersGrowth: number
    productsGrowth: number
  }

  recentOrders: Order[]
  topProducts: Array<Product & { sales: number, revenue: number }>
  recentCustomers: User[]

  // Time-based analytics
  revenueByPeriod: Array<{
    period: string
    revenue: number
    orders: number
  }>

  // Product analytics
  productStats: {
    totalProducts: number
    activeProducts: number
    outOfStock: number
    lowStock: number
    featuredProducts: number
  }

  // Customer analytics
  customerStats: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    averageOrderValue: number
  }

  // Order analytics
  orderStats: {
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
    cancelledOrders: number
  }
}



interface AdminDashboardState {
  // Dashboard data
  stats: DashboardStats | null

  // Admin UI state
  selectedDateRange: {
    start: string
    end: string
    preset: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  }

  // Quick filters
  filters: {
    orderStatus: string | null
    productCategory: string | null
    customerType: string | null
  }

  // Loading states
  loading: {
    stats: boolean
    export: boolean
  }

  // Error states
  error: string | null

  // Cache management
  lastFetch: {
    stats: number | null
  }
  cacheTimeout: number
}

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: (): AdminDashboardState => ({
    stats: null,

    selectedDateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset: 'week'
    },

    filters: {
      orderStatus: null,
      productCategory: null,
      customerType: null
    },

    loading: {
      stats: false,
      export: false
    },

    error: null,

    lastFetch: {
      stats: null
    },
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    // Loading states
    isLoading: (state) => Object.values(state.loading).some(loading => loading),

    // Dashboard stats getters
    hasStats: (state) => !!state.stats,

    totalRevenue: (state) => state.stats?.overview.totalRevenue || 0,
    totalOrders: (state) => state.stats?.overview.totalOrders || 0,
    totalCustomers: (state) => state.stats?.overview.totalCustomers || 0,
    totalProducts: (state) => state.stats?.overview.totalProducts || 0,

    revenueGrowth: (state) => state.stats?.overview.revenueGrowth || 0,
    ordersGrowth: (state) => state.stats?.overview.ordersGrowth || 0,
    customersGrowth: (state) => state.stats?.overview.customersGrowth || 0,



    // Cache validation
    isStatsStale: (state) => {
      if (!state.lastFetch.stats) {return true}
      return Date.now() - state.lastFetch.stats > state.cacheTimeout
    },


    // Quick stats for cards
    pendingOrdersCount: (state) => state.stats?.orderStats.pendingOrders || 0,
    lowStockCount: (state) => state.stats?.productStats.lowStock || 0,

    // Performance metrics
    averageOrderValue: (state) => state.stats?.customerStats.averageOrderValue || 0,

    conversionRate: (state) => {
      const stats = state.stats
      if (!stats?.overview.totalCustomers || !stats?.overview.totalOrders) {return 0}
      return (stats.overview.totalOrders / stats.overview.totalCustomers) * 100
    }
  },

  actions: {
    // Loading management
    setLoading(type: keyof AdminDashboardState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    // Dashboard stats
    async fetchDashboardStats(force = false) {
      if (!force && this.hasStats && !this.isStatsStale) {return}

      this.setLoading('stats', true)
      this.setError(null)

      try {
        const response = await AdminService.getDashboardStats({
          startDate: this.selectedDateRange.start,
          endDate: this.selectedDateRange.end,
          ...this.filters
        })

        if (response.success && response.data) {
          this.stats = response.data
          this.lastFetch.stats = Date.now()
        } else {
          throw new Error(response.error || 'Failed to fetch dashboard stats')
        }
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error)
        this.setError(error.message || 'Failed to fetch dashboard stats')
      } finally {
        this.setLoading('stats', false)
      }
    },

    // Date range management
    setDateRange(start: string, end: string, preset: AdminDashboardState['selectedDateRange']['preset'] = 'custom') {
      this.selectedDateRange = { start, end, preset }

      // Refresh stats with new date range
      this.fetchDashboardStats(true)
    },

    setDateRangePreset(preset: AdminDashboardState['selectedDateRange']['preset']) {
      const now = new Date()
      let start: Date
      const end = new Date()

      switch (preset) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          break
        case 'year':
          start = new Date(now.getFullYear(), 0, 1)
          break
        default:
          return
      }

      this.setDateRange(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
        preset
      )
    },

    // Filters
    setFilter(type: keyof AdminDashboardState['filters'], value: string | null) {
      this.filters[type] = value
      this.fetchDashboardStats(true)
    },

    clearFilters() {
      this.filters = {
        orderStatus: null,
        productCategory: null,
        customerType: null
      }
      this.fetchDashboardStats(true)
    },



    // Data export
    async exportData(type: 'orders' | 'customers' | 'products' | 'analytics', format: 'csv' | 'xlsx' = 'csv') {
      this.setLoading('export', true)
      this.setError(null)

      try {
        const response = await AdminService.exportData({
          type,
          format,
          dateRange: this.selectedDateRange,
          filters: this.filters
        })

        if (response.success && response.data) {
          // Trigger download
          const url = response.data.downloadUrl
          const link = document.createElement('a')
          link.href = url
          link.download = response.data.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          throw new Error(response.error || 'Failed to export data')
        }
      } catch (error: any) {
        console.error('Error exporting data:', error)
        this.setError(error.message || 'Failed to export data')
      } finally {
        this.setLoading('export', false)
      }
    },

    // Refresh all data
    async refreshAllData() {
      await Promise.all([
        this.fetchDashboardStats(true)
      ])
    },

    // Clear error
    clearError() {
      this.setError(null)
    },

    // Real-time updates
    setupRealTimeUpdates() {
      // This would typically connect to a WebSocket or SSE
      // For now, we'll use polling
      if (process.client) {
        setInterval(() => {
          // Poll for dashboard stats periodically
          this.fetchDashboardStats(true)
        }, 300000) // Poll every 5 minutes
      }
    },

    // Initialize dashboard
    async initialize() {
      await Promise.all([
        this.fetchDashboardStats()
      ])

      this.setupRealTimeUpdates()
    },

    // Quick actions
    async handleQuickAction(action: string, params?: any) {
      this.setError(null)

      try {
        const response = await AdminService.executeQuickAction({
          action,
          params
        })

        if (response.success) {
          // Refresh relevant data based on action
          switch (action) {
            case 'fulfill_orders':
            case 'cancel_orders':
              await this.fetchDashboardStats(true)
              break
            case 'restock_products':
              await this.fetchDashboardStats(true)
              break
            default:
              break
          }
        } else {
          throw new Error(response.error || 'Failed to execute action')
        }
      } catch (error: any) {
        console.error('Error executing quick action:', error)
        this.setError(error.message || 'Failed to execute action')
      }
    }
  }
})
