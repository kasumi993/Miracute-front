/**
 * Service Integration Layer
 * Central export point for all services
 */

// Service Classes (for advanced usage)
export { authService } from './AuthService'
export { ReviewsService } from './ReviewsService'
export { OrderService } from './OrderService'
export { BaseApiService } from './BaseApiService'
export { apiService } from './BaseApiService' // Singleton instance
export { AnalyticsService } from './AnalyticsService'
export { AdminService } from './AdminService'
export { ProductService } from './ProductService'
export { CategoryService } from './CategoryService'
export { ContactService } from './ContactService'
export { PaymentService } from './PaymentService'


// Re-export types for convenience
export type {
  AuthUser,
  UserProfile,
  UserRole,
  Review,
  ReviewCreateInput,
  ReviewUpdateInput,
  ReviewStats,
  Order,
  OrderCreateInput,
  OrderStatus,
  PaymentStatus,
  ApiResponse,
  PaginationParams,
  PaginatedResponse
} from '@/types'

export type {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ErrorCode
} from '@/utils/errors'
