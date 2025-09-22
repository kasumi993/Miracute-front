import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)

    if (!user) {
      return { isAdmin: false, error: 'Not authenticated' }
    }

    // Check if user is admin through database
    const supabase = serverSupabaseServiceRole(event)
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return { isAdmin: false, error: 'Database error' }
    }

    const isAdmin = userData?.role === 'admin'

    return { isAdmin }

  } catch (error) {
    console.error('Admin check API error:', error)
    return { isAdmin: false, error: 'Server error' }
  }
})