import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database'
import type { H3Event } from 'h3'

/**
 * Validates admin access and returns authenticated user and supabase service role client
 */
export async function validateAdminAccess(event: H3Event) {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Use service role to check admin status (bypass RLS)
  const supabase = await serverSupabaseServiceRole<Database>(event)
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || userData?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  return {
    user,
    supabase,
    userData
  }
}