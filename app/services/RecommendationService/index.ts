// AI-Powered Recommendation Engine for Revenue Optimization
import { BaseApiService } from '../BaseApiService'
import type { ApiResponse, ProductWithCategory } from '@/types/database'

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

const baseService = new BaseApiService()

export class RecommendationService {
  /**
   * Get personalized product recommendations
   * Uses collaborative filtering + content-based algorithms
   */
  static async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit = 6
  ): Promise<ApiResponse<RecommendationResult[]>> {
    return baseService.post('/recommendations/personalized', {
      ...context,
      limit
    })
  }

  /**
   * Get "Customers who bought this also bought" recommendations
   */
  static async getCollaborativeRecommendations(
    productId: string,
    limit = 4
  ): Promise<ApiResponse<RecommendationResult>> {
    return baseService.get(`/recommendations/collaborative/${productId}?limit=${limit}`)
  }

  /**
   * Get content-based recommendations (similar products)
   */
  static async getSimilarProducts(
    productId: string,
    limit = 4
  ): Promise<ApiResponse<RecommendationResult>> {
    return baseService.get(`/recommendations/similar/${productId}?limit=${limit}`)
  }

  /**
   * Get trending products for category
   */
  static async getTrendingProducts(
    categoryId?: string,
    limit = 8
  ): Promise<ApiResponse<ProductWithCategory[]>> {
    const query = categoryId ? `?category=${categoryId}&limit=${limit}` : `?limit=${limit}`
    return baseService.get(`/recommendations/trending${query}`)
  }

  /**
   * Get cross-sell opportunities for cart
   */
  static async getCrossSellOpportunities(
    cartItems: Array<{ product_id: string; quantity: number }>
  ): Promise<ApiResponse<CrossSellOpportunity[]>> {
    return baseService.post('/recommendations/cross-sell', { cart_items: cartItems })
  }

  /**
   * Get upsell opportunities (higher-value alternatives)
   */
  static async getUpsellOpportunities(
    productId: string,
    priceRange?: { min: number; max: number }
  ): Promise<ApiResponse<{
    alternatives: ProductWithCategory[]
    potential_revenue_increase: number
  }>> {
    return baseService.post('/recommendations/upsell', {
      product_id: productId,
      price_range: priceRange
    })
  }

  /**
   * Get "Complete the Look" bundles for design templates
   */
  static async getDesignBundles(
    productId: string,
    useCase?: string
  ): Promise<ApiResponse<{
    bundles: Array<{
      name: string
      products: ProductWithCategory[]
      bundle_price: number
      individual_price: number
      savings: number
    }>
  }>> {
    return baseService.get(`/recommendations/bundles/${productId}?use_case=${useCase || ''}`)
  }

  /**
   * Track user interaction for improving recommendations
   */
  static async trackInteraction(interaction: {
    user_id?: string
    session_id: string
    action: 'view' | 'add_to_cart' | 'purchase' | 'wishlist' | 'share'
    product_id: string
    source?: 'recommendation' | 'search' | 'category' | 'direct'
    recommendation_algorithm?: string
  }): Promise<ApiResponse<void>> {
    return baseService.post('/recommendations/track', interaction)
  }

  /**
   * Get abandoned cart recovery recommendations
   */
  static async getAbandonedCartRecommendations(
    cartItems: Array<{ product_id: string; abandoned_at: string }>
  ): Promise<ApiResponse<{
    urgency_products: ProductWithCategory[] // Limited time offers
    alternative_products: ProductWithCategory[] // Cheaper alternatives
    complementary_products: ProductWithCategory[] // Complete the collection
    incentive_suggestion: {
      type: 'discount' | 'free_shipping' | 'bundle'
      value: number
      message: string
    }
  }>> {
    return baseService.post('/recommendations/abandoned-cart', { cart_items: cartItems })
  }

  /**
   * Get seasonal/occasion-based recommendations
   */
  static async getSeasonalRecommendations(
    occasion: 'wedding' | 'birthday' | 'business' | 'holiday' | 'seasonal',
    customerSegment?: string
  ): Promise<ApiResponse<{
    featured_collections: Array<{
      name: string
      products: ProductWithCategory[]
      special_offer?: {
        type: string
        value: number
        message: string
      }
    }>
  }>> {
    return baseService.get(`/recommendations/seasonal/${occasion}?segment=${customerSegment || ''}`)
  }

  // Admin Analytics Methods
  static async getRecommendationAnalytics(dateRange?: {
    start: string
    end: string
  }): Promise<ApiResponse<{
    total_recommendations_shown: number
    total_clicks: number
    click_through_rate: number
    conversion_rate: number
    revenue_attributed: number
    top_performing_algorithms: Array<{
      algorithm: string
      clicks: number
      conversions: number
      revenue: number
    }>
  }>> {
    const query = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : ''
    return baseService.get(`/admin/recommendations/analytics${query}`)
  }

  /**
   * A/B test different recommendation algorithms
   */
  static async createRecommendationTest(test: {
    name: string
    algorithm_a: string
    algorithm_b: string
    traffic_split: number // 0-100, percentage for algorithm_a
    success_metric: 'clicks' | 'conversions' | 'revenue'
    duration_days: number
  }): Promise<ApiResponse<{ test_id: string }>> {
    return baseService.post('/admin/recommendations/tests', test)
  }
}
