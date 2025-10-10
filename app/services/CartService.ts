import { BaseApiService } from './BaseApiService'
import type { ApiResponse } from '@/types'

interface CartItemData {
  productId: string
}

interface CartSaveResponse {
  message: string
  data?: any
}

const baseService = new BaseApiService()

export const CartService = {
  /**
   * Save cart items to database for authenticated user
   */
  async saveCart(items: CartItemData[]): Promise<ApiResponse<CartSaveResponse>> {
    return baseService.post<CartSaveResponse>('/cart/save', {
      items
    })
  },

  /**
   * Load cart items from database for authenticated user
   */
  async loadCart(): Promise<ApiResponse<any[]>> {
    return baseService.get<any[]>('/cart/load')
  },

  /**
   * Clear cart items from database for authenticated user
   */
  async clearCart(): Promise<ApiResponse<CartSaveResponse>> {
    return baseService.post<CartSaveResponse>('/cart/save', {
      items: []
    })
  }
}