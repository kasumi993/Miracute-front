/**
 * Shopping Cart Types
 * Types for shopping cart functionality
 */

import type { ProductWithCategory } from '@/types/database'

export interface BundleMetadata {
  bundleId: string
  bundleName: string
  originalPrice: number
  discountedPrice: number
  discount: number
  addedAsBundle?: boolean // Flag to identify if item was added as part of bundle
}

export interface CartItem {
  id: string
  product: ProductWithCategory
  selectedVariant?: string
  addedAt: string
  price: number // Price at time of adding to cart
  bundleMetadata?: BundleMetadata // Bundle information if item is part of a bundle
}

export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  items: CartItem[]
  subtotal: number
  itemCount: number
  updatedAt: string
}
