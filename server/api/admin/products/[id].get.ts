import { requireAdminAuthentication } from '../../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

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

    // Try to fetch with template_type first
    let { data, error } = await supabase
      .from('products')
      .select(`${baseColumns}, template_type`)
      .eq('id', productId)
      .single()

    // If error is about missing template_type column, try without it
    if (error && error.message && error.message.includes('template_type')) {
      const result = await supabase
        .from('products')
        .select(baseColumns)
        .eq('id', productId)
        .single()

      data = result.data
      error = result.error

      if (data && !error) {
        data.template_type = 'canva'
      }
    }

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch product',
        data: error
      })
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
    console.error('Error fetching product:', error)

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
