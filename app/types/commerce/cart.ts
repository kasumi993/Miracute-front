/**
 * Shopping Cart Types
 * Types for shopping cart functionality
 */

import type { ProductWithCategory } from '@/types/database'

export interface CartItem {
  id: string
  product: ProductWithCategory
  selectedVariant?: string
  addedAt: string
  price: number // Price at time of adding to cart
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
