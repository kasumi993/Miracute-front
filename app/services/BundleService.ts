import { BaseApiService } from './BaseApiService'
import type { ApiResponse } from '@/types/database'
import type {
  ProductBundle,
  CreateBundleRequest,
  BundleQueryParams,
  BundleListResponse
} from '@/types/bundle'

const baseService = new BaseApiService()

export const BundleService = {
  // Core CRUD operations
  async getBundles(params?: BundleQueryParams): Promise<ApiResponse<BundleListResponse>> {
    return baseService.get('/bundles', params)
  },

  async getById(id: string): Promise<ApiResponse<ProductBundle>> {
    return baseService.get<ProductBundle>(`/bundles/${id}`)
  },

  async getBySlug(slug: string): Promise<ApiResponse<ProductBundle>> {
    return baseService.get<ProductBundle>(`/bundles/slug/${slug}`)
  },

  async create(bundle: CreateBundleRequest): Promise<ApiResponse<ProductBundle>> {
    return baseService.post<ProductBundle>('/bundles', bundle)
  },

  async update(id: string, bundle: CreateBundleRequest): Promise<ApiResponse<ProductBundle>> {
    return baseService.put<ProductBundle>(`/bundles/${id}`, bundle)
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return baseService.delete<void>(`/bundles/${id}`)
  },


}