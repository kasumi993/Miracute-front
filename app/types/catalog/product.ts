/**
 * Product Types
 * Types for products, templates, and digital downloads
 */

import type { Category } from './category'

export type TemplateType =
  | 'website-template'
  | 'business-card'
  | 'wedding-invitation'
  | 'social-media-kit'
  | 'presentation-template'
  | 'email-template'
  | 'other'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  sku?: string
  templateType: TemplateType
  categoryId: string
  category: Category
  tags: string[]
  previewImages: string[]
  videoUrl?: string
  downloadFiles: DownloadFile[]
  specifications: ProductSpecification[]
  whatIncluded: string[]
  requirements?: string[]
  isActive: boolean
  isFeatured: boolean
  isDigital: boolean
  stockQuantity?: number
  weight?: number
  dimensions?: ProductDimensions
  seoTitle?: string
  seoDescription?: string
  viewCount: number
  downloadCount: number
  averageRating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface ProductCreateInput {
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  sku?: string
  templateType: TemplateType
  categoryId: string
  tags?: string[]
  previewImages?: string[]
  videoUrl?: string
  downloadFiles?: DownloadFileInput[]
  specifications?: ProductSpecificationInput[]
  whatIncluded?: string[]
  requirements?: string[]
  isActive?: boolean
  isFeatured?: boolean
  stockQuantity?: number
  weight?: number
  dimensions?: ProductDimensions
  seoTitle?: string
  seoDescription?: string
}

export interface ProductUpdateInput {
  name?: string
  slug?: string
  description?: string
  shortDescription?: string
  price?: number
  compareAtPrice?: number
  sku?: string
  templateType?: TemplateType
  categoryId?: string
  tags?: string[]
  previewImages?: string[]
  videoUrl?: string
  downloadFiles?: DownloadFileInput[]
  specifications?: ProductSpecificationInput[]
  whatIncluded?: string[]
  requirements?: string[]
  isActive?: boolean
  isFeatured?: boolean
  stockQuantity?: number
  weight?: number
  dimensions?: ProductDimensions
  seoTitle?: string
  seoDescription?: string
}

export interface DownloadFile {
  id: string
  filename: string
  originalName: string
  url: string
  fileSize: number
  mimeType: string
  isPreview: boolean
  downloadCount: number
}

export interface DownloadFileInput {
  filename: string
  originalName: string
  url: string
  fileSize: number
  mimeType: string
  isPreview?: boolean
}

export interface ProductSpecification {
  id: string
  name: string
  value: string
  displayOrder: number
}

export interface ProductSpecificationInput {
  name: string
  value: string
  displayOrder?: number
}

export interface ProductDimensions {
  width?: number
  height?: number
  depth?: number
  unit: 'cm' | 'in' | 'mm'
}

export type ProductSortOption =
  | 'name'
  | 'price'
  | 'created_at'
  | 'updated_at'
  | 'average_rating'
  | 'review_count'
  | 'view_count'
  | 'download_count'

export interface ProductFilters {
  search?: string
  categoryId?: string
  templateType?: TemplateType
  priceMin?: number
  priceMax?: number
  tags?: string[]
  featured?: boolean
  sortBy?: ProductSortOption
  sortOrder?: 'asc' | 'desc'
}
