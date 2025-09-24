import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Create sample products (for testing)
 */
export const createSampleProducts = async (): Promise<ApiResponse<void>> => {
  return baseService.post<void>('/admin/products/sample')
}

/**
 * Create sample categories
 */
export const createSampleCategories = async (): Promise<ApiResponse<void>> => {
  return baseService.post<void>('/admin/categories/sample')
}

/**
 * Upload images for admin
 */
export const uploadImages = async (formData: FormData): Promise<ApiResponse<any>> => {
  return baseService.request<any>('/admin/upload-images', {
    method: 'POST',
    body: formData,
    headers: {} // Remove Content-Type to let browser set it for FormData
  })
}

/**
 * Upload product files (digital downloads)
 */
export const uploadProductFiles = async (formData: FormData): Promise<ApiResponse<any>> => {
  return baseService.request<any>('/admin/upload-files', {
    method: 'POST',
    body: formData,
    headers: {} // Remove Content-Type to let browser set it for FormData
  })
}

/**
 * Cleanup unused images
 */
export const cleanupImages = async (): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/cleanup-images')
}

/**
 * Test email functionality
 */
export const testEmail = async (emailData: {
  to: string
  subject: string
  body: string
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/test-email', emailData)
}

/**
 * Test simple email
 */
export const testSimpleEmail = async (emailData: {
  to: string
  message: string
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/test-simple-email', emailData)
}

/**
 * Test purchase email
 */
export const testPurchaseEmail = async (emailData: {
  to: string
  orderData: any
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/test-purchase-email', emailData)
}

/**
 * Diagnose email issues
 */
export const diagnoseEmailIssue = async (diagnosticData: any): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/diagnose-email-issue', diagnosticData)
}

/**
 * Subscribe customer to newsletter (admin action)
 */
export const subscribeCustomer = async (customerId: string, subscriptionData: any): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/admin/customers/${customerId}/subscribe`, subscriptionData)
}

/**
 * Request reviews for an order
 */
export const requestOrderReviews = async (orderId: string): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/admin/orders/${orderId}/request-reviews`)
}

/**
 * Resend order email
 */
export const resendOrderEmail = async (orderId: string, emailType: string): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/admin/orders/${orderId}/resend-email`, { emailType })
}

/**
 * Create admin review
 */
export const createReview = async (reviewData: {
  product_id: string
  user_id: string
  rating: number
  title?: string
  comment?: string
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/reviews/create', reviewData)
}

/**
 * Create new product (admin)
 */
export const createProduct = async (productData: any): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/products', productData)
}

/**
 * Create new category (admin)
 */
export const createCategory = async (categoryData: {
  name: string
  slug?: string
  description?: string
  parent_id?: string
  is_active?: boolean
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/categories', categoryData)
}

/**
 * Bulk import products
 */
export const bulkImportProducts = async (importData: any): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/products/bulk-import', importData)
}

/**
 * Export admin data
 */
export const exportData = async (exportConfig: {
  type: 'products' | 'orders' | 'customers' | 'reviews'
  format: 'csv' | 'json' | 'xlsx'
  filters?: any
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/export', exportConfig)
}

/**
 * Generate admin reports
 */
export const generateReport = async (reportConfig: {
  type: string
  period: string
  filters?: any
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/reports/generate', reportConfig)
}

/**
 * Send admin notification
 */
export const sendNotification = async (notificationData: {
  type: string
  recipients: string[]
  subject: string
  message: string
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/notifications/send', notificationData)
}

/**
 * Dismiss admin alert
 */
export const dismissAlert = async (alertId: string): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/admin/alerts/${alertId}/dismiss`)
}

/**
 * Mark all alerts as read
 */
export const markAllAlertsRead = async (): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/alerts/mark-all-read')
}

/**
 * Execute quick admin action
 */
export const executeQuickAction = async (actionData: {
  action: string
  params?: any
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/admin/actions/execute', actionData)
}

