export interface ProductBundle {
  id: string
  name: string
  description?: string
  bundle_price: number
  original_price: number
  discount_amount: number
  discount_percentage: number
  products: string[] // Array of product IDs
  is_active: boolean
  featured: boolean
  display_order: number
  slug?: string
  meta_title?: string
  meta_description?: string
  featured_image?: string
  gallery_images?: string[]
  created_at: string
  updated_at: string
  // Populated product data when fetched with relationships
  product_details?: Array<{
    id: string
    name: string
    price: number
    preview_images?: string[]
    category?: { name: string }
  }>
}

export interface BundleRecommendation {
  id: string
  primary_product_id: string
  recommended_bundle_id: string
  relevance_score: number
  conversion_rate: number
  display_order: number
  is_active: boolean
  bundle?: ProductBundle
}

export interface CreateBundleRequest {
  name: string
  description?: string
  bundle_price: number
  products: string[]
  is_active?: boolean
  featured?: boolean
  display_order?: number
  slug?: string
  meta_title?: string
  meta_description?: string
  featured_image?: string
  gallery_images?: string[]
}

export interface BundleQueryParams {
  featured?: boolean
  active?: boolean
  page?: number
  limit?: number
  product_id?: string
  status?: string
}

export interface BundleListResponse {
  bundles: ProductBundle[]
  stats: {
    totalBundles: number
    activeBundles: number
    featuredBundles: number
    totalSavings: number
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface BundleAnalytics {
  total_sales: number
  total_revenue: number
  total_savings_given: number
  conversion_rate: number
  top_bundles: Array<{
    bundle_id: string
    bundle_name: string
    sales_count: number
    revenue: number
  }>
}

export interface BundleCompatibility {
  applicable_bundles: Array<{
    bundle: ProductBundle
    missing_products: string[]
    savings_amount: number
    compatibility_score: number
  }>
}