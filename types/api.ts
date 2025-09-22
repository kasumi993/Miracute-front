// Centralized API type definitions for better TypeScript support

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Recommendation types
export interface RecommendationContext {
  user_id?: string
  current_product_id?: string
  cart_items?: string[]
  viewed_products?: string[]
  category_interests?: string[]
  customer_segment?: 'new' | 'returning' | 'vip'
  purchase_history?: string[]
}

export interface RecommendationResult {
  products: ProductWithCategory[]
  algorithm: string
  confidence_score: number
  reason: string
}

export interface CrossSellOpportunity {
  trigger_product: ProductWithCategory
  recommended_products: ProductWithCategory[]
  bundle_discount?: number
  estimated_revenue_lift: number
}

// Coupon types
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

// Analytics types
export interface AnalyticsEvent {
  event_type: string
  user_id?: string
  session_id: string
  product_id?: string
  category_id?: string
  search_query?: string
  url?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  custom_data?: Record<string, any>
}

export interface AnalyticsMetrics {
  total_pageviews: number
  unique_visitors: number
  bounce_rate: number
  avg_session_duration: number
  top_pages: Array<{
    url: string
    views: number
  }>
  conversion_rate: number
}

// Product types (extending database types)
export interface ProductWithCategory {
  id: string
  name: string
  description?: string
  price: number
  featured_image_url?: string
  categories?: {
    id: string
    name: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

// Order types
export interface Order {
  id: string
  customer_email: string
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  product?: ProductWithCategory
}

// Error types
export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: {
    errors?: Array<{
      field: string
      message: string
    }>
  }
}