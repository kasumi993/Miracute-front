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
  getDashboardData: () => import('./get').then(m => m.getDashboardData()),
  getStats: () => import('./get').then(m => m.getStats()),
  getAnalytics: (params?: any) => import('./get').then(m => m.getAnalytics(params)),
  getOrders: (filters?: any, pagination?: any) => import('./get').then(m => m.getOrders(filters, pagination)),
  getOrder: (id: string) => import('./get').then(m => m.getOrder(id)),
  getCustomers: (filters?: any, pagination?: any) => import('./get').then(m => m.getCustomers(filters, pagination)),
  getCustomerStats: () => import('./get').then(m => m.getCustomerStats()),
  getReviews: (filters?: any, pagination?: any) => import('./get').then(m => m.getReviews(filters, pagination)),
  getPopularProducts: () => import('./get').then(m => m.getPopularProducts()),
  getDashboardStats: (params?: any) => import('./get').then(m => m.getDashboardStats(params)),
  getAdminAlerts: () => import('./get').then(m => m.getAdminAlerts()),
  getSystemHealth: () => import('./get').then(m => m.getSystemHealth()),

  // POST methods
  createSampleProducts: () => import('./post').then(m => m.createSampleProducts()),
  createSampleCategories: () => import('./post').then(m => m.createSampleCategories()),
  uploadImages: (formData: FormData) => import('./post').then(m => m.uploadImages(formData)),
  cleanupImages: () => import('./post').then(m => m.cleanupImages()),
  testEmail: (emailData: any) => import('./post').then(m => m.testEmail(emailData)),
  testSimpleEmail: (emailData: any) => import('./post').then(m => m.testSimpleEmail(emailData)),
  testPurchaseEmail: (emailData: any) => import('./post').then(m => m.testPurchaseEmail(emailData)),
  diagnoseEmailIssue: (data: any) => import('./post').then(m => m.diagnoseEmailIssue(data)),
  subscribeCustomer: (customerId: string, data: any) => import('./post').then(m => m.subscribeCustomer(customerId, data)),
  requestOrderReviews: (orderId: string) => import('./post').then(m => m.requestOrderReviews(orderId)),
  resendOrderEmail: (orderId: string, emailType: string) => import('./post').then(m => m.resendOrderEmail(orderId, emailType)),
  createReview: (reviewData: any) => import('./post').then(m => m.createReview(reviewData)),
  createProduct: (productData: any) => import('./post').then(m => m.createProduct(productData)),
  createCategory: (categoryData: any) => import('./post').then(m => m.createCategory(categoryData)),
  dismissAlert: (alertId: string) => import('./post').then(m => m.dismissAlert(alertId)),
  markAllAlertsRead: () => import('./post').then(m => m.markAllAlertsRead()),
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
  deleteProduct: (id: string) => import('./delete').then(m => m.deleteProduct(id)),
  deleteCategory: (id: string) => import('./delete').then(m => m.deleteCategory(id)),
  deleteReview: (id: string) => import('./delete').then(m => m.deleteReview(id)),
  deleteOrder: (id: string) => import('./delete').then(m => m.deleteOrder(id)),
  deleteCustomer: (id: string) => import('./delete').then(m => m.deleteCustomer(id)),
  bulkDeleteProducts: (ids: string[]) => import('./delete').then(m => m.bulkDeleteProducts(ids)),
  bulkDeleteCategories: (ids: string[]) => import('./delete').then(m => m.bulkDeleteCategories(ids))
}