// types/admin/dashboard.ts

import type { Order } from '../commerce/order'
import type { Product } from '../catalog/product'
import type { UserProfile } from '../auth/user' // Import centralisé

export interface DashboardStats {
  overview: DashboardOverview
  recentOrders: Order[]
  topProducts: ProductWithSales[]
  recentCustomers: UserProfile[] // Utilise UserProfile
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
