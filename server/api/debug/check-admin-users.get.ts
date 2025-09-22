import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get all users and their roles
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return { success: false, error: error.message }
    }

    // Count users by role
    const roleStats = users?.reduce((acc, user) => {
      const role = user.role || 'no_role'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Find admin users
    const adminUsers = users?.filter(user => user.role === 'admin') || []

    return {
      success: true,
      data: {
        totalUsers: users?.length || 0,
        roleStats,
        adminUsers: adminUsers.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        })),
        allUsers: users?.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role || 'no_role',
          created_at: user.created_at
        }))
      }
    }

  } catch (error: any) {
    console.error('Debug admin users error:', error)
    return { success: false, error: error.message }
  }
})