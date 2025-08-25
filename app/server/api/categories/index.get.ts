import { serverSupabaseClient } from '#supabase/server'
import type { Database, Category } from '~/types/database'

export default defineEventHandler(async (event): Promise<Category[]> => {
  const supabase = await serverSupabaseClient<Database>(event)

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch categories',
        data: error
      })
    }

    return data || []

  } catch (error: any) {
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