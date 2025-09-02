import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const productId = getRouterParam(event, 'id')
  
  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  // Get the request body
  const body = await readBody(event)
  
  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body is required'
    })
  }

  try {
    // Create a copy of body to potentially modify
    let updateData = { ...body }
    
    // Try to update with template_type first
    let { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    // If error is about missing template_type column, try without it
    if (error && error.message && error.message.includes('template_type')) {
      const { template_type, ...updateDataWithoutTemplateType } = updateData
      
      const result = await supabase
        .from('products')
        .update(updateDataWithoutTemplateType)
        .eq('id', productId)
        .select()
        .single()
        
      data = result.data
      error = result.error
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
        statusMessage: 'Failed to update product',
        data: error
      })
    }

    return {
      success: true,
      data: data
    }

  } catch (error: any) {
    console.error('Error updating product:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update product',
      data: error
    })
  }
})