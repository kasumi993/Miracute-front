import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10
  const offset = parseInt(query.offset as string) || 0
  const productId = query.product_id as string
  const orderId = query.order_id as string

  try {
    // Base query for user's orders with order items
    let queryBuilder = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product:products(
            id,
            name,
            slug,
            description,
            short_description,
            preview_images,
            file_size,
            file_formats,
            download_files
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // If filtering by order_id, add the filter
    if (orderId) {
      queryBuilder = queryBuilder.eq('id', orderId)
    }

    // If filtering by product_id, add the filter
    if (productId) {
      queryBuilder = queryBuilder.eq('order_items.product_id', productId)
    }

    const { data: orders, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {throw error}

    return {
      success: true,
      data: orders || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    }

  } catch (error: any) {
    console.error('Error fetching user orders:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders'
    })
  }
})
