import type { ProductWithCategory, ApiResponse, SearchResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

export interface AdminProductFilters {
  search?: string
  category?: string
  status?: 'active' | 'inactive' | 'featured' | 'all'
  template_type?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

const baseService = new BaseApiService()

/**
 * Check if current user has admin access
 */
export const checkAccess = async (): Promise<{ isAdmin: boolean; error?: string; role?: string; userId?: string; email?: string }> => {
  try {
    const response = await baseService.get<{ isAdmin: boolean; error?: string; role?: string; userId?: string; email?: string }>('/admin/check-access')
    return response.data || { isAdmin: false, error: 'No data returned' }
  } catch (error: any) {
    console.error('Admin access check failed:', error)
    return {
      isAdmin: false,
      error: error.message || 'Failed to check admin access'
    }
  }
}

/**
 * Get paginated list of products with filters
 */
export const getProducts = async (
  filters: AdminProductFilters = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  const query = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 20
  }

  return baseService.get<SearchResponse<ProductWithCategory>>('/admin/products', query)
}

/**
 * Get single product by ID
 */
export const getProduct = async (id: string): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.get<ProductWithCategory>(`/admin/products/${id}`)
}

/**
 * Get categories for admin
 */
export const getCategories = async (): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>('/admin/categories')
}

/**
 * Get template types for filtering
 */
export const getTemplateTypes = async (): Promise<ApiResponse<string[]>> => {
  return baseService.get<string[]>('/admin/template-types')
}

/**
 * Get admin dashboard data
 */
export const getDashboardData = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/admin/dashboard-data')
}

/**
 * Get admin statistics
 */
export const getStats = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/admin/stats')
}

/**
 * Get admin analytics
 */
export const getAnalytics = async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/admin/analytics', params)
}

/**
 * Get admin orders
 */
export const getOrders = async (filters?: Record<string, any>, pagination?: PaginationParams): Promise<ApiResponse<any>> => {
  const query = {
    ...filters,
    page: pagination?.page || 1,
    limit: pagination?.limit || 20
  }
  return baseService.get<any>('/admin/orders', query)
}

/**
 * Get single admin order
 */
export const getOrder = async (id: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/admin/orders/${id}`)
}

/**
 * Get admin customers
 */
export const getCustomers = async (filters?: Record<string, any>, pagination?: PaginationParams): Promise<ApiResponse<any>> => {
  const query = {
    ...filters,
    page: pagination?.page || 1,
    limit: pagination?.limit || 20
  }
  return baseService.get<any>('/admin/customers', query)
}

/**
 * Get customer statistics
 */
export const getCustomerStats = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/admin/customers/stats')
}

/**
 * Get admin reviews
 */
export const getReviews = async (filters?: Record<string, any>, pagination?: PaginationParams): Promise<ApiResponse<any>> => {
  const query = {
    ...filters,
    page: pagination?.page || 1,
    limit: pagination?.limit || 20
  }
  return baseService.get<any>('/admin/reviews', query)
}

/**
 * Get popular products for admin
 */
export const getPopularProducts = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/admin/products/popular')
}

/**
 * Get dashboard statistics with filters
 */
export const getDashboardStats = async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/admin/dashboard/stats', params)
}

/**
 * Get admin alerts
 */
export const getAdminAlerts = async (): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>('/admin/alerts')
}

/**
 * Get system health status
 */
export const getSystemHealth = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/admin/system/health')
}