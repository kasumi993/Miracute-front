/**
 * Category Types
 * Types for product categories and hierarchical organization
 */

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  isActive: boolean
  displayOrder: number
  productCount: number
  createdAt: string
  updatedAt: string
}

export interface CategoryCreateInput {
  name: string
  slug: string
  description?: string
  parentId?: string
  isActive?: boolean
  displayOrder?: number
}

export interface CategoryUpdateInput {
  name?: string
  slug?: string
  description?: string
  parentId?: string
  isActive?: boolean
  displayOrder?: number
}
