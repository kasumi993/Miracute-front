import { requireAdminAuthentication } from '../../utils/security/auth'
import type { Database, ApiResponse, Product } from '@/types/database'
import { createApiResponse, handleSupabaseError, createApiError } from '../../utils/api/apiResponse'

// Définir un type enrichi pour le résultat
interface ProductWithSales extends Product {
  sales_count: number
  revenue: number
}

export default defineEventHandler(async (event): Promise<ApiResponse<ProductWithSales[]>> => {
  const { supabase } = await requireAdminAuthentication(event)

  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10
  const sortBy = query.sortBy as string || 'view_count'

  let orderColumn: string
  let ascending = false

  switch (sortBy) {
    case 'downloads':
      orderColumn = 'download_count'
      break
    case 'recent':
      orderColumn = 'created_at'
      break
    case 'price_high':
      orderColumn = 'price'
      break
    case 'price_low':
      orderColumn = 'price'
      ascending = true
      break
    case 'views':
    default:
      orderColumn = 'view_count'
      break
  }

  try {
    // 1. Première requête: Récupérer les produits triés
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order(orderColumn, { ascending })
      .limit(limit)

    if (productsError) {
      handleSupabaseError(productsError, 'Fetch popular products')
    }

    if (!products || products.length === 0) {
      return createApiResponse([])
    }

    const productIds = products.map(p => p.id)

    const { data: salesData, error: salesError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .in('product_id', productIds)

    if (salesError) {
      console.warn('Warning: Could not fetch sales data for popular products:', salesError)
    }

    // 3. Calculer les ventes et enrichir la réponse
    const salesByProduct: Record<string, number> = {}
    salesData?.forEach(item => {
      salesByProduct[item.product_id] = (salesByProduct[item.product_id] || 0) + (item.quantity || 0)
    })

    const enrichedProducts: ProductWithSales[] = products.map(product => {
      const sales_count = salesByProduct[product.id] || 0
      return {
        ...product,
        sales_count,
        revenue: sales_count * parseFloat(product.price || '0')
      }
    })

    return createApiResponse(enrichedProducts)

  } catch (error: any) {
    // Gestion centralisée des erreurs
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch popular products')
  }
})