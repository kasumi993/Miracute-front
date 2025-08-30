import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, ProductWithCategory } from '~/types/database'

export default defineEventHandler(async (event): Promise<{ data: ProductWithCategory | null }> => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const slug = getRouterParam(event, 'id')

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
        return { data: null }
      }
      throw error
    }

    // TODO: Implement view count increment later

    return { data: data as ProductWithCategory }

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