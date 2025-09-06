import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseServiceRole<Database>(event)
    const query = getQuery(event)
    const search = query.search as string || ''
    
    // Get all unique tags from products
    const { data: products, error } = await supabase
      .from('products')
      .select('tags')
      .eq('is_active', true)
      .not('tags', 'is', null)

    if (error) {
      console.error('Tags fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch tags'
      })
    }

    // Extract and flatten all tags
    const allTags = new Set()
    products?.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            allTags.add(tag.trim().toLowerCase())
          }
        })
      }
    })

    // Convert to array and filter by search term if provided
    let tagsArray = Array.from(allTags)
    
    if (search) {
      tagsArray = tagsArray.filter(tag => 
        tag.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort alphabetically and limit to 10 suggestions
    tagsArray = tagsArray.sort().slice(0, 10)

    return {
      success: true,
      data: tagsArray,
      total: tagsArray.length
    }

  } catch (error: any) {
    console.error('Tags API error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching tags'
    })
  }
})