// Testing utilities for consistent test data and mocks
import type { ProductWithCategory, Coupon, Order, CartItem } from '~/types'

export const createMockProduct = (overrides: Partial<ProductWithCategory> = {}): ProductWithCategory => ({
  id: `prod-${  Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Product',
  description: 'A test product description',
  price: 29.99,
  featured_image_url: 'https://example.com/image.jpg',
  categories: {
    id: `cat-${  Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Category'
  },
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: `coupon-${  Math.random().toString(36).substr(2, 9)}`,
  code: 'TEST10',
  name: 'Test Coupon',
  description: 'Test coupon description',
  discount_type: 'percentage',
  discount_value: 10,
  usage_limit: 100,
  usage_count: 0,
  usage_limit_per_customer: 1,
  customer_eligibility: 'all',
  valid_from: new Date().toISOString(),
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  product_id: `prod-${  Math.random().toString(36).substr(2, 9)}`,
  quantity: 1,
  price: 29.99,
  category_id: `cat-${  Math.random().toString(36).substr(2, 9)}`,
  ...overrides
})

export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: `order-${  Math.random().toString(36).substr(2, 9)}`,
  customer_email: 'test@example.com',
  total_amount: 29.99,
  payment_status: 'paid',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  order_items: [],
  ...overrides
})

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  ...(success ? {} : { error: 'Mock error', details: 'Test error details' })
})

// Helper for testing async functions
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock localStorage for SSR testing
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => Object.keys(store).forEach(key => delete store[key])
  }
}

// Mock fetch for API testing
export const mockFetch = (responses: Record<string, any>) => {
  return jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    const response = responses[url] || { success: false, error: 'Not found' }
    return Promise.resolve({
      ok: response.success !== false,
      status: response.success !== false ? 200 : 404,
      json: () => Promise.resolve(response)
    })
  })
}

// Test data generators
export class TestDataGenerator {
  static products(count: number): ProductWithCategory[] {
    return Array.from({ length: count }, (_, i) => createMockProduct({
      name: `Product ${i + 1}`,
      price: (Math.random() * 100) + 10
    }))
  }

  static coupons(count: number): Coupon[] {
    return Array.from({ length: count }, (_, i) => createMockCoupon({
      code: `COUPON${i + 1}`,
      discount_value: (i + 1) * 5
    }))
  }

  static cartItems(count: number): CartItem[] {
    return Array.from({ length: count }, () => createMockCartItem())
  }
}

// Validation helpers
export const validateApiResponse = (response: any, expectedShape: Record<string, string>) => {
  const errors: string[] = []

  Object.entries(expectedShape).forEach(([key, type]) => {
    if (!(key in response)) {
      errors.push(`Missing required field: ${key}`)
    } else if (typeof response[key] !== type) {
      errors.push(`Field ${key} should be ${type}, got ${typeof response[key]}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
