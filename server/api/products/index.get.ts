import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, ProductSearchFilters, SearchResponse, ProductWithCategory, ApiResponse } from '~/types/database'
import { createApiResponse, handleSupabaseError } from '../../../server/utils/apiResponse'

export default defineEventHandler(async (event): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 12, 50)
  const offset = (page - 1) * limit

  const filters: ProductSearchFilters = {
    category: query.category as string,
    minPrice: query.minPrice ? parseFloat(query.minPrice as string) : undefined,
    maxPrice: query.maxPrice ? parseFloat(query.maxPrice as string) : undefined,
    tags: query.tags ? (query.tags as string).split(',').map(tag => tag.trim()) : undefined,
    search: query.search as string,
    difficulty: query.difficulty as string,
    software: query.software ? (query.software as string).split(',').map(sw => sw.trim()) : undefined,
    featured: query.featured === 'true',
    sortBy: query.sortBy as any || 'newest'
  }

  const excludeId = query.exclude as string

  try {
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
      .eq('is_active', true)

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

    if (excludeId) {
      dbQuery = dbQuery.neq('id', excludeId)
    }

    if (filters.search) {
      const searchTerm = filters.search.trim().toLowerCase()
      dbQuery = dbQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
    }

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
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
    }

    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data, count, error } = await dbQuery

    if (error) {
      handleSupabaseError(error, 'Fetch products')
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    const searchResponse: SearchResponse<ProductWithCategory> = {
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

    return createApiResponse(searchResponse)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch products')
  }
})
