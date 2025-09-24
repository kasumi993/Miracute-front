/**
 * Comprehensive API Types for Miracute E-commerce Platform
 * Replaces scattered 'any' types with proper TypeScript interfaces
 */

// Base API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error?: string | null
  message?: string
  meta?: ApiMeta
}

export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface SearchResponse<T> {
  items: T[]
  meta: ApiMeta
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  statusCode: number
}

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Authentication Types
export interface AuthUser {
  id: string
  email: string
  emailConfirmed: boolean
  phone?: string
  createdAt: string
  updatedAt: string
  userMetadata: UserMetadata
  appMetadata: AppMetadata
}

export interface UserMetadata {
  avatar_url?: string
  full_name?: string
  first_name?: string
  last_name?: string
}

export interface AppMetadata {
  provider?: string
  providers?: string[]
  role?: UserRole
}

export type UserRole = 'customer' | 'admin' | 'moderator'

// User Profile Types
export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  avatarUrl?: string
  role: UserRole
  stripeCustomerId?: string
  country?: string
  phoneNumber?: string
  dateOfBirth?: string
  marketingOptIn: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfileCreateInput {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role?: UserRole
  country?: string
  phoneNumber?: string
  marketingOptIn?: boolean
}

export interface UserProfileUpdateInput {
  firstName?: string
  lastName?: string
  avatarUrl?: string
  country?: string
  phoneNumber?: string
  dateOfBirth?: string
  marketingOptIn?: boolean
}

// Product Types
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

export type TemplateType =
  | 'website-template'
  | 'business-card'
  | 'wedding-invitation'
  | 'social-media-kit'
  | 'presentation-template'
  | 'email-template'
  | 'other'

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

// Category Types
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

// Review Types
export interface Review {
  id: string
  productId: string
  product: Product
  userId: string
  user: UserProfile
  rating: number
  title?: string
  comment: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  isHelpful: number
  images?: string[]
  adminResponse?: string
  adminResponseDate?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewCreateInput {
  productId: string
  rating: number
  title?: string
  comment: string
  images?: string[]
}

export interface ReviewUpdateInput {
  rating?: number
  title?: string
  comment?: string
  images?: string[]
  isApproved?: boolean
  adminResponse?: string
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: RatingDistribution
  verifiedPurchaseCount: number
}

export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

// Order Types
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

// Shopping Cart Types
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

// Filter and Search Types
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

export type ProductSortOption =
  | 'name'
  | 'price'
  | 'created_at'
  | 'updated_at'
  | 'average_rating'
  | 'review_count'
  | 'view_count'
  | 'download_count'

// Admin Dashboard Types
export interface DashboardStats {
  overview: DashboardOverview
  recentOrders: Order[]
  topProducts: ProductWithSales[]
  recentCustomers: UserProfile[]
  revenueByPeriod: RevenueByPeriod[]
  productStats: ProductStats
  customerStats: CustomerStats
  orderStats: OrderStats
}

export interface DashboardOverview {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  productsGrowth: number
}

export interface ProductWithSales extends Product {
  salesCount: number
  revenue: number
}

export interface RevenueByPeriod {
  period: string
  revenue: number
  orders: number
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  featuredProducts: number
  outOfStockProducts: number
  lowStockProducts: number
}

export interface CustomerStats {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  averageOrderValue: number
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  cancelledOrders: number
  refundedOrders: number
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// File Upload Types
export interface FileUploadResponse {
  url: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
}

export interface FileUploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED'
  message: string
  filename: string
}

// Validation Types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}