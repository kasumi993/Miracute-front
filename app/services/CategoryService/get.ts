import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get all categories with hierarchy
 */
export const getCategories = async (includeHidden = false): Promise<ApiResponse<any[]>> => {
  const query = includeHidden ? { includeHidden: 'true' } : undefined
  return baseService.get<any[]>('/categories', query)
}

/**
 * Get category tree structure
 */
export const getCategoryTree = async (maxDepth?: number): Promise<ApiResponse<any[]>> => {
  const query = maxDepth ? { maxDepth: maxDepth.toString() } : undefined
  return baseService.get<any[]>('/categories/tree', query)
}

/**
 * Get specific category details
 */
export const getCategory = async (categoryId: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/categories/${categoryId}`)
}

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/categories/slug/${slug}`)
}

/**
 * Get products in a category
 */
export const getCategoryProducts = async (
  categoryId: string,
  page = 1,
  limit = 20,
  sortBy?: string,
  filters?: Record<string, any>
): Promise<ApiResponse<{ products: any[]; pagination: any; filters: any }>> => {
  const query: any = { page, limit }
  if (sortBy) query.sortBy = sortBy
  if (filters) Object.assign(query, filters)
  return baseService.get<{ products: any[]; pagination: any; filters: any }>(`/categories/${categoryId}/products`, query)
}

/**
 * Get category statistics
 */
export const getCategoryStats = async (categoryId: string): Promise<ApiResponse<{
  totalProducts: number
  activeProducts: number
  totalSales: number
  revenue: number
  averageRating: number
  subcategoriesCount: number
  topProducts: any[]
  recentActivity: any[]
}>> => {
  return baseService.get<{
    totalProducts: number
    activeProducts: number
    totalSales: number
    revenue: number
    averageRating: number
    subcategoriesCount: number
    topProducts: any[]
    recentActivity: any[]
  }>(`/categories/${categoryId}/stats`)
}

/**
 * Get subcategories of a category
 */
export const getSubcategories = async (categoryId: string, includeHidden = false): Promise<ApiResponse<any[]>> => {
  const query = includeHidden ? { includeHidden: 'true' } : undefined
  return baseService.get<any[]>(`/categories/${categoryId}/subcategories`, query)
}

/**
 * Get category breadcrumbs
 */
export const getCategoryBreadcrumbs = async (categoryId: string): Promise<ApiResponse<Array<{ id: string; name: string; slug: string }>>> => {
  return baseService.get<Array<{ id: string; name: string; slug: string }>>(`/categories/${categoryId}/breadcrumbs`)
}

/**
 * Get popular categories
 */
export const getPopularCategories = async (
  limit = 10,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<Array<{ id: string; name: string; slug: string; productCount: number; sales: number; revenue: number }>>> => {
  return baseService.get<Array<{ id: string; name: string; slug: string; productCount: number; sales: number; revenue: number }>>(
    '/categories/popular',
    { limit, period }
  )
}

/**
 * Get featured categories
 */
export const getFeaturedCategories = async (): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>('/categories/featured')
}

/**
 * Search categories
 */
export const searchCategories = async (
  query: string,
  page = 1,
  limit = 20
): Promise<ApiResponse<{ categories: any[]; pagination: any }>> => {
  return baseService.get<{ categories: any[]; pagination: any }>('/categories/search', { q: query, page, limit })
}

/**
 * Get category filters/attributes
 */
export const getCategoryFilters = async (categoryId: string): Promise<ApiResponse<Array<{
  name: string
  type: 'select' | 'range' | 'checkbox' | 'text'
  options?: Array<{ value: string; label: string; count: number }>
  min?: number
  max?: number
}>>> => {
  return baseService.get<Array<{
    name: string
    type: 'select' | 'range' | 'checkbox' | 'text'
    options?: Array<{ value: string; label: string; count: number }>
    min?: number
    max?: number
  }>>(`/categories/${categoryId}/filters`)
}

/**
 * Get category recommendations based on user behavior
 */
export const getCategoryRecommendations = async (
  categoryId?: string,
  limit = 5
): Promise<ApiResponse<Array<{ id: string; name: string; slug: string; reason: string; confidence: number }>>> => {
  const query: any = { limit }
  if (categoryId) query.categoryId = categoryId
  return baseService.get<Array<{ id: string; name: string; slug: string; reason: string; confidence: number }>>(
    '/categories/recommendations',
    query
  )
}

/**
 * Get category SEO data
 */
export const getCategorySeoData = async (categoryId: string): Promise<ApiResponse<{
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  canonicalUrl: string
  structuredData: any
  ogTags: Record<string, string>
  twitterTags: Record<string, string>
}>> => {
  return baseService.get<{
    metaTitle: string
    metaDescription: string
    metaKeywords: string[]
    canonicalUrl: string
    structuredData: any
    ogTags: Record<string, string>
    twitterTags: Record<string, string>
  }>(`/categories/${categoryId}/seo`)
}

/**
 * Get category analytics
 */
export const getCategoryAnalytics = async (
  categoryId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  views: number
  uniqueViews: number
  bounceRate: number
  avgTimeOnPage: number
  conversionRate: number
  revenue: number
  orders: number
  topProducts: any[]
  trafficSources: any[]
}>> => {
  return baseService.get<{
    views: number
    uniqueViews: number
    bounceRate: number
    avgTimeOnPage: number
    conversionRate: number
    revenue: number
    orders: number
    topProducts: any[]
    trafficSources: any[]
  }>(`/categories/${categoryId}/analytics`, { period })
}