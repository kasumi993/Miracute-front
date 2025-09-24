import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/app/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  try {
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 12
    const category = query.category as string
    const search = query.search as string
    const featured = query.featured === 'true'
    const sortBy = (query.sortBy || query.sort) as string || 'newest'
    const minPrice = query.minPrice || query.min_price
    const maxPrice = query.maxPrice || query.max_price

    let baseQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        compare_at_price,
        preview_images,
        software_required,
        tags,
        is_featured,
        is_active,
        created_at,
        category:categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)

    // Apply filters
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (categoryData) {
        baseQuery = baseQuery.eq('category_id', categoryData.id)
      }
    }

    if (search) {
      baseQuery = baseQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    if (featured) {
      baseQuery = baseQuery.eq('is_featured', true)
    }

    if (minPrice) {
      baseQuery = baseQuery.gte('price', parseFloat(minPrice as string))
    }

    if (maxPrice) {
      baseQuery = baseQuery.lte('price', parseFloat(maxPrice as string))
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
      case 'price_low':
        baseQuery = baseQuery.order('price', { ascending: true })
        break
      case 'price_desc':
      case 'price_high':
        baseQuery = baseQuery.order('price', { ascending: false })
        break
      case 'oldest':
        baseQuery = baseQuery.order('created_at', { ascending: true })
        break
      case 'popular':
        // For now, order by created_at desc, later we can add actual popularity logic
        baseQuery = baseQuery.order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        baseQuery = baseQuery.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    const offset = (page - 1) * limit
    baseQuery = baseQuery.range(offset, offset + limit - 1)

    const { data: products, error: productsError } = await baseQuery

    if (productsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: productsError
      })
    }

    // Fetch review statistics for each product
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        // Get review stats
        const { data: reviewStats, error: statsError } = await supabase
          .from('product_reviews')
          .select('rating')
          .eq('product_id', product.id)
          .eq('is_approved', true)

        let reviewCount = 0
        let averageRating = 0

        if (!statsError && reviewStats) {
          reviewCount = reviewStats.length
          if (reviewCount > 0) {
            const totalRating = reviewStats.reduce((sum, review) => sum + review.rating, 0)
            averageRating = Math.round((totalRating / reviewCount) * 10) / 10
          }
        }

        return {
          ...product,
          review_count: reviewCount,
          average_rating: averageRating
        }
      })
    )

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (categoryData) {
        countQuery = countQuery.eq('category_id', categoryData.id)
      }
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    if (featured) {
      countQuery = countQuery.eq('is_featured', true)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error getting product count:', countError)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      success: true,
      data: {
        data: productsWithReviews,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }

  } catch (error: any) {
    console.error('Error fetching products with reviews:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products with reviews'
    })
  }
})