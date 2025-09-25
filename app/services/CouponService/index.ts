// Coupon Service - Revenue optimization through strategic discounting
import { BaseApiService } from '../BaseApiService'
import type { ApiResponse } from '@/types/database'

export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping'
  discount_value: number
  buy_quantity?: number
  get_quantity?: number
  get_discount_percentage?: number
  usage_limit?: number
  usage_count: number
  usage_limit_per_customer?: number
  minimum_order_amount?: number
  maximum_discount_amount?: number
  applicable_products?: string[]
  applicable_categories?: string[]
  excluded_products?: string[]
  customer_eligibility: 'all' | 'new_customers' | 'returning_customers' | 'vip_customers'
  applicable_customer_emails?: string[]
  valid_from: string
  valid_until?: string
  is_active: boolean
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

export class CouponService {
  /**
   * Validate and apply coupon to cart
   */
  static async validateCoupon(application: CouponApplication): Promise<ApiResponse<CouponValidationResult>> {
    return baseService.post<CouponValidationResult>('/coupons/validate', application)
  }

  /**
   * Get available public coupons (for marketing displays)
   */
  static async getPublicCoupons(): Promise<ApiResponse<Coupon[]>> {
    return baseService.get<Coupon[]>('/coupons/public')
  }

  /**
   * Apply automatic discount rules to cart
   */
  static async applyAutomaticDiscounts(application: Omit<CouponApplication, 'coupon_code'>): Promise<ApiResponse<{
    discounts: Array<{
      rule_name: string
      discount_amount: number
      description: string
    }>
    total_discount: number
  }>> {
    return baseService.post('/coupons/auto-discounts', application)
  }

  /**
   * Get customer's coupon usage history
   */
  static async getCustomerCoupons(email: string): Promise<ApiResponse<Array<{
    coupon: Coupon
    used_at: string
    discount_amount: number
  }>>> {
    return baseService.get(`/coupons/customer/${encodeURIComponent(email)}`)
  }

  // Admin methods
  static async createCoupon(coupon: Partial<Coupon>): Promise<ApiResponse<Coupon>> {
    return baseService.post<Coupon>('/admin/coupons', coupon)
  }

  static async updateCoupon(id: string, updates: Partial<Coupon>): Promise<ApiResponse<Coupon>> {
    return baseService.patch<Coupon>(`/admin/coupons/${id}`, updates)
  }

  static async deleteCoupon(id: string): Promise<ApiResponse<void>> {
    return baseService.delete(`/admin/coupons/${id}`)
  }

  static async getCoupons(params?: {
    page?: number
    limit?: number
    search?: string
    status?: 'active' | 'inactive' | 'expired'
  }): Promise<ApiResponse<{
    data: Coupon[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>> {
    const query = new URLSearchParams()
    if (params?.page) {query.set('page', params.page.toString())}
    if (params?.limit) {query.set('limit', params.limit.toString())}
    if (params?.search) {query.set('search', params.search)}
    if (params?.status) {query.set('status', params.status)}

    return baseService.get(`/admin/coupons?${query.toString()}`)
  }

  /**
   * Get coupon analytics
   */
  static async getCouponAnalytics(couponId?: string): Promise<ApiResponse<{
    total_usage: number
    total_discount_given: number
    total_revenue_generated: number
    average_order_value: number
    top_coupons: Array<{
      coupon_code: string
      usage_count: number
      total_discount: number
    }>
  }>> {
    const query = couponId ? `?coupon_id=${couponId}` : ''
    return baseService.get(`/admin/coupons/analytics${query}`)
  }
}
