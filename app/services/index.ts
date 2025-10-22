/**
 * Service Integration Layer
 * Central export point for all services
 */

// Service Classes (for advanced usage)
export { authService } from './AuthService'
export { ReviewsService } from './ReviewsService'
export { BaseApiService } from './BaseApiService'
export { apiService } from './BaseApiService' // Singleton instance
export { AnalyticsService } from './AnalyticsService'
export { ProductService } from './ProductService'
export { CategoryService } from './CategoryService'
export { ContactService } from './ContactService'
export * as TemplateTypeService from './TemplateTypeService'
export { AccountService } from './AccountService'
export { CartService } from './CartService'
export { EmailService } from './EmailService'
import { AdminService } from './AdminService'

// Order Service with comprehensive customer and admin functionality
export * as OrderService from './OrderService'
export { paymentService, createCheckoutSession } from './PaymentService'
export * as CouponService from './CouponService'
export * as FileService from './FileService'

// Admin Service
export { AdminService }
