// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified ContactService object for easier usage
export const ContactService = {
  // GET methods
  getContactSubmissions: (page?: number, limit?: number, status?: string) => import('./get').then(m => m.getContactSubmissions(page, limit, status)),
  getContactSubmission: (submissionId: string) => import('./get').then(m => m.getContactSubmission(submissionId)),
  getSupportTickets: (page?: number, limit?: number, status?: string) => import('./get').then(m => m.getSupportTickets(page, limit, status)),
  getSupportTicket: (ticketId: string) => import('./get').then(m => m.getSupportTicket(ticketId)),
  getTicketMessages: (ticketId: string, page?: number, limit?: number) => import('./get').then(m => m.getTicketMessages(ticketId, page, limit)),
  getNewsletterSubscriptions: (page?: number, limit?: number, status?: string) => import('./get').then(m => m.getNewsletterSubscriptions(page, limit, status)),
  getNewsletterStatus: (email: string) => import('./get').then(m => m.getNewsletterStatus(email)),
  getNewsletterCategories: () => import('./get').then(m => m.getNewsletterCategories()),
  getFaqItems: (category?: string) => import('./get').then(m => m.getFaqItems(category)),
  getFaqCategories: () => import('./get').then(m => m.getFaqCategories()),
  getContactInfo: () => import('./get').then(m => m.getContactInfo()),
  searchFaq: (query: string) => import('./get').then(m => m.searchFaq(query)),

  // POST methods
  submitContactForm: (data: any) => import('./post').then(m => m.submitContactForm(data)),
  subscribeNewsletter: (data: any) => import('./post').then(m => m.subscribeNewsletter(data)),
  unsubscribeNewsletter: (email: string, token?: string) => import('./post').then(m => m.unsubscribeNewsletter(email, token)),
  updateNewsletterPreferences: (email: string, categories: string[], token?: string) => import('./post').then(m => m.updateNewsletterPreferences(email, categories, token)),
  confirmNewsletterSubscription: (token: string) => import('./post').then(m => m.confirmNewsletterSubscription(token)),
  createSupportTicket: (data: any) => import('./post').then(m => m.createSupportTicket(data)),
  addTicketMessage: (ticketId: string, data: any) => import('./post').then(m => m.addTicketMessage(ticketId, data)),
  closeSupportTicket: (ticketId: string, reason?: string) => import('./post').then(m => m.closeSupportTicket(ticketId, reason)),
  reopenSupportTicket: (ticketId: string, message: string) => import('./post').then(m => m.reopenSupportTicket(ticketId, message)),
  updateContactSubmissionStatus: (submissionId: string, status: string, response?: string) => import('./post').then(m => m.updateContactSubmissionStatus(submissionId, status, response)),
  bulkUpdateNewsletterSubscriptions: (data: any) => import('./post').then(m => m.bulkUpdateNewsletterSubscriptions(data)),
  sendNewsletterCampaign: (data: any) => import('./post').then(m => m.sendNewsletterCampaign(data))
}
