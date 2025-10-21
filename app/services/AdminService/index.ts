// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Export all PATCH methods
export * from './patch'

// Export all DELETE methods
export * from './delete'

// Create a unified AdminService object for easier usage
export const AdminService = {
  // GET methods
  checkAccess: () => import('./get').then(m => m.checkAccess()),
  getProducts: (filters?: any, pagination?: any) => import('./get').then(m => m.getProducts(filters, pagination)),
  getProduct: (id: string) => import('./get').then(m => m.getProduct(id)),
  getCategories: () => import('./get').then(m => m.getCategories()),
  getTemplateTypes: () => import('./get').then(m => m.getTemplateTypes()),
  getStats: () => import('./get').then(m => m.getStats()),
  getAnalytics: (params?: any) => import('./get').then(m => m.getAnalytics(params)),
  getOrders: (filters?: any, pagination?: any) => import('./get').then(m => m.getOrders(filters, pagination)),
  getOrder: (id: string) => import('./get').then(m => m.getOrder(id)),
  getCustomers: (filters?: any, pagination?: any) => import('./get').then(m => m.getCustomers(filters, pagination)),
  getCustomerStats: () => import('./get').then(m => m.getCustomerStats()),
  getReviews: (filters?: any, pagination?: any) => import('./get').then(m => m.getReviews(filters, pagination)),
  getPopularProducts: () => import('./get').then(m => m.getPopularProducts()),
  getOrderStats: (params?: any) => import('./get').then(m => m.getOrderStats(params)),
  getProductStats: (params?: any) => import('./get').then(m => m.getProductStats(params)),
  getDashboardStats: (params?: any) => import('./get').then(m => m.getDashboardStats(params)),

  // POST methods
  uploadImages: (files: File[] | FileList, onProgress?: (progress: number) => void) => import('./post').then(m => m.uploadImages(files, onProgress)),
  cleanupImages: () => import('./post').then(m => m.cleanupImages()),
  testEmail: (emailData: any) => import('./post').then(m => m.testEmail(emailData)),
  testSimpleEmail: (emailData: any) => import('./post').then(m => m.testSimpleEmail(emailData)),
  testPurchaseEmail: (emailData: any) => import('./post').then(m => m.testPurchaseEmail(emailData)),
  diagnoseEmailIssue: (data: any) => import('./post').then(m => m.diagnoseEmailIssue(data)),
  subscribeCustomer: (customerId: string, data: any) => import('./post').then(m => m.subscribeCustomer(customerId, data)),
  executeQuickAction: (actionData: any) => import('./post').then(m => m.executeQuickAction(actionData)),
  exportData: (exportConfig: any) => import('./post').then(m => m.exportData(exportConfig)),

  // PATCH methods
  updateProductStatus: (id: string, isActive: boolean) => import('./patch').then(m => m.updateProductStatus(id, isActive)),
  updateProduct: (id: string, data: any) => import('./patch').then(m => m.updateProduct(id, data)),
  updateOrderStatus: (id: string, status: string) => import('./patch').then(m => m.updateOrderStatus(id, status)),
  updateOrder: (id: string, data: any) => import('./patch').then(m => m.updateOrder(id, data)),
  updateCustomer: (id: string, data: any) => import('./patch').then(m => m.updateCustomer(id, data)),
  updateReview: (id: string, data: any) => import('./patch').then(m => m.updateReview(id, data)),
  updateCategory: (id: string, data: any) => import('./patch').then(m => m.updateCategory(id, data)),

  // DELETE methods
  deleteAdminSession: (sessionId: string) => import('./delete').then(m => m.deleteAdminSession(sessionId)),
  deleteNotification: (id: string) => import('./delete').then(m => m.deleteNotification(id)),
  deleteLogEntry: (id: string) => import('./delete').then(m => m.deleteLogEntry(id)),
  clearAllLogs: (confirm?: boolean) => import('./delete').then(m => m.clearAllLogs(confirm)),
  deleteBackup: (backupId: string) => import('./delete').then(m => m.deleteBackup(backupId)),
  deleteCacheEntry: (key: string) => import('./delete').then(m => m.deleteCacheEntry(key)),
  clearAllCache: () => import('./delete').then(m => m.clearAllCache())
}
