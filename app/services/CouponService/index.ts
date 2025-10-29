// Coupon Service - Revenue optimization through strategic discounting
import { BaseApiService } from '../BaseApiService'
import type { ApiResponse } from '@/types/database'

export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  type: 'coupon' | 'promotion'
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping'
  discount_value: number
  usage_limit?: number
  usage_count: number
  usage_limit_per_customer?: number
  minimum_cart_amount?: number
  maximum_discount_amount?: number
  applicable_products?: string[]
  applicable_categories?: string[]
  excluded_products?: string[]
  customer_eligibility: 'all' | 'new_customers' | 'returning_customers' | 'vip_customers'
  applicable_customer_emails?: string[]
  valid_from: string
  valid_until?: string
  is_active: boolean

  // Bundle stacking rules
  can_stack_with_bundles: boolean
  can_stack_with_other_coupons: boolean
  max_total_discount_percentage?: number // Prevent excessive stacking (e.g., 70%)
  bundle_compatibility: 'all' | 'none' | 'specific'
  compatible_bundle_ids?: string[]
  excluded_bundle_ids?: string[]

  // Discount application rules
  priority_order: number // 1 = highest priority, 10 = lowest
  discount_application_order: 'before_bundles' | 'after_bundles'
  requires_bundle_in_cart?: boolean // Only applies if cart contains bundle

  created_at: string
  updated_at: string
}

export interface CouponValidationResult {
  valid: boolean
  coupon?: Coupon
  discount_amount?: number
  error?: string
  applied_products?: string[]
}

export interface CartItem {
  product_id: string
  quantity: number
  price: number
  category_id?: string
}

export interface CouponApplication {
  cart_items: CartItem[]
  subtotal: number
  coupon_code?: string
  customer_email?: string
  user_id?: string
}

const baseService = new BaseApiService()

/**
 * Validate and apply coupon to cart
 */
export const validateCoupon = async (application: CouponApplication): Promise<ApiResponse<CouponValidationResult>> => {
  return baseService.post<CouponValidationResult>('/coupons/validate', application)
}

/**
 * Get available public coupons (for marketing displays)
 */
export const getPublicCoupons = async (): Promise<ApiResponse<Coupon[]>> => {
  return baseService.get<Coupon[]>('/coupons')
}

/**
 * Apply automatic discount rules to cart
 */
export const applyAutomaticDiscounts = async (application: Omit<CouponApplication, 'coupon_code'>): Promise<ApiResponse<{
  discounts: Array<{
    rule_name: string
    discount_amount: number
    description: string
  }>
  total_discount: number
}>> => {
  // For now, return empty discounts since endpoint doesn't exist
  return Promise.resolve({
    success: true,
    data: {
      discounts: [],
      total_discount: 0
    },
    error: null
  })
}

/**
 * Get customer's coupon usage history
 */
export const getCustomerCoupons = async (email: string): Promise<ApiResponse<Array<{
  coupon: Coupon
  used_at: string
  discount_amount: number
}>>> => {
  // For now, return empty usage history since endpoint doesn't exist
  return Promise.resolve({
    success: true,
    data: [],
    error: null
  })
}

// Admin methods
export const createCoupon = async (coupon: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
  return baseService.post<Coupon>('/coupons', coupon)
}

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
  return baseService.patch<Coupon>(`/coupons/${id}`, updates)
}

export const deleteCoupon = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/coupons/${id}`)
}

export const getCoupons = async (params?: {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'expired'
}): Promise<ApiResponse<{
  coupons: Coupon[]
  stats: {
    totalCoupons: number
    activeCoupons: number
    totalSavings: number
    totalUsages: number
  }
}>> => {
  return baseService.get<{
    coupons: Coupon[]
    stats: {
      totalCoupons: number
      activeCoupons: number
      totalSavings: number
      totalUsages: number
    }
  }>('/coupons', params)
}

export const getCoupon = async (id: string): Promise<ApiResponse<Coupon>> => {
  return baseService.get<Coupon>(`/coupons/${id}`)
}

/**
 * Get coupon analytics
 */
export const getCouponAnalytics = async (couponId?: string): Promise<ApiResponse<{
  total_usage: number
  total_discount_given: number
  total_revenue_generated: number
  average_order_value: number
  top_coupons: Array<{
    coupon_code: string
    usage_count: number
    total_discount: number
  }>
}>> => {
  // For now, return dummy analytics since endpoint doesn't exist
  return Promise.resolve({
    success: true,
    data: {
      total_usage: 0,
      total_discount_given: 0,
      total_revenue_generated: 0,
      average_order_value: 0,
      top_coupons: []
    },
    error: null
  })
}

