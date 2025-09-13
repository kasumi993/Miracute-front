import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await validateAdminAccess(event)

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
    const insertData = { ...body }

    // Try to create with template_type first
    let { data, error } = await supabase
      .from('products')
      .insert([insertData])
      .select()
      .single()

    // If error is about missing template_type column, try without it
    if (error && error.message && error.message.includes('template_type')) {
      const { template_type, ...insertDataWithoutTemplateType } = insertData

      const result = await supabase
        .from('products')
        .insert([insertDataWithoutTemplateType])
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create product',
        data: error
      })
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
    console.error('Error creating product:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create product',
      data: error
    })
  }
})
