/**
 * Order Types
 * Types for orders, payments, and fulfillment
 */

import type { Product } from '../catalog/product'
import type { UserProfile } from '../auth/user'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user: UserProfile
  customerEmail: string
  customerFirstName: string
  customerLastName: string
  customerPhone?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentIntentId?: string
  paymentMethodId?: string
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  billingAddress?: Address
  notes?: string
  downloadTokens: DownloadToken[]
  fulfillmentDate?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  downloadUrl?: string
  downloadExpiresAt?: string
}

export interface OrderCreateInput {
  customerEmail: string
  customerFirstName: string
  customerLastName: string
  customerPhone?: string
  items: OrderItemInput[]
  billingAddress?: AddressInput
  notes?: string
}

export interface OrderItemInput {
  productId: string
  quantity: number
  unitPrice: number
}

export interface DownloadToken {
  id: string
  orderId: string
  productId: string
  token: string
  downloadCount: number
  maxDownloads: number
  expiresAt: string
  createdAt: string
}

export interface Address {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone?: string
}

export interface AddressInput {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone?: string
}
