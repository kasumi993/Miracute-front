import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseServiceRole<Database>(event)
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Categories fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch categories'
      })
    }

    return {
      success: true,
      data: categories || [],
      total: categories?.length || 0
    }

  } catch (error: any) {
    console.error('Categories API error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching categories'
    })
  }
})