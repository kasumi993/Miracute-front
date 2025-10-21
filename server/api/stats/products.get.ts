import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { createApiResponse } from '../../utils/api/apiResponse'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    // Get product stats
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('is_active, is_featured')

    if (error) {
      console.error('Supabase products query error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products'
      })
    }

    const products = allProducts || []
    const productStats = {
      totalProducts: products.length,
      activeProducts: products.filter((p: any) => p.is_active).length,
      inactiveProducts: products.filter((p: any) => !p.is_active).length,
      featuredProducts: products.filter((p: any) => p.featured).length,
    }

    return createApiResponse({ productStats })

  } catch (error: any) {
    console.error('Product stats API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product stats'
    })
  }
})