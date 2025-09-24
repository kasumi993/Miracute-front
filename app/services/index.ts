/**
 * Service Integration Layer - Refactored
 * Central export point for all refactored services
 * Replaces the scattered service imports throughout the codebase
 */

// Core Services (New Architecture)
export { authService } from './core/AuthenticationService'
export { reviewsService } from './core/ReviewsService'
export { orderService } from './core/OrderService'
export { apiService } from './core/BaseApiService'

// Service Classes (for advanced usage)
export { AuthenticationService } from './core/AuthenticationService'
export { ReviewsService } from './core/ReviewsService'
export { OrderService } from './core/OrderService'
export { BaseApiService } from './core/BaseApiService'

// Legacy service mappings for backward compatibility
// These will be gradually phased out as we update components

import { authService } from './core/AuthenticationService'
import { reviewsService } from './core/ReviewsService'
import { orderService } from './core/OrderService'
import { apiService } from './core/BaseApiService'

/**
 * Legacy AuthService mapping
 * @deprecated Use authService instead
 */
export const AuthService = {
  // User management
  getUser: () => authService.getCurrentProfile(),
  updateUser: (updates: any) => authService.updateProfile(updates),
  createUserProfile: (data: any) => authService.signUp(data),

  // Authentication
  signIn: (credentials: any) => authService.signIn(credentials),
  signUp: (credentials: any) => authService.signUp(credentials),
  signOut: () => authService.signOut(),

  // Authorization
  checkAccess: async () => {
    const state = authService.getAuthState()
    return {
      isAdmin: authService.isAdmin(),
      user: state.user,
      profile: state.profile
    }
  }
}

/**
 * Legacy ReviewService mapping
 * @deprecated Use reviewsService instead
 */
export const ReviewService = {
  // Get reviews
  getProductReviews: (productId: string, options?: any) =>
    reviewsService.getProductReviews(productId, options?.filters, options?.pagination),

  getReviewStats: (productId: string) =>
    reviewsService.getProductReviewStats(productId),

  // Submit reviews
  submitReview: (data: any) => reviewsService.submitReview(data),

  // Update reviews
  updateReview: (id: string, data: any) => reviewsService.updateReview(id, data),

  // Delete reviews
  deleteReview: (id: string) => reviewsService.deleteReview(id)
}

/**
 * Legacy ProductService mapping
 * @deprecated Use dedicated product service when created
 */
export const ProductService = {
  // This will be implemented with the new architecture
  getProducts: async (options?: any) => {
    return apiService.get('/products', options)
  },

  getProduct: async (id: string) => {
    return apiService.get(`/products/${id}`)
  },

  getProductWithReviews: async (id: string) => {
    return apiService.get(`/products/${id}/with-reviews`)
  }
}

/**
 * Legacy AdminService mapping
 * @deprecated Use specific services instead
 */
export const AdminService = {
  // Dashboard
  getDashboardStats: async (params?: any) => {
    return apiService.get('/admin/dashboard/stats', params)
  },

  // Products
  getProducts: async (filters?: any, pagination?: any) => {
    return apiService.get('/admin/products', { ...filters, ...pagination })
  },

  getProduct: async (id: string) => {
    return apiService.get(`/admin/products/${id}`)
  },

  // Orders
  getOrders: async (filters?: any, pagination?: any) => {
    return orderService.getOrders(filters, pagination)
  },

  getOrder: async (id: string) => {
    return orderService.getOrder(id)
  },

  // Reviews
  getReviews: async (filters?: any, pagination?: any) => {
    return reviewsService.getReviewsForModeration(filters, pagination)
  },

  moderateReview: async (id: string, action: any) => {
    return reviewsService.moderateReview(id, action)
  },

  // Alerts and system health
  getAdminAlerts: async () => {
    return apiService.get('/admin/alerts')
  },

  getSystemHealth: async () => {
    return apiService.get('/admin/system/health')
  },

  // Placeholder methods for compatibility
  dismissAlert: async (id: string) => {
    return apiService.post(`/admin/alerts/${id}/dismiss`)
  },

  markAllAlertsRead: async () => {
    return apiService.post('/admin/alerts/mark-all-read')
  },

  executeQuickAction: async (actionData: any) => {
    return apiService.post('/admin/actions/execute', actionData)
  },

  exportData: async (config: any) => {
    return apiService.post('/admin/export-data', config)
  }
}

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
} from '~/types/api'

export type {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ErrorCode
} from '~/utils/errors'

// Legacy exports for gradual migration (old services still work)
export { AdminService as adminService } from './AdminService'
export { AuthService as authServiceLegacy } from './AuthService'
export { ProductService as productServiceLegacy } from './ProductService'
export { PaymentService as paymentService } from './PaymentService'
export { AccountService as accountService } from './AccountService'
export { ContactService as contactService } from './ContactService'
export { ReviewService as reviewServiceLegacy } from './ReviewService'
export { AnalyticsService as analyticsService } from './AnalyticsService'
export { CategoryService as categoryService } from './CategoryService'

// Export the old BaseApiService for components that still use it
export { BaseApiService as BaseApiServiceLegacy } from './BaseApiService'