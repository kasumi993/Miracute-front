export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { q: searchQuery, category, difficulty, minPrice, maxPrice, sortBy = 'created_at', page = 1, limit = 12 } = query

  if (!searchQuery || typeof searchQuery !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query is required'
    })
  }

  try {
    const { serverSupabaseServiceRole } = await import('#supabase/server')
    const supabase = serverSupabaseServiceRole(event)
    let supabaseQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        category_id,
        difficulty,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)

    // Search in name and description
    supabaseQuery = supabaseQuery.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)

    // Apply filters
    if (category) {
      supabaseQuery = supabaseQuery.eq('category_id', category)
    }

    if (difficulty) {
      supabaseQuery = supabaseQuery.eq('difficulty', difficulty)
    }

    if (minPrice) {
      supabaseQuery = supabaseQuery.gte('price', Number(minPrice))
    }

    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte('price', Number(maxPrice))
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        supabaseQuery = supabaseQuery.order('price', { ascending: true })
        break
      case 'price_desc':
        supabaseQuery = supabaseQuery.order('price', { ascending: false })
        break
      case 'newest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
        break
      case 'popular':
        // Assuming we have a downloads_count or similar field
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false }) // fallback
        break
      default:
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
    }

    // Calculate pagination
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    // Execute query with pagination
    const { data: products, error, count } = await supabaseQuery
      .range(from, to)
      .limit(limitNum)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to search products'
      })
    }

    const total = count || 0
    const hasMore = from + limitNum < total

    return {
      products: products || [],
      total,
      page: pageNum,
      limit: limitNum,
      hasMore
    }

  } catch (error) {
    console.error('Search error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})