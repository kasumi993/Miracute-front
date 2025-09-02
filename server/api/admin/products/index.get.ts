import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  
  // Parse query parameters
  const query = getQuery(event)
  const {
    search = '',
    category = '',
    status = '',
    template_type = '',
    page = '1',
    limit = '20'
  } = query as {
    search?: string
    category?: string
    status?: string
    template_type?: string
    page?: string
    limit?: string
  }

  // Validate and convert pagination params
  const pageNum = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)) // Max 100 per page
  const offset = (pageNum - 1) * limitNum

  try {
    // Define the base columns we know exist
    const baseColumns = `
      id,
      name,
      slug,
      description,
      short_description,
      price,
      compare_at_price,
      category_id,
      preview_images,
      download_files,
      file_size,
      file_formats,
      seo_title,
      seo_description,
      meta_keywords,
      tags,
      difficulty_level,
      software_required,
      dimensions,
      is_active,
      is_featured,
      stock_quantity,
      view_count,
      download_count,
      created_at,
      updated_at,
      category:categories (
        id,
        name
      )
    `
    
    // Build query with filters
    let queryBuilder = supabase
      .from('products')
      .select(`${baseColumns}, template_type`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    // Apply category filter
    if (category) {
      queryBuilder = queryBuilder.eq('category_id', category)
    }

    // Apply status filter
    if (status) {
      switch (status) {
        case 'active':
          queryBuilder = queryBuilder.eq('is_active', true)
          break
        case 'inactive':
          queryBuilder = queryBuilder.eq('is_active', false)
          break
        case 'featured':
          queryBuilder = queryBuilder.eq('is_featured', true)
          break
      }
    }

    // Apply template type filter
    if (template_type) {
      queryBuilder = queryBuilder.eq('template_type', template_type)
    }

    // Try to fetch with template_type first
    let { data, error, count } = await queryBuilder

    // If error is about missing template_type column, try without it
    if (error && error.message && error.message.includes('template_type')) {
      let fallbackQuery = supabase
        .from('products')
        .select(baseColumns, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1)

      // Re-apply filters without template_type
      if (search) {
        fallbackQuery = fallbackQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%,tags.cs.{${search}}`)
      }
      
      if (category) {
        fallbackQuery = fallbackQuery.eq('category_id', category)
      }

      if (status) {
        switch (status) {
          case 'active':
            fallbackQuery = fallbackQuery.eq('is_active', true)
            break
          case 'inactive':
            fallbackQuery = fallbackQuery.eq('is_active', false)
            break
          case 'featured':
            fallbackQuery = fallbackQuery.eq('is_featured', true)
            break
        }
      }

      const result = await fallbackQuery
      data = result.data
      error = result.error
      count = result.count
      
      if (data && !error && Array.isArray(data)) {
        data = data.map(product => ({ ...product, template_type: 'canva' }))
      }
    }

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: error
      })
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
        hasNextPage: (count || 0) > offset + limitNum,
        hasPreviousPage: pageNum > 1
      }
    }

  } catch (error: any) {
    console.error('Error fetching products:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
      data: error
    })
  }
})