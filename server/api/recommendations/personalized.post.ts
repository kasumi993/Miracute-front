// AI-Powered Personalized Recommendations API
import { serverSupabaseServiceRole } from '#supabase/server'
import { rateLimit } from '../../utils/rateLimit'
import { ApiCache } from '../../utils/cache'

interface RecommendationContext {
  user_id?: string
  current_product_id?: string
  cart_items?: string[]
  viewed_products?: string[]
  category_interests?: string[]
  customer_segment?: 'new' | 'returning' | 'vip'
  purchase_history?: string[]
  limit?: number
}

export default defineEventHandler(async (event) => {
  // Rate limiting for recommendations
  await rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20
  })(event)

  try {
    const body = await readBody<RecommendationContext>(event)
    const {
      user_id,
      current_product_id,
      cart_items = [],
      viewed_products = [],
      category_interests = [],
      customer_segment = 'new',
      purchase_history = [],
      limit = 6
    } = body

    // Check cache first
    const cacheKey = ApiCache.generateKey('recommendations', {
      user_id,
      current_product_id,
      cart_items: cart_items.sort().join(','),
      category_interests: category_interests.sort().join(','),
      limit
    })

    const cached = ApiCache.get(cacheKey)
    if (cached) {
      return { success: true, data: cached }
    }

    const supabase = serverSupabaseServiceRole(event)

    // Get user's recent activity if user_id provided
    let userInteractions: any[] = []
    if (user_id) {
      const { data } = await supabase
        .from('analytics_events')
        .select('product_id, event_type, created_at')
        .eq('user_id', user_id)
        .in('event_type', ['product_view', 'add_to_cart'])
        .order('created_at', { ascending: false })
        .limit(50)

      userInteractions = data || []
    }

    // Collaborative Filtering: Find similar users
    const similarUserProducts = new Set<string>()
    if (userInteractions.length > 0) {
      const userProductIds = userInteractions.map(i => i.product_id)

      // Find users who viewed similar products
      const { data: similarUsers } = await supabase
        .from('analytics_events')
        .select('user_id, product_id')
        .in('product_id', userProductIds)
        .neq('user_id', user_id || '')
        .limit(100)

      // Get products these similar users also liked
      if (similarUsers && similarUsers.length > 0) {
        const similarUserIds = [...new Set(similarUsers.map(u => u.user_id))]
        const { data: recommendations } = await supabase
          .from('analytics_events')
          .select('product_id')
          .in('user_id', similarUserIds)
          .eq('event_type', 'add_to_cart')
          .limit(20)

        recommendations?.forEach(r => similarUserProducts.add(r.product_id))
      }
    }

    // Content-Based Filtering: Similar categories and features
    let categoryBasedProducts: string[] = []
    if (category_interests.length > 0 || current_product_id) {
      let categories = [...category_interests]

      // Get current product's category if available
      if (current_product_id) {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('category_id')
          .eq('id', current_product_id)
          .single()

        if (currentProduct?.category_id) {
          categories.push(currentProduct.category_id)
        }
      }

      if (categories.length > 0) {
        const { data: categoryProducts } = await supabase
          .from('products')
          .select('id')
          .in('category_id', categories)
          .eq('is_active', true)
          .limit(15)

        categoryBasedProducts = categoryProducts?.map(p => p.id) || []
      }
    }

    // Trending Products (fallback)
    const { data: trendingProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        featured_image_url,
        categories (
          id,
          name
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)

    // Score and rank recommendations
    const productScores = new Map<string, number>()
    const reasons = new Map<string, string>()

    // Score collaborative filtering results
    Array.from(similarUserProducts).forEach(productId => {
      productScores.set(productId, (productScores.get(productId) || 0) + 3)
      reasons.set(productId, 'Customers with similar interests bought this')
    })

    // Score content-based results
    categoryBasedProducts.forEach(productId => {
      productScores.set(productId, (productScores.get(productId) || 0) + 2)
      if (!reasons.has(productId)) {
        reasons.set(productId, 'Similar to your interests')
      }
    })

    // Score trending products (lower weight)
    trendingProducts?.forEach(product => {
      if (!productScores.has(product.id)) {
        productScores.set(product.id, 1)
        reasons.set(product.id, 'Popular choice')
      }
    })

    // Remove already viewed/purchased products
    const excludeProducts = new Set([
      ...viewed_products,
      ...cart_items,
      ...purchase_history,
      current_product_id
    ].filter(Boolean))

    // Get top recommended product IDs
    const recommendedIds = Array.from(productScores.entries())
      .filter(([productId]) => !excludeProducts.has(productId))
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([productId]) => productId)

    // Fetch full product details
    const { data: recommendedProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        featured_image_url,
        categories (
          id,
          name
        )
      `)
      .in('id', recommendedIds)
      .eq('is_active', true)

    // Build final response with algorithms and confidence scores
    const results = recommendedProducts?.map(product => ({
      products: [product],
      algorithm: similarUserProducts.has(product.id) ? 'collaborative_filtering' :
                categoryBasedProducts.includes(product.id) ? 'content_based' : 'trending',
      confidence_score: Math.min(100, (productScores.get(product.id) || 1) * 25),
      reason: reasons.get(product.id) || 'Recommended for you'
    })) || []

    // Cache the results for 5 minutes
    ApiCache.set(cacheKey, results, 300)

    return {
      success: true,
      data: results
    }

  } catch (error: any) {
    console.error('Personalized recommendations error:', error)
    return {
      success: false,
      error: 'Failed to generate recommendations',
      details: error.message
    }
  }
})