import type { Database } from '~/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  search?: string
  difficulty?: string
  software?: string[]
  featured?: boolean
}

interface ProductsResponse {
  products: Product[]
  total: number
  hasMore: boolean
}

export const useProducts = () => {
  const supabase = useSupabaseClient<Database>()

  // State
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalProducts = ref(0)
  const hasMore = ref(false)

  // Constants
  const PRODUCTS_PER_PAGE = 12

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (fetchError) throw fetchError

      categories.value = data || []
      return data
    } catch (err) {
      console.error('Error fetching categories:', err)
      throw err
    }
  }

  // Fetch products with filters and pagination
  const fetchProducts = async (
    filters: ProductFilters = {},
    page: number = 1,
    append: boolean = false
  ): Promise<ProductsResponse> => {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `, { count: 'exact' })
        .eq('is_active', true)

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters.featured) {
        query = query.eq('is_featured', true)
      }

      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.software && filters.software.length > 0) {
        query = query.overlaps('software_required', filters.software)
      }

      if (filters.search) {
        query = query.textSearch('fts', filters.search, {
          type: 'websearch',
          config: 'english'
        })
      }

      // Pagination
      const from = (page - 1) * PRODUCTS_PER_PAGE
      const to = from + PRODUCTS_PER_PAGE - 1

      query = query
        .range(from, to)
        .order('created_at', { ascending: false })

      const { data, count, error: fetchError } = await query

      if (fetchError) throw fetchError

      const productsData = data || []
      totalProducts.value = count || 0
      hasMore.value = (count || 0) > page * PRODUCTS_PER_PAGE

      if (append) {
        products.value = [...products.value, ...productsData]
      } else {
        products.value = productsData
        currentPage.value = page
      }

      return {
        products: productsData,
        total: count || 0,
        hasMore: hasMore.value
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch products'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch single product by slug
  const fetchProduct = async (slug: string): Promise<Product | null> => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Product not found
          return null
        }
        throw fetchError
      }

      // Increment view count
      await incrementViewCount(data.id)

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch product'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch products by category
  const fetchProductsByCategory = async (categorySlug: string, page: number = 1) => {
    try {
      // First, get the category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single()

      if (categoryError || !category) {
        throw new Error('Category not found')
      }

      return await fetchProducts({ category: category.id }, page)
    } catch (err) {
      error.value = 'Failed to fetch products for category'
      throw err
    }
  }

  // Fetch featured products
  const fetchFeaturedProducts = async (limit: number = 6) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      console.error('Error fetching featured products:', err)
      throw err
    }
  }

  // Search products
  const searchProducts = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      return await fetchProducts({}, page)
    }

    return await fetchProducts({ search: query }, page)
  }

  // Get related products (same category, excluding current product)
  const getRelatedProducts = async (productId: string, categoryId: string, limit: number = 4) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      console.error('Error fetching related products:', err)
      return []
    }
  }

  // Increment product view count
  const incrementViewCount = async (productId: string) => {
    try {
      await supabase.rpc('increment_view_count', { product_id: productId })
    } catch (err) {
      // Non-critical error, don't throw
      console.warn('Failed to increment view count:', err)
    }
  }

  // Load more products (for infinite scroll)
  const loadMore = async (filters: ProductFilters = {}) => {
    if (!hasMore.value || isLoading.value) return

    await fetchProducts(filters, currentPage.value + 1, true)
  }

  // Get product price display
  const getProductPrice = (product: Product) => {
    const price = parseFloat(product.price)
    const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null

    return {
      price,
      comparePrice,
      hasDiscount: comparePrice && comparePrice > price,
      discountPercentage: comparePrice && comparePrice > price 
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : 0,
      formattedPrice: `$${price.toFixed(2)}`,
      formattedComparePrice: comparePrice ? `$${comparePrice.toFixed(2)}` : null
    }
  }

  // Get product difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get unique filter options
  const getFilterOptions = () => {
    const allTags = products.value.flatMap(p => p.tags || [])
    const allSoftware = products.value.flatMap(p => p.software_required || [])
    const allDifficulties = products.value.map(p => p.difficulty_level).filter(Boolean)

    return {
      tags: [...new Set(allTags)].sort(),
      software: [...new Set(allSoftware)].sort(),
      difficulties: [...new Set(allDifficulties)].sort(),
      priceRange: {
        min: Math.min(...products.value.map(p => parseFloat(p.price))),
        max: Math.max(...products.value.map(p => parseFloat(p.price)))
      }
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Reset pagination
  const resetPagination = () => {
    currentPage.value = 1
    totalProducts.value = 0
    hasMore.value = false
  }

  return {
    // State
    products: readonly(products),
    categories: readonly(categories),
    isLoading: readonly(isLoading),
    error: readonly(error),
    currentPage: readonly(currentPage),
    totalProducts: readonly(totalProducts),
    hasMore: readonly(hasMore),

    // Methods
    fetchProducts,
    fetchProduct,
    fetchCategories,
    fetchProductsByCategory,
    fetchFeaturedProducts,
    searchProducts,
    getRelatedProducts,
    loadMore,
    getProductPrice,
    getDifficultyColor,
    getFilterOptions,
    clearError,
    resetPagination
  }
}