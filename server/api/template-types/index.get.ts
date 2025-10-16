import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { isAdminUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  // Try to get user, but don't fail if not authenticated
  let user = null
  try {
    user = await serverSupabaseUser(event)
  } catch {
    // User is not authenticated, which is fine for public endpoints
  }

  // Check if user is admin
  const isAdmin = user ? await isAdminUser(user.id) : false

  try {
    let query = supabase
      .from('template_types')
      .select('*')
      .order('sort_order', { ascending: true })

    // If not admin, only show active template types
    if (!isAdmin) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

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
