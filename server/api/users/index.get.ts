import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
  // Check if user is admin
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  const isAdmin = await isAdminUser(user.id, event)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  // Use service role for admin access
  const supabase = serverSupabaseServiceRole<Database>(event)

  // Get query parameters
  const query = getQuery(event)
  const {
    page = 1,
    limit = 20,
    search,
    role,
    status = 'active'
  } = query

  try {
    // Build the query
    let usersQuery = supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        avatar_url,
        stripe_customer_id,
        country,
        created_at,
        updated_at
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      usersQuery = usersQuery.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    if (role) {
      usersQuery = usersQuery.eq('role', role)
    }

    // Note: users table doesn't have is_active column, so status filter is not applicable

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit)
    usersQuery = usersQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    const { data: users, error, count } = await usersQuery

    if (error) {
      throw error
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / Number(limit))

    return {
      success: true,
      data: {
        data: users || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages,
          hasNextPage: Number(page) < totalPages,
          hasPreviousPage: Number(page) > 1
        }
      }
    }

  } catch (error: any) {
    console.error('Error fetching users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users',
      data: error
    })
  }
})