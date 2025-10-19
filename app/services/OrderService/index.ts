import * as OrderBaseService from './OrderBaseService'
import * as CheckoutService from './CheckoutService'
import * as DownloadService from './DownloadService'
import * as AnalyticsService from './AnalyticsService'

export * from './CheckoutService'
export * from './OrderBaseService'
export * from './AnalyticsService'

// 2. Exportez l'objet agrégé (le singleton)
export const OrderService = {
  // Gestion des Commandes (OrderBaseService)
  getOrder: OrderBaseService.getOrder,
  getOrders: OrderBaseService.getOrders,
  updateOrderStatus: OrderBaseService.updateOrderStatus,
  cancelOrder: OrderBaseService.cancelOrder,
  requestOrderReviews: OrderBaseService.requestOrderReviews,
  resendOrderEmail: OrderBaseService.resendOrderEmail,

  // Processus de Paiement (CheckoutService)
  calculateOrderSummary: CheckoutService.getOrderSummary, // Renommé pour clarté
  createPaymentIntent: CheckoutService.createPaymentIntent,
  processCheckout: CheckoutService.processCheckout,
  confirmPayment: CheckoutService.confirmPayment,

  // Gestion des Téléchargements (DownloadService)
  getDownloadUrl: DownloadService.getDownloadUrl,

  // Analytique (AnalyticsService)
  getOrderAnalytics: AnalyticsService.getOrderAnalytics,
}