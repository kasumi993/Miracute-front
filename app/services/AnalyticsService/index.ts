// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified AnalyticsService object for easier usage
export const AnalyticsService = {
  // GET methods
  getTrafficAnalytics: (period?: 'day' | 'week' | 'month' | 'year', startDate?: string, endDate?: string) =>
    import('./get').then(m => m.getTrafficAnalytics(period, startDate, endDate)),
  getUserBehaviorAnalytics: (period?: 'day' | 'week' | 'month' | 'year') => import('./get').then(m => m.getUserBehaviorAnalytics(period)),
  getEcommerceAnalytics: (period?: 'day' | 'week' | 'month' | 'year') => import('./get').then(m => m.getEcommerceAnalytics(period)),
  getConversionFunnel: (funnelType?: 'purchase' | 'signup' | 'download', period?: 'day' | 'week' | 'month' | 'year') =>
    import('./get').then(m => m.getConversionFunnel(funnelType, period)),
  getRealTimeAnalytics: () => import('./get').then(m => m.getRealTimeAnalytics()),
  getSeoAnalytics: (period?: 'day' | 'week' | 'month' | 'year') => import('./get').then(m => m.getSeoAnalytics(period)),
  getCustomerAnalytics: (period?: 'day' | 'week' | 'month' | 'year') => import('./get').then(m => m.getCustomerAnalytics(period)),
  getProductAnalytics: (productId?: string, period?: 'day' | 'week' | 'month' | 'year') =>
    import('./get').then(m => m.getProductAnalytics(productId, period)),
  getCampaignAnalytics: (campaignId?: string, period?: 'day' | 'week' | 'month' | 'year') =>
    import('./get').then(m => m.getCampaignAnalytics(campaignId, period)),
  getCustomReport: (reportId: string, parameters?: Record<string, any>) => import('./get').then(m => m.getCustomReport(reportId, parameters)),
  getDashboardData: (dashboardType?: 'overview' | 'ecommerce' | 'marketing' | 'content') =>
    import('./get').then(m => m.getDashboardData(dashboardType)),
  getAnalytics: (filters?: { period?: string; from?: string; to?: string; simple?: boolean }) =>
    import('./get').then(m => m.getAnalytics(filters)),
  getSimpleStats: () => import('./get').then(m => m.getSimpleStats()),

  // POST methods
  trackEvent: (data: any) => import('./post').then(m => m.trackEvent(data)),
  trackEventsBatch: (events: any[]) => import('./post').then(m => m.trackEventsBatch(events)),
  trackPageView: (data: any) => import('./post').then(m => m.trackPageView(data)),
  trackConversion: (data: any) => import('./post').then(m => m.trackConversion(data)),
  identifyUser: (data: any) => import('./post').then(m => m.identifyUser(data)),
  startSession: (data: any) => import('./post').then(m => m.startSession(data)),
  endSession: (data: any) => import('./post').then(m => m.endSession(data)),
  createCustomReport: (data: any) => import('./post').then(m => m.createCustomReport(data)),
  updateCustomReport: (reportId: string, data: any) => import('./post').then(m => m.updateCustomReport(reportId, data)),
  deleteCustomReport: (reportId: string) => import('./post').then(m => m.deleteCustomReport(reportId)),
  exportReport: (data: any) => import('./post').then(m => m.exportReport(data)),
  createAnalyticsGoal: (data: any) => import('./post').then(m => m.createAnalyticsGoal(data)),
  updateAnalyticsGoal: (goalId: string, data: any) => import('./post').then(m => m.updateAnalyticsGoal(goalId, data)),
  configureIntegration: (data: any) => import('./post').then(m => m.configureIntegration(data)),
  testIntegration: (integrationId: string) => import('./post').then(m => m.testIntegration(integrationId)),
  archiveAnalyticsData: (data: any) => import('./post').then(m => m.archiveAnalyticsData(data)),
  importAnalyticsData: (data: any) => import('./post').then(m => m.importAnalyticsData(data))
}
