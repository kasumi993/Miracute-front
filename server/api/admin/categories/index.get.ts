import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await validateAdminAccess(event)

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch categories',
        data: error
      })
    }

    return {
      success: true,
      data: data || []
    }

  } catch (error: any) {
    console.error('Error fetching categories:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories',
      data: error
    })
  }
})