import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { createApiResponse } from '../../utils/apiResponse'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    // Get cart items with product details
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        id,
        created_at,
        product:products!inner(
          id,
          name,
          slug,
          price,
          preview_images,
          is_active,
          category:categories(
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('product.is_active', true)
      .order('created_at', { ascending: false })
    return createApiResponse(cartItems)

  } catch (error: any) {
    console.error('Cart load API error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load cart'
    })
  }
})