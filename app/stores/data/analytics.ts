import { defineStore } from 'pinia'
import { AnalyticsService } from '@/services/AnalyticsService'
import type { AnalyticsDashboardState } from '@/types/admin/analytics'

export const useAnalyticsDashboardStore = defineStore('analytics-dashboard', {
  state: (): AnalyticsDashboardState => ({
    metrics: null,
    loading: {
      analytics: false
    },
    error: null
  }),

  getters: {
    // Dashboard-specific getters
    currentAnalytics: (state) => state.metrics,
    topPages: (state) => state.metrics?.topPages || [],

    // Loading state
    isLoading: (state) => state.loading.analytics
  },

  actions: {
    /**
     * Fetch analytics data for dashboard
     */
    async fetchAnalytics(filters?: {
      period?: string
      from?: string
      to?: string
    }) {
      this.setLoading('analytics', true)
      this.error = null

      try {
        const response = await AnalyticsService.getAnalytics(filters)

        if (response.success && response.data) {
          this.metrics = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch analytics')
        }
      } catch (error: any) {
        console.error('Error fetching analytics:', error)
        this.error = error.message
      } finally {
        this.setLoading('analytics', false)
      }
    },

    /**
     * Set loading state
     */
    setLoading(type: keyof AnalyticsDashboardState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    }
  }
})