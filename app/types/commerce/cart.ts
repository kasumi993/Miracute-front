/**
 * Shopping Cart Types
 * Types for shopping cart functionality
 */

import type { Product } from '../catalog/product'

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  addedAt: string
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
