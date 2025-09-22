import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, role } = body

    if (!email || !role) {
      return { success: false, error: 'Email and role are required' }
    }

    if (!['admin', 'customer'].includes(role)) {
      return { success: false, error: 'Role must be either "admin" or "customer"' }
    }

    const supabase = serverSupabaseServiceRole(event)

    // Update user role by email
    const { data, error } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('Error updating user role:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: `No user found with email: ${email}` }
    }

    return {
      success: true,
      message: `Successfully updated ${email} role to ${role}`,
      data: data[0]
    }

  } catch (error: any) {
    console.error('Set admin role error:', error)
    return { success: false, error: error.message }
  }
})