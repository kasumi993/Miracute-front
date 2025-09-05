import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseServiceRole<Database>(event)
    const query = getQuery(event)
    
    // Parse query parameters
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      tags,
      software,
      difficulty,
      sortBy = 'newest',
      exclude
    } = query

    // Build the base query
    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (category) {
      queryBuilder = queryBuilder.eq('category_id', category)
    }

    if (featured === 'true') {
      queryBuilder = queryBuilder.eq('is_featured', true)
    }

    // Price range filter
    if (minPrice) {
      queryBuilder = queryBuilder.gte('price', parseFloat(minPrice as string))
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte('price', parseFloat(maxPrice as string))
    }

    // Difficulty filter
    if (difficulty) {
      queryBuilder = queryBuilder.eq('difficulty_level', difficulty)
    }

    // Tags filter
    if (tags) {
      const tagsArray = (tags as string).split(',').map(tag => tag.trim())
      queryBuilder = queryBuilder.overlaps('tags', tagsArray)
    }

    // Software filter
    if (software) {
      const softwareArray = (software as string).split(',').map(sw => sw.trim())
      queryBuilder = queryBuilder.overlaps('software_required', softwareArray)
    }

    // Exclude specific product (for related products)
    if (exclude) {
      queryBuilder = queryBuilder.neq('id', exclude)
    }

    // Search functionality - comprehensive search across multiple fields
    if (search) {
      const searchTerm = (search as string).trim()
      
      // Create a comprehensive search that looks in multiple fields
      queryBuilder = queryBuilder.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}},software_required.cs.{${searchTerm}}`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        queryBuilder = queryBuilder.order('price', { ascending: true })
        break
      case 'price_desc':
        queryBuilder = queryBuilder.order('price', { ascending: false })
        break
      case 'popular':
        queryBuilder = queryBuilder.order('view_count', { ascending: false })
        break
      case 'newest':
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    queryBuilder = queryBuilder.range(offset, offset + parseInt(limit as string) - 1)

    // Execute query
    const { data: products, error, count } = await queryBuilder

    if (error) {
      console.error('Products fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products'
      })
    }

    // Calculate pagination info
    const total = count || 0
    const totalPages = Math.ceil(total / parseInt(limit as string))
    const currentPage = parseInt(page as string)
    const hasNext = currentPage < totalPages
    const hasPrev = currentPage > 1

    return {
      success: true,
      data: products || [],
      pagination: {
        total,
        totalPages,
        currentPage,
        limit: parseInt(limit as string),
        hasNext,
        hasPrev,
        offset
      }
    }

  } catch (error: any) {
    console.error('Products API error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching products'
    })
  }
})