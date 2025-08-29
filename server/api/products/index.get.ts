import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, ProductSearchFilters, SearchResponse, ProductWithCategory } from '~/types/database'

export default defineEventHandler(async (event): Promise<SearchResponse<ProductWithCategory>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  
  // Parse query parameters
  const query = getQuery(event)
  
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 12, 50) // Max 50 items per request
  const offset = (page - 1) * limit

  const filters: ProductSearchFilters = {
    category: query.category as string,
    minPrice: query.minPrice ? parseFloat(query.minPrice as string) : undefined,
    maxPrice: query.maxPrice ? parseFloat(query.maxPrice as string) : undefined,
    tags: query.tags ? (query.tags as string).split(',') : undefined,
    search: query.search as string,
    difficulty: query.difficulty as string,
    software: query.software ? (query.software as string).split(',') : undefined,
    featured: query.featured === 'true',
    sortBy: query.sortBy as any || 'newest'
  }

  try {
    // Build the query
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (filters.category) {
      dbQuery = dbQuery.eq('category_id', filters.category)
    }

    if (filters.minPrice !== undefined) {
      dbQuery = dbQuery.gte('price', filters.minPrice.toString())
    }

    if (filters.maxPrice !== undefined) {
      dbQuery = dbQuery.lte('price', filters.maxPrice.toString())
    }

    if (filters.featured) {
      dbQuery = dbQuery.eq('is_featured', true)
    }

    if (filters.difficulty) {
      dbQuery = dbQuery.eq('difficulty_level', filters.difficulty)
    }

    if (filters.tags && filters.tags.length > 0) {
      dbQuery = dbQuery.overlaps('tags', filters.tags)
    }

    if (filters.software && filters.software.length > 0) {
      dbQuery = dbQuery.overlaps('software_required', filters.software)
    }

    // Full-text search
    if (filters.search) {
      const searchTerms = filters.search.trim().replace(/\s+/g, ' & ')
      dbQuery = dbQuery.textSearch('fts', searchTerms, {
        type: 'websearch',
        config: 'english'
      })
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        dbQuery = dbQuery.order('price', { ascending: true })
        break
      case 'price_desc':
        dbQuery = dbQuery.order('price', { ascending: false })
        break
      case 'oldest':
        dbQuery = dbQuery.order('created_at', { ascending: true })
        break
      case 'popular':
        dbQuery = dbQuery.order('view_count', { ascending: false })
        break
      case 'rating':
        // This would need a computed average rating field
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data, count, error } = await dbQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: error
      })
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: (data as ProductWithCategory[]) || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error',
      data: error.data
    })
  }
})