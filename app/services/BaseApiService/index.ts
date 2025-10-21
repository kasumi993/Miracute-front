import type { ApiResponse } from '@/types'

export class BaseApiService {
  private baseUrl = '/api'

  async get<T>(endpoint: string, query?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', query })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  private async request<T>(endpoint: string, options: any = {}): Promise<ApiResponse<T>> {
    try {
      const response = await $fetch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, options)
      return response
    } catch (error: any) {
      console.error('API Error:', error)

      const message = error?.data?.message || error?.statusMessage || error?.message || 'Request failed'

      return {
        success: false,
        data: null as T,
        error: message
      }
    }
  }
}

export const apiService = new BaseApiService()
