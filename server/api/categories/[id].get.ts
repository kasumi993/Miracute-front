import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
  // Check if user is admin for unrestricted access
  const user = await serverSupabaseUser(event)
  const isAdmin = user ? await isAdminUser(user.id, event) : false

  // Use service role for admin access, regular client for public access
  const supabase = isAdmin
    ? serverSupabaseServiceRole<Database>(event)
    : await serverSupabaseClient<Database>(event)
  const identifier = getRouterParam(event, 'id')

  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID or slug is required'
    })
  }

  try {
    // Check if identifier is a UUID (ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq(isUUID ? 'id' : 'slug', identifier)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Category not found
        throw createError({
          statusCode: 404,
          statusMessage: 'Category not found'
        })
      }
      throw error
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch category',
      data: error
    })
  }
})
