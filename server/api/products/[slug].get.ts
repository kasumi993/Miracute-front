import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug is required'
    })
  }

  try {
    const supabase = await serverSupabaseServiceRole<Database>(event)
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found'
        })
      }
      
      console.error('Product fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch product'
      })
    }

    return {
      success: true,
      data: product
    }

  } catch (error: any) {
    console.error('Product API error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching product'
    })
  }
})