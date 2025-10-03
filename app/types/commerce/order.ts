import type { Product } from '../catalog/product'
import type { UserProfile } from '../auth/user' // Import centralisé

/**
 * Status of an order in the fulfillment process.
 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'

/**
 * Status of the payment transaction.
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'

/**
 * Order address information (billing or shipping).
 * Used for both input and final structure.
 */
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

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user: UserProfile // Utilise UserProfile
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

/**
 * Input structure for creating a new order.
 */
export interface OrderCreateInput {
  customerEmail: string
  customerFirstName: string
  customerLastName: string
  customerPhone?: string
  items: OrderItemInput[]
  billingAddress?: Address // Utilise Address
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