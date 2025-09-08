import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/app/types/database'

export default defineEventHandler(async (event) => {
  try {
    // Get the authenticated user
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    // Use service role client to bypass RLS
    const supabaseServiceRole = serverSupabaseServiceRole<Database>(event)
    const method = getMethod(event)

    if (method === 'GET') {
      // Fetch user profile using service role (bypasses RLS)
      const { data: userProfile, error } = await supabaseServiceRole
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch user profile'
        })
      }

      return {
        user: userProfile || null
      }
    }

    if (method === 'PATCH') {
      // Update user profile using service role
      const body = await readBody(event)
      
      const { data: updatedUser, error } = await supabaseServiceRole
        .from('users')
        .update(body)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating user profile:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update user profile'
        })
      }

      return {
        user: updatedUser
      }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
    
  } catch (error: any) {
    console.error('Error in user API:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})