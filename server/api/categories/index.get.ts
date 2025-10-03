import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, Category, ApiResponse } from '@/types/database'
import { createApiResponse, handleSupabaseError } from '../../utils/apiResponse'

export default defineEventHandler(async (event): Promise<ApiResponse<Category[]>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      handleSupabaseError(error, 'Fetch categories')
    }

    return createApiResponse(data || [])

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch categories')
  }
})
