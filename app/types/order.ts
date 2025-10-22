export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  total_amount: number
  currency: string
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  download_files: DownloadFile[]
  created_at: string
}

export interface DownloadFile {
  filename: string
  file_path: string
  file_size: number
}

export interface CreateOrderRequest {
  productId: string
}

export interface CheckoutSession {
  sessionId: string
  url: string
  orderId: string
}

export interface UserOrder {
  id: string
  status: string
  total_amount: number
  currency: string
  created_at: string
  items: {
    product_name: string
    download_files: DownloadFile[]
  }[]
}