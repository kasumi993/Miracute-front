// Export used POST methods only
export * from './post'

// Create a minimal ContactService object with only used methods
export const ContactService = {
  // Only expose the methods that are actually used in the application
  submitContactForm: (data: any) => import('./post').then(m => m.submitContactForm(data)),
  subscribeNewsletter: (data: any) => import('./post').then(m => m.subscribeNewsletter(data))
}
