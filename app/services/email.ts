// Client-side email facade that calls server endpoints backed by Brevo

export const EmailService = {
  async sendPurchaseReceipt(orderId: string) {
    return await $fetch(`/api/admin/test-purchase-email`, { method: 'POST', body: { order_id: orderId } })
  },

  async notifySale(orderId: string) {
    return await $fetch(`/api/admin/test-simple-email`, { method: 'POST', body: { order_id: orderId } })
  },

  async subscribeNewsletter(email: string, source?: string) {
    return await $fetch('/api/newsletter/subscribe', { method: 'POST', body: { email, source } })
  }
}


