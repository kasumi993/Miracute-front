import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  category?: string
  phone?: string
  source?: string
}

export interface NewsletterSubscriptionData {
  email: string
  name?: string
  categories?: string[]
  source?: string
  preferences?: Record<string, any>
}

/**
 * Submit contact form
 */
export const submitContactForm = async (data: ContactFormData): Promise<ApiResponse<{ success: boolean; submissionId: string; message: string }>> => {
  // Send as JSON since attachments are not currently supported
  const cleanData = {
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    phone: data.phone,
    source: data.source || 'contact_form'
  }

  return baseService.post<{ success: boolean; submissionId: string; message: string }>('/contact/submit', cleanData)
}

/**
 * Subscribe to newsletter
 */
export const subscribeNewsletter = async (data: NewsletterSubscriptionData): Promise<ApiResponse<{ success: boolean; message: string; confirmationRequired: boolean }>> => {
  return baseService.post<{ success: boolean; message: string; confirmationRequired: boolean }>('/newsletter/subscribe', data)
}
