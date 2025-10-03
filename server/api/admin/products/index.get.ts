import { requireAdminAuthentication } from '../../../utils/auth'
import type { ProductWithCategory, ApiResponse, PaginatedResponse, PaginationMeta } from '@/types'
import { createApiResponse, handleSupabaseError } from '../../../utils/apiResponse'

// Utiliser un type plus générique si possible, sinon cette interface est bien placée ici
interface AdminProductFilters {
  search?: string
  category?: string
  status?: 'active' | 'inactive' | 'featured' | 'all'
  template_type?: string
  // Ajouter d'autres filtres d'admin : ex: min_stock, has_reviews
}

export default defineEventHandler(async (event): Promise<ApiResponse<PaginatedResponse<ProductWithCategory>>> => {
  // 1. Authentification et Initialisation
  const { supabase } = await requireAdminAuthentication(event)

  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  const filters: AdminProductFilters = {
    search: query.search as string,
    category: query.category as string,
    status: query.status as any,
    template_type: query.template_type as string
  }

  try {
    // 2. Construction de la requête de base
    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `, { count: 'exact' }) // Utilisation de count: 'exact' pour la pagination

    // 3. Application des filtres
    if (filters.search) {
      const searchTerm = filters.search.trim().toLowerCase() // Utiliser lowercase pour la recherche insensible à la casse
      queryBuilder = queryBuilder.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
    }

    if (filters.category) {
      queryBuilder = queryBuilder.eq('category_id', filters.category)
    }

    if (filters.status) {
      switch (filters.status) {
        case 'active':
          queryBuilder = queryBuilder.eq('is_active', true)
          break
        case 'inactive':
          queryBuilder = queryBuilder.eq('is_active', false)
          break
        case 'featured':
          queryBuilder = queryBuilder.eq('is_featured', true)
          break
      }
    }

    if (filters.template_type) {
      queryBuilder = queryBuilder.eq('template_type', filters.template_type)
    }
    
    // 4. Tri et Pagination
    queryBuilder = queryBuilder.order('created_at', { ascending: false }) // Tri par défaut
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    // 5. Exécution de la requête
    const { data, error, count } = await queryBuilder

    if (error) {
      handleSupabaseError(error, 'Fetch admin products')
    }

    // 6. Construction de la réponse PaginatedResponse
    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    const paginationMeta: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages, // Utilisation du nom de propriété standardisé
        hasPrevPage: page > 1           // Utilisation du nom de propriété standardisé
    }

    const paginatedResponse: PaginatedResponse<ProductWithCategory> = {
      data: (data as ProductWithCategory[]) || [],
      meta: paginationMeta
    }

    return createApiResponse(paginatedResponse)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch admin products')
  }
})