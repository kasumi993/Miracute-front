import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get contact form submissions (admin only)
 */
export const getContactSubmissions = async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ submissions: any[]; pagination: any }>> => {
  const query: any = { page, limit }
  if (status) {query.status = status}
  return baseService.get<{ submissions: any[]; pagination: any }>('/contact/submissions', query)
}

/**
 * Get specific contact submission details
 */
export const getContactSubmission = async (submissionId: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/contact/submissions/${submissionId}`)
}

/**
 * Get support tickets for user
 */
export const getSupportTickets = async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ tickets: any[]; pagination: any }>> => {
  const query: any = { page, limit }
  if (status) {query.status = status}
  return baseService.get<{ tickets: any[]; pagination: any }>('/support/tickets', query)
}

/**
 * Get specific support ticket details
 */
export const getSupportTicket = async (ticketId: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/support/tickets/${ticketId}`)
}

/**
 * Get support ticket messages
 */
export const getTicketMessages = async (ticketId: string, page = 1, limit = 20): Promise<ApiResponse<{ messages: any[]; pagination: any }>> => {
  return baseService.get<{ messages: any[]; pagination: any }>(`/support/tickets/${ticketId}/messages`, { page, limit })
}

/**
 * Get newsletter subscriptions (admin only)
 */
export const getNewsletterSubscriptions = async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ subscriptions: any[]; pagination: any }>> => {
  const query: any = { page, limit }
  if (status) {query.status = status}
  return baseService.get<{ subscriptions: any[]; pagination: any }>('/newsletter/subscriptions', query)
}

/**
 * Get newsletter subscription status for email
 */
export const getNewsletterStatus = async (email: string): Promise<ApiResponse<{ subscribed: boolean; categories: string[]; subscribedAt?: string }>> => {
  return baseService.get<{ subscribed: boolean; categories: string[]; subscribedAt?: string }>('/newsletter/status', { email })
}

/**
 * Get available newsletter categories
 */
export const getNewsletterCategories = async (): Promise<ApiResponse<Array<{ id: string; name: string; description: string }>>> => {
  return baseService.get<Array<{ id: string; name: string; description: string }>>('/newsletter/categories')
}

/**
 * Get FAQ items
 */
export const getFaqItems = async (category?: string): Promise<ApiResponse<Array<{ id: string; question: string; answer: string; category: string; order: number }>>> => {
  const query = category ? { category } : undefined
  return baseService.get<Array<{ id: string; question: string; answer: string; category: string; order: number }>>('/contact/faq', query)
}

/**
 * Get FAQ categories
 */
export const getFaqCategories = async (): Promise<ApiResponse<Array<{ id: string; name: string; description: string; itemCount: number }>>> => {
  return baseService.get<Array<{ id: string; name: string; description: string; itemCount: number }>>('/contact/faq/categories')
}

/**
 * Get contact information and office hours
 */
export const getContactInfo = async (): Promise<ApiResponse<{
  email: string
  phone: string
  address: string
  officeHours: string
  socialMedia: Record<string, string>
  supportChannels: Array<{ type: string; value: string; available: boolean }>
}>> => {
  return baseService.get<{
    email: string
    phone: string
    address: string
    officeHours: string
    socialMedia: Record<string, string>
    supportChannels: Array<{ type: string; value: string; available: boolean }>
  }>('/contact/info')
}

/**
 * Search FAQ items
 */
export const searchFaq = async (query: string): Promise<ApiResponse<Array<{ id: string; question: string; answer: string; category: string; relevance: number }>>> => {
  return baseService.get<Array<{ id: string; question: string; answer: string; category: string; relevance: number }>>('/contact/faq/search', { q: query })
}
