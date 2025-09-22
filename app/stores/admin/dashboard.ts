import { defineStore } from 'pinia'
import { AdminService } from '~/services'
import type { Database } from '~/types/database'

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

export interface AdminAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  action?: {
    label: string
    url: string
  }
  createdAt: string
  dismissed: boolean
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  lastCheck: string
  services: Array<{
    name: string
    status: 'up' | 'down' | 'degraded'
    responseTime?: number
    lastCheck: string
  }>
}

interface AdminDashboardState {
  // Dashboard data
  stats: DashboardStats | null

  // Admin notifications and alerts
  alerts: AdminAlert[]
  unreadAlertsCount: number

  // System monitoring
  systemHealth: SystemHealth | null

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
    alerts: boolean
    systemHealth: boolean
    export: boolean
  }

  // Error states
  error: string | null

  // Cache management
  lastFetch: {
    stats: number | null
    alerts: number | null
    systemHealth: number | null
  }
  cacheTimeout: number
}

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: (): AdminDashboardState => ({
    stats: null,
    alerts: [],
    unreadAlertsCount: 0,
    systemHealth: null,

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
      alerts: false,
      systemHealth: false,
      export: false
    },

    error: null,

    lastFetch: {
      stats: null,
      alerts: null,
      systemHealth: null
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

    // Alerts getters
    hasUnreadAlerts: (state) => state.unreadAlertsCount > 0,

    criticalAlerts: (state) => state.alerts.filter(alert =>
      alert.type === 'error' && !alert.dismissed
    ),

    warningAlerts: (state) => state.alerts.filter(alert =>
      alert.type === 'warning' && !alert.dismissed
    ),

    unreadAlerts: (state) => state.alerts.filter(alert => !alert.dismissed),

    // System health getters
    isSystemHealthy: (state) => state.systemHealth?.status === 'healthy',

    systemStatus: (state) => state.systemHealth?.status || 'unknown',

    downtimeServices: (state) => state.systemHealth?.services?.filter(service =>
      service.status === 'down'
    ) || [],

    degradedServices: (state) => state.systemHealth?.services?.filter(service =>
      service.status === 'degraded'
    ) || [],

    // Cache validation
    isStatsStale: (state) => {
      if (!state.lastFetch.stats) return true
      return Date.now() - state.lastFetch.stats > state.cacheTimeout
    },

    isAlertsStale: (state) => {
      if (!state.lastFetch.alerts) return true
      return Date.now() - state.lastFetch.alerts > state.cacheTimeout
    },

    // Quick stats for cards
    pendingOrdersCount: (state) => state.stats?.orderStats.pendingOrders || 0,
    lowStockCount: (state) => state.stats?.productStats.lowStock || 0,

    // Performance metrics
    averageOrderValue: (state) => state.stats?.customerStats.averageOrderValue || 0,

    conversionRate: (state) => {
      const stats = state.stats
      if (!stats?.overview.totalCustomers || !stats?.overview.totalOrders) return 0
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
      if (!force && this.hasStats && !this.isStatsStale) return

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
      let end = new Date()

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

    // Alerts management
    async fetchAlerts(force = false) {
      if (!force && this.alerts.length > 0 && !this.isAlertsStale) return

      this.setLoading('alerts', true)
      this.setError(null)

      try {
        const response = await AdminService.getAdminAlerts()

        if (response.success && response.data) {
          this.alerts = response.data
          this.unreadAlertsCount = response.data.filter(alert => !alert.dismissed).length
          this.lastFetch.alerts = Date.now()
        } else {
          throw new Error(response.error || 'Failed to fetch alerts')
        }
      } catch (error: any) {
        console.error('Error fetching alerts:', error)
        this.setError(error.message || 'Failed to fetch alerts')
      } finally {
        this.setLoading('alerts', false)
      }
    },

    async dismissAlert(alertId: string) {
      try {
        const response = await AdminService.dismissAlert(alertId)

        if (response.success) {
          const alert = this.alerts.find(a => a.id === alertId)
          if (alert) {
            alert.dismissed = true
            this.unreadAlertsCount = Math.max(0, this.unreadAlertsCount - 1)
          }
        } else {
          throw new Error(response.error || 'Failed to dismiss alert')
        }
      } catch (error: any) {
        console.error('Error dismissing alert:', error)
        this.setError(error.message || 'Failed to dismiss alert')
      }
    },

    async markAllAlertsRead() {
      try {
        const response = await AdminService.markAllAlertsRead()

        if (response.success) {
          this.alerts.forEach(alert => {
            alert.dismissed = true
          })
          this.unreadAlertsCount = 0
        } else {
          throw new Error(response.error || 'Failed to mark alerts as read')
        }
      } catch (error: any) {
        console.error('Error marking alerts as read:', error)
        this.setError(error.message || 'Failed to mark alerts as read')
      }
    },

    // System health
    async fetchSystemHealth(force = false) {
      if (!force && this.systemHealth && Date.now() - (this.lastFetch.systemHealth || 0) < this.cacheTimeout) {
        return
      }

      this.setLoading('systemHealth', true)

      try {
        const response = await AdminService.getSystemHealth()

        if (response.success && response.data) {
          this.systemHealth = response.data
          this.lastFetch.systemHealth = Date.now()
        } else {
          throw new Error(response.error || 'Failed to fetch system health')
        }
      } catch (error: any) {
        console.error('Error fetching system health:', error)
        // Don't set error for system health as it's not critical
      } finally {
        this.setLoading('systemHealth', false)
      }
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
        this.fetchDashboardStats(true),
        this.fetchAlerts(true),
        this.fetchSystemHealth(true)
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
          this.fetchAlerts(true)
          this.fetchSystemHealth(true)
        }, 30000) // Poll every 30 seconds
      }
    },

    // Initialize dashboard
    async initialize() {
      await Promise.all([
        this.fetchDashboardStats(),
        this.fetchAlerts(),
        this.fetchSystemHealth()
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
  },

})