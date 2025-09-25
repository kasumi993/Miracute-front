// User downloads API endpoint
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 20, 100)

    const supabase = serverSupabaseServiceRole(event)

    // Get user's order items with download info
    const offset = (page - 1) * limit

    const { data: downloads, error, count } = await supabase
      .from('order_items')
      .select(`
        id,
        download_count,
        max_downloads,
        created_at,
        products (
          id,
          name,
          featured_image_url,
          preview_images
        ),
        orders!inner (
          id,
          user_id,
          payment_status,
          created_at
        )
      `, { count: 'exact' })
      .eq('orders.user_id', user.id)
      .eq('orders.payment_status', 'paid')
      .range(offset, offset + limit - 1)
      .order('orders.created_at', { ascending: false })

    if (error) {
      console.error('Downloads query error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch downloads'
      })
    }

    // Transform the data to match the expected format
    const transformedDownloads = downloads?.map(item => ({
      id: item.id,
      product_name: item.products?.name || 'Unknown Product',
      download_count: item.download_count || 0,
      max_downloads: item.max_downloads || 5,
      created_at: item.created_at,
      product: {
        id: item.products?.id,
        name: item.products?.name,
        featured_image_url: item.products?.featured_image_url,
        preview_images: item.products?.preview_images || []
      }
    })) || []

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      success: true,
      data: transformedDownloads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    }

  } catch (error: any) {
    console.error('User downloads error:', error)
    return {
      success: false,
      error: 'Failed to fetch user downloads',
      details: error.message
    }
  }
})
