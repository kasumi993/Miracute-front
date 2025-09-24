import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface ReviewData {
  productId: string
  rating: number
  title: string
  content: string
  pros?: string[]
  cons?: string[]
  wouldRecommend?: boolean
  photos?: File[]
  orderId?: string
  anonymous?: boolean
}

export interface ReviewResponseData {
  content: string
  type: 'vendor' | 'admin' | 'customer_service'
  internal?: boolean
}

export interface ReviewModerationData {
  status: 'approved' | 'rejected' | 'pending'
  reason?: string
  moderatorNotes?: string
}

export interface ReviewUpdateData {
  rating?: number
  title?: string
  content?: string
  pros?: string[]
  cons?: string[]
  wouldRecommend?: boolean
}

/**
 * Submit a new product review
 */
export const submitReview = async (data: any): Promise<ApiResponse<any>> => {
  // Direct pass-through to match the existing API format
  return baseService.post<any>('/reviews/submit', data)
}

/**
 * Update an existing review
 */
export const updateReview = async (reviewId: string, data: ReviewUpdateData): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/reviews/${reviewId}`, data)
}

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string, reason?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/reviews/${reviewId}/delete`, { reason })
}

/**
 * Vote on review helpfulness
 */
export const voteReviewHelpful = async (reviewId: string, helpful: boolean): Promise<ApiResponse<{ success: boolean; helpful: number; notHelpful: number }>> => {
  return baseService.post<{ success: boolean; helpful: number; notHelpful: number }>(`/reviews/${reviewId}/vote`, { helpful })
}

/**
 * Report a review for inappropriate content
 */
export const reportReview = async (reviewId: string, reason: string, details?: string): Promise<ApiResponse<{ success: boolean; reportId: string; message: string }>> => {
  return baseService.post<{ success: boolean; reportId: string; message: string }>(`/reviews/${reviewId}/report`, { reason, details })
}

/**
 * Add a response to a review (vendor/admin)
 */
export const addReviewResponse = async (reviewId: string, data: ReviewResponseData): Promise<ApiResponse<{ success: boolean; responseId: string; message: string }>> => {
  return baseService.post<{ success: boolean; responseId: string; message: string }>(`/reviews/${reviewId}/responses`, data)
}

/**
 * Update review response
 */
export const updateReviewResponse = async (responseId: string, content: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/reviews/responses/${responseId}`, { content })
}

/**
 * Delete review response
 */
export const deleteReviewResponse = async (responseId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/reviews/responses/${responseId}/delete`, {})
}

/**
 * Moderate a review (admin only)
 */
export const moderateReview = async (reviewId: string, data: ReviewModerationData): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/admin/reviews/${reviewId}/moderate`, data)
}

/**
 * Bulk moderate reviews (admin only)
 */
export const bulkModerateReviews = async (reviewIds: string[], action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<{ success: boolean; processed: number; errors: string[] }>> => {
  return baseService.post<{ success: boolean; processed: number; errors: string[] }>('/admin/reviews/bulk-moderate', {
    reviewIds,
    action,
    reason
  })
}

/**
 * Request review from customer
 */
export const requestReview = async (data: {
  customerId: string
  productId: string
  orderId: string
  message?: string
  reminderDate?: string
}): Promise<ApiResponse<{ success: boolean; requestId: string; message: string }>> => {
  return baseService.post<{ success: boolean; requestId: string; message: string }>('/reviews/request', data)
}

/**
 * Send review reminder
 */
export const sendReviewReminder = async (requestId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/reviews/requests/${requestId}/remind`, {})
}

/**
 * Import reviews from external source
 */
export const importReviews = async (data: {
  source: string
  reviews: Array<{
    productId: string
    customerEmail: string
    rating: number
    title: string
    content: string
    createdAt: string
    verified?: boolean
  }>
}): Promise<ApiResponse<{ success: boolean; imported: number; errors: string[] }>> => {
  return baseService.post<{ success: boolean; imported: number; errors: string[] }>('/admin/reviews/import', data)
}

/**
 * Generate review insights report
 */
export const generateReviewInsights = async (data: {
  productIds?: string[]
  dateFrom?: string
  dateTo?: string
  includeDetails?: boolean
}): Promise<ApiResponse<{ reportId: string; downloadUrl: string; expiresAt: string }>> => {
  return baseService.post<{ reportId: string; downloadUrl: string; expiresAt: string }>('/admin/reviews/insights', data)
}

/**
 * Add edit note to a review
 */
export const addReviewEditNote = async (reviewId: string, data: {
  note: string
  note_type: 'edit' | 'clarification' | 'update'
}): Promise<ApiResponse<{ success: boolean; message: string; editNote: any }>> => {
  return baseService.post<{ success: boolean; message: string; editNote: any }>(`/reviews/${reviewId}/notes`, data)
}

/**
 * Toggle review anonymity
 */
export const toggleReviewAnonymity = async (reviewId: string, isAnonymous: boolean): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.patch<{ success: boolean; message: string }>(`/reviews/${reviewId}/anonymity`, { is_anonymous: isAnonymous })
}

/**
 * Import reviews via CSV (Admin only)
 */
export const importReviewsCSV = async (data: {
  csvData: string
  productId: string
}): Promise<ApiResponse<{ success: boolean; message: string; results: any }>> => {
  return baseService.post<{ success: boolean; message: string; results: any }>('/admin/reviews/import-csv', data)
}