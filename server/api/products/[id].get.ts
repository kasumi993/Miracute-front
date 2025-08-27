import { serverSupabaseClient } from '#supabase/server'
import type { Database, ProductWithCategory } from '~/types/database'

export default defineEventHandler(async (event): Promise<ProductWithCategory | null> => {
  const supabase = await serverSupabaseClient<Database>(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug is required'
    })
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Product not found
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found'
        })
      }
      throw error
    }

    // Increment view count asynchronously (don't wait for it)
    if (data?.id) {
      supabase.rpc('increment_view_count', { product_id: data.id }).catch(console.error)
    }

    return data as ProductWithCategory

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product',
      data: error
    })
  }
})