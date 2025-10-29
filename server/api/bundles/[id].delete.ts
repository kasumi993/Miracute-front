import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { rateLimit } from '../../utils/security/rateLimit'
import { isAdminUser } from '../../utils/security/auth'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 20
  })(event)

  try {
    // 1. Check admin authentication
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

    // 2. Validate bundle ID
    const bundleId = getRouterParam(event, 'id')
    if (!bundleId) {
      return {
        success: false,
        error: 'Bundle ID is required'
      }
    }

    const idValidation = z.string().uuid().safeParse(bundleId)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid bundle ID format'
      }
    }

    const supabase = serverSupabaseServiceRole(event)

    // 3. Delete the bundle
    const { data, error } = await supabase
      .from('product_bundles')
      .delete()
      .eq('id', bundleId)
      .select('name')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Bundle not found'
        }
      }
      throw error
    }

    // 4. Return success response
    return {
      success: true,
      data: {
        message: 'Bundle deleted successfully.',
        bundle_name: data.name
      },
      error: null
    }

  } catch (error: any) {
    console.error('Delete bundle error:', error)
    return {
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
})