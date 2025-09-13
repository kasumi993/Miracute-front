import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database, ProductWithCategory, ApiResponse, SearchResponse } from '~/types/database'
import { createApiResponse, handleSupabaseError } from '../../../utils/apiResponse'

interface AdminProductFilters {
  search?: string
  category?: string
  status?: 'active' | 'inactive' | 'featured' | 'all'
  template_type?: string
}

export default defineEventHandler(async (event): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  const { supabase } = await validateAdminAccess(event)

  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  const filters: AdminProductFilters = {
    search: query.search as string,
    category: query.category as string,
    status: query.status as any,
    template_type: query.template_type as string
  }

  try {
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.trim()
      queryBuilder = queryBuilder.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
    }

    if (filters.category) {
      queryBuilder = queryBuilder.eq('category_id', filters.category)
    }

    if (filters.status) {
      switch (filters.status) {
        case 'active':
          queryBuilder = queryBuilder.eq('is_active', true)
          break
        case 'inactive':
          queryBuilder = queryBuilder.eq('is_active', false)
          break
        case 'featured':
          queryBuilder = queryBuilder.eq('is_featured', true)
          break
        // 'all' doesn't filter
      }
    }

    if (filters.template_type) {
      queryBuilder = queryBuilder.eq('template_type', filters.template_type)
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      handleSupabaseError(error, 'Fetch admin products')
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
    handleSupabaseError(error, 'Fetch admin products')
  }
})
