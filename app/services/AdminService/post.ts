import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Upload images for admin
 */
export const uploadImages = async (files: File[] | FileList, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> => {
  const { fileUploadService } = await import('../FileUploadService')
  return fileUploadService.uploadImages(files, onProgress)
}

/**
 * Upload product files (digital downloads)
 */
export const uploadProductFiles = async (files: File[] | FileList, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> => {
  const { fileUploadService } = await import('../FileUploadService')
  return fileUploadService.uploadProductFiles(files, onProgress)
}

/**
 * Cleanup unused images
 */
export const cleanupImages = async (): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/files/cleanup-images')
}


/**
 * Subscribe customer to newsletter (admin action)
 */
export const subscribeCustomer = async (customerId: string, subscriptionData: any): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/customers/${customerId}/subscribe`, subscriptionData)
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
 * Execute quick admin action (temporarily mocked)
 */
export const executeQuickAction = async (actionData: {
  action: string
  params?: any
}): Promise<ApiResponse<any>> => {
  // TODO: Implement admin quick actions
  return Promise.resolve({
    success: true,
    data: { message: `Action ${actionData.action} executed` },
    error: null
  })
}

