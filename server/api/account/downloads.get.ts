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

  try {
    // Get user's downloadable items from completed orders
    const { data: downloads, count, error } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(
          name,
          slug,
          preview_images,
          file_formats
        ),
        order:orders!inner(
          id,
          status,
          created_at,
          user_id
        )
      `, { count: 'exact' })
      .eq('order.user_id', user.id)
      .eq('order.status', 'completed')
      .not('download_url', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {throw error}

    // Filter and transform the data
    const transformedDownloads = (downloads || []).map(download => ({
      id: download.id,
      product_name: download.product_name,
      product_slug: download.product_slug,
      download_url: download.download_url,
      download_expires_at: download.download_expires_at,
      download_count: download.download_count || 0,
      max_downloads: download.max_downloads || 5,
      created_at: download.created_at,
      product: download.product,
      order: download.order,
      // Check if download is still valid
      is_expired: download.download_expires_at ?
        new Date(download.download_expires_at) < new Date() : false,
      is_download_limit_reached: (download.download_count || 0) >= (download.max_downloads || 5)
    }))

    return {
      success: true,
      data: transformedDownloads,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    }

  } catch (error: any) {
    console.error('Error fetching user downloads:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch downloads'
    })
  }
})
