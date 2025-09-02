import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  try {
    const { data, error } = await supabase
      .from('template_types')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch template types',
        data: error
      })
    }

    return {
      success: true,
      data: data || []
    }

  } catch (error: any) {
    console.error('Error fetching template types:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch template types',
      data: error
    })
  }
})