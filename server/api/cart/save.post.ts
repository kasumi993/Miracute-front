import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { createApiResponse } from '../../utils/apiResponse'

interface CartItemData {
  productId: string
}

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
    const body = await readBody(event)
    const { items = [] } = body as { items: CartItemData[] }

    // First, delete all existing cart items for this user
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    // If no items to save, return success
    if (items.length === 0) {
      return createApiResponse({ message: 'Cart cleared successfully' })
    }

    // Insert new cart items
    const cartItemsToInsert = items.map(item => ({
      user_id: user.id,
      product_id: item.productId
    }))

    const { data } = await supabase
      .from('cart_items')
      .insert(cartItemsToInsert)
      .select()

    return createApiResponse({
      message: `Saved ${items.length} cart items`,
      data
    })

  } catch (error: any) {
    console.error('Cart save API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save cart'
    })
  }
})