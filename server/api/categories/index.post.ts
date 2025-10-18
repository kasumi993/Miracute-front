import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { isAdminUser } from '../../utils/auth'
import { createApiResponse, createApiError } from '../../utils/apiResponse'
import type { Database } from '@/types/database'

interface CreateCategoryRequest {
  name: string
  slug?: string
  description?: string
  sort_order?: number
  is_active?: boolean
  parent_id?: string
}

export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
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

    const body = await readBody<CreateCategoryRequest>(event)

    // Validate required fields
    if (!body.name) {
      return createApiError('Name is required', 400)
    }

    const supabase = serverSupabaseServiceRole<Database>(event)

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existingCategory) {
      return createApiError('Category with this slug already exists', 400)
    }

    // Create category
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        sort_order: body.sort_order || 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
        parent_id: body.parent_id || null,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return createApiError('Failed to create category', 500, error.message)
    }

    return createApiResponse(category)

  } catch (error: any) {
    console.error('Create category error:', error)

    if (error.statusCode) {
      throw error
    }

    return createApiError('Failed to create category', 500, error.message)
  }
})