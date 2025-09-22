// Export all services from their respective folders
export { AdminService } from './AdminService'
export { AuthService } from './AuthService'
export { ProductService } from './ProductService'
export { PaymentService } from './PaymentService'
export { AccountService } from './AccountService'
export { ContactService } from './ContactService'
export { ReviewService } from './ReviewService'
export { AnalyticsService } from './AnalyticsService'
export { CategoryService } from './CategoryService'

// Export BaseApiService for custom implementations
export { BaseApiService } from './BaseApiService'

// Export all types from AdminService
export type {
  AdminProductFilters,
  PaginationParams
} from './AdminService/get'

// Export all types from ProductService
export type {
  ProductFilters,
  ProductPaginationParams
} from './ProductService/get'

// Export all types from PaymentService
export type {
  CheckoutSessionData,
  PaymentIntentData
} from './PaymentService/post'

// Export all types from AccountService
export type * from './AccountService/get'
export type * from './AccountService/post'

// Export all types from ContactService
export type * from './ContactService/get'
export type * from './ContactService/post'

// Export all types from ReviewService
export type * from './ReviewService/get'
export type * from './ReviewService/post'

// Export all types from AnalyticsService
export type * from './AnalyticsService/get'
export type * from './AnalyticsService/post'

// Export all types from CategoryService
export type * from './CategoryService/get'
export type * from './CategoryService/post'

// Export types from BaseApiService
export type {
  RequestConfig
} from './BaseApiService'

// Legacy compatibility exports (will be deprecated)
// These maintain compatibility with the old single-file approach
export { AdminService as adminService } from './AdminService'
export { AuthService as authService } from './AuthService'
export { ProductService as productService } from './ProductService'
export { PaymentService as paymentService } from './PaymentService'
export { AccountService as accountService } from './AccountService'
export { ContactService as contactService } from './ContactService'
export { ReviewService as reviewService } from './ReviewService'
export { AnalyticsService as analyticsService } from './AnalyticsService'
export { CategoryService as categoryService } from './CategoryService'