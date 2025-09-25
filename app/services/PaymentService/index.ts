// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified PaymentService object for easier usage
export const PaymentService = {
  // GET methods
  getCheckoutSession: (sessionId: string) => import('./get').then(m => m.getCheckoutSession(sessionId)),
  verifyPayment: (paymentId: string) => import('./get').then(m => m.verifyPayment(paymentId)),
  getPaymentMethods: (customerId?: string) => import('./get').then(m => m.getPaymentMethods(customerId)),
  getPaymentHistory: (page?: number, limit?: number) => import('./get').then(m => m.getPaymentHistory(page, limit)),
  getSupportedCurrencies: () => import('./get').then(m => m.getSupportedCurrencies()),
  getTaxRates: (country: string) => import('./get').then(m => m.getTaxRates(country)),

  // POST methods
  createCheckoutSession: (data: any) => import('./post').then(m => m.createCheckoutSession(data)),
  createPaymentIntent: (data: any) => import('./post').then(m => m.createPaymentIntent(data)),
  handlePaymentSuccess: (data: any) => import('./post').then(m => m.handlePaymentSuccess(data)),
  processRefund: (orderId: string, amount?: number, reason?: string) => import('./post').then(m => m.processRefund(orderId, amount, reason)),
  calculateOrderTotal: (data: any) => import('./post').then(m => m.calculateOrderTotal(data)),
  validateCoupon: (code: string, items?: any) => import('./post').then(m => m.validateCoupon(code, items))
}
