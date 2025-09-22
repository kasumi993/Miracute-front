import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  category?: string
  phone?: string
  urgency?: 'low' | 'medium' | 'high'
  attachments?: File[]
}

export interface NewsletterSubscriptionData {
  email: string
  name?: string
  categories?: string[]
  source?: string
  preferences?: Record<string, any>
}

export interface SupportTicketData {
  subject: string
  message: string
  category: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  productId?: string
  orderId?: string
  attachments?: File[]
}

export interface TicketMessageData {
  message: string
  attachments?: File[]
  internal?: boolean
}

/**
 * Submit contact form
 */
export const submitContactForm = async (data: ContactFormData): Promise<ApiResponse<{ success: boolean; submissionId: string; message: string }>> => {
  const formData = new FormData()

  // Add text fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'attachments' && value !== undefined) {
      formData.append(key, value.toString())
    }
  })

  // Add attachments
  if (data.attachments) {
    data.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file)
    })
  }

  return baseService.post<{ success: boolean; submissionId: string; message: string }>('/contact/submit', formData)
}

/**
 * Subscribe to newsletter
 */
export const subscribeNewsletter = async (data: NewsletterSubscriptionData): Promise<ApiResponse<{ success: boolean; message: string; confirmationRequired: boolean }>> => {
  return baseService.post<{ success: boolean; message: string; confirmationRequired: boolean }>('/newsletter/subscribe', data)
}

/**
 * Unsubscribe from newsletter
 */
export const unsubscribeNewsletter = async (email: string, token?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/newsletter/unsubscribe', { email, token })
}

/**
 * Update newsletter preferences
 */
export const updateNewsletterPreferences = async (email: string, categories: string[], token?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/newsletter/preferences', { email, categories, token })
}

/**
 * Confirm newsletter subscription
 */
export const confirmNewsletterSubscription = async (token: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/newsletter/confirm', { token })
}

/**
 * Create support ticket
 */
export const createSupportTicket = async (data: SupportTicketData): Promise<ApiResponse<{ success: boolean; ticketId: string; message: string }>> => {
  const formData = new FormData()

  // Add text fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'attachments' && value !== undefined) {
      formData.append(key, value.toString())
    }
  })

  // Add attachments
  if (data.attachments) {
    data.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file)
    })
  }

  return baseService.post<{ success: boolean; ticketId: string; message: string }>('/support/tickets', formData)
}

/**
 * Add message to support ticket
 */
export const addTicketMessage = async (ticketId: string, data: TicketMessageData): Promise<ApiResponse<{ success: boolean; messageId: string }>> => {
  const formData = new FormData()

  formData.append('message', data.message)
  if (data.internal !== undefined) {
    formData.append('internal', data.internal.toString())
  }

  // Add attachments
  if (data.attachments) {
    data.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file)
    })
  }

  return baseService.post<{ success: boolean; messageId: string }>(`/support/tickets/${ticketId}/messages`, formData)
}

/**
 * Close support ticket
 */
export const closeSupportTicket = async (ticketId: string, reason?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/support/tickets/${ticketId}/close`, { reason })
}

/**
 * Reopen support ticket
 */
export const reopenSupportTicket = async (ticketId: string, message: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/support/tickets/${ticketId}/reopen`, { message })
}

/**
 * Update contact submission status (admin only)
 */
export const updateContactSubmissionStatus = async (submissionId: string, status: string, response?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/contact/submissions/${submissionId}/status`, { status, response })
}

/**
 * Bulk update newsletter subscriptions (admin only)
 */
export const bulkUpdateNewsletterSubscriptions = async (data: {
  action: 'subscribe' | 'unsubscribe' | 'update_categories'
  emails: string[]
  categories?: string[]
}): Promise<ApiResponse<{ success: boolean; processed: number; errors: string[] }>> => {
  return baseService.post<{ success: boolean; processed: number; errors: string[] }>('/newsletter/bulk-update', data)
}

/**
 * Send newsletter campaign (admin only)
 */
export const sendNewsletterCampaign = async (data: {
  subject: string
  content: string
  categories: string[]
  scheduleAt?: string
  testEmails?: string[]
}): Promise<ApiResponse<{ success: boolean; campaignId: string; message: string }>> => {
  return baseService.post<{ success: boolean; campaignId: string; message: string }>('/newsletter/send-campaign', data)
}