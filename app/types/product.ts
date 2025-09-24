import type { ProductWithCategory } from './database'

export interface ProductPageProps {
  product: ProductWithCategory
  reviewCount: number
  downloadCount: number
}

export interface ProductActionsProps {
  product: ProductWithCategory
  isProductInCart: boolean
  isInWishlist: boolean
}

export interface ProductActionsEmits {
  addToCart: []
  buyNow: []
  toggleFavorite: []
}

export interface CollapsibleSectionProps {
  isOpen: boolean
}

export interface CollapsibleSectionEmits {
  toggle: []
}

export interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_breakdown: Record<number, number>
}

export interface ProductSpecsProps {
  product: Pick<ProductWithCategory, 'difficulty_level' | 'template_type' | 'file_size' | 'dimensions' | 'software_required'>
  isOpen: boolean
}

export interface ProductTagsProps {
  tags: string[]
  isOpen: boolean
}

export interface ProductDescriptionProps {
  description: string
  isOpen: boolean
}

export interface PurchaseVerification {
  hasPurchased: boolean
  isAdmin: boolean
  checkingPurchase: boolean
}

export interface OrderItem {
  product_id: string
  // Add other order item properties as needed
}

export interface Order {
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  order_items?: OrderItem[]
  // Add other order properties as needed
}

export interface OrdersResponse {
  data?: Order[]
  success: boolean
  error?: string
}