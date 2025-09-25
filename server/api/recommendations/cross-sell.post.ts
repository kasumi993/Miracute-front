// Cross-sell opportunities API - Boost AOV with smart product bundles
import { serverSupabaseServiceRole } from '#supabase/server'

interface CartItem {
  product_id: string
  quantity: number
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ cart_items: CartItem[] }>(event)
    const { cart_items } = body

    if (!cart_items || cart_items.length === 0) {
      return {
        success: false,
        error: 'Cart items required'
      }
    }

    const supabase = serverSupabaseServiceRole(event)
    const cartProductIds = cart_items.map(item => item.product_id)

    // Get cart products with categories
    const { data: cartProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        category_id,
        categories (
          id,
          name
        )
      `)
      .in('id', cartProductIds)

    if (!cartProducts || cartProducts.length === 0) {
      return { success: false, error: 'Cart products not found' }
    }

    const cartCategories = [...new Set(cartProducts.map(p => p.category_id))]
    const cartTotal = cartProducts.reduce((sum, p) => {
      const item = cart_items.find(ci => ci.product_id === p.id)
      return sum + (p.price * (item?.quantity || 1))
    }, 0)

    // Find frequently bought together products
    const { data: frequentlyBought } = await supabase
      .rpc('get_frequently_bought_together', {
        product_ids: cartProductIds,
        min_frequency: 2
      })

    // Find complementary products in same/related categories
    const { data: complementaryProducts } = await supabase
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
      .in('category_id', cartCategories)
      .not('id', 'in', `(${cartProductIds.join(',')})`)
      .eq('is_active', true)
      .limit(10)

    // Find accessories/add-ons (products under $50)
    const { data: accessories } = await supabase
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
      .lt('price', 50)
      .not('id', 'in', `(${cartProductIds.join(',')})`)
      .eq('is_active', true)
      .order('price', { ascending: true })
      .limit(8)

    // Calculate cross-sell opportunities
    const opportunities = []

    // High-value complementary products
    if (complementaryProducts && complementaryProducts.length > 0) {
      const highValueProducts = complementaryProducts
        .filter(p => p.price >= cartTotal * 0.3)
        .slice(0, 3)

      if (highValueProducts.length > 0) {
        opportunities.push({
          trigger_product: cartProducts[0],
          recommended_products: highValueProducts,
          bundle_discount: 15,
          estimated_revenue_lift: highValueProducts.reduce((sum, p) => sum + p.price, 0) * 0.85
        })
      }
    }

    // Accessory bundles
    if (accessories && accessories.length > 0) {
      const accessoryBundle = accessories.slice(0, 3)
      const bundleValue = accessoryBundle.reduce((sum, p) => sum + p.price, 0)

      opportunities.push({
        trigger_product: cartProducts[0],
        recommended_products: accessoryBundle,
        bundle_discount: 10,
        estimated_revenue_lift: bundleValue * 0.9
      })
    }

    // Frequently bought together
    if (frequentlyBought && frequentlyBought.length > 0) {
      const { data: frequentProducts } = await supabase
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
        .in('id', frequentlyBought.map((fb: any) => fb.product_id))
        .eq('is_active', true)
        .limit(4)

      if (frequentProducts && frequentProducts.length > 0) {
        opportunities.push({
          trigger_product: cartProducts[0],
          recommended_products: frequentProducts,
          bundle_discount: 20,
          estimated_revenue_lift: frequentProducts.reduce((sum, p) => sum + p.price, 0) * 0.8
        })
      }
    }

    return {
      success: true,
      data: opportunities
    }

  } catch (error: any) {
    console.error('Cross-sell recommendations error:', error)
    return {
      success: false,
      error: 'Failed to generate cross-sell opportunities',
      details: error.message
    }
  }
})
