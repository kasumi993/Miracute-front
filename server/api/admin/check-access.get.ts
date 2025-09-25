import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  try {
    // Get the authenticated user - handle the case where there's no session
    let user
    try {
      user = await serverSupabaseUser(event)
    } catch (authError) {
      console.log('Admin check - No auth session:', authError.message)
      return {
        isAdmin: false,
        error: 'Not authenticated'
      }
    }

    if (!user) {
      return {
        isAdmin: false,
        error: 'Not authenticated'
      }
    }

    // Use service role to check admin status (bypass RLS)
    const supabase = await serverSupabaseServiceRole<Database>(event)

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Admin check - Database error:', userError)
      return {
        isAdmin: false,
        error: 'Database error'
      }
    }

    const isAdmin = userData?.role === 'admin'

    console.log('Admin check API:', {
      userId: user.id,
      email: user.email,
      dbRole: userData?.role,
      isAdmin
    })

    return {
      isAdmin,
      role: userData?.role,
      userId: user.id,
      email: user.email
    }

  } catch (error) {
    console.error('Admin check API error:', error)
    return {
      isAdmin: false,
      error: error.message
    }
  }
})
