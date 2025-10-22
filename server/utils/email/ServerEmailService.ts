import type { EmailProvider, EmailResult, EmailRecipient, EmailConfig } from './types'
import { BrevoProvider } from './providers/BrevoProvider'

export class ServerEmailService {
  private provider: EmailProvider
  private config: EmailConfig

  constructor(config?: Partial<EmailConfig>) {
    // Get configuration from runtime config and merge with provided config
    const runtimeConfig = useRuntimeConfig()

    this.config = {
      brevo: {
        apiKey: config?.brevo?.apiKey || runtimeConfig.brevoApiKey,
        listId: config?.brevo?.listId || runtimeConfig.brevoListId
      }
    }

    if (!this.config.brevo?.apiKey) {
      throw new Error('Brevo API key is required')
    }
    this.provider = new BrevoProvider(this.config.brevo.apiKey, this.config.brevo.listId)
  }

  // High-level business methods
  async sendOrderConfirmation(orderData: {
    orderId: string
    customerName: string
    customerEmail: string
    orderDate: string
    totalAmount: string
    items: Array<{
      productName: string
      quantity: number
      unitPrice: string
    }>
    hasDownloads?: boolean
  }): Promise<EmailResult> {
    return this.provider.sendTransactional(
      'order-confirmation',
      { email: orderData.customerEmail, name: orderData.customerName },
      orderData,
      { subject: `Order Confirmation - ${orderData.orderId}` }
    )
  }

  async sendReviewRequest(orderData: {
    orderId: string
    customerName: string
    customerEmail: string
    items: Array<{
      productId: string
      productName: string
    }>
  }): Promise<EmailResult> {
    return this.provider.sendTransactional(
      'review-request',
      { email: orderData.customerEmail, name: orderData.customerName },
      orderData,
      { subject: 'How was your experience? Leave a review' }
    )
  }


  async sendAdminReviewNotification(reviewData: {
    productId: string
    productName: string
    rating: number
    title?: string
    comment?: string
    customerName: string
    customerEmail?: string
    reviewId: string
    isVerifiedPurchase?: boolean
    productStats?: any
  }): Promise<EmailResult> {
    const adminEmail = useRuntimeConfig().adminEmail || 'admin@miracute.com'

    return this.provider.sendTransactional(
      'admin-review-notification',
      { email: adminEmail, name: 'Miracute Admin' },
      reviewData,
      { subject: `New ${reviewData.rating}-star review for ${reviewData.productName}` }
    )
  }

  async sendWelcomeEmail(userData: {
    email: string
    name: string
    verificationUrl?: string
  }): Promise<EmailResult> {
    return this.provider.sendTransactional(
      'welcome',
      { email: userData.email, name: userData.name },
      userData,
      { subject: 'Welcome to Miracute!' }
    )
  }

  async sendPasswordReset(userData: {
    email: string
    name: string
    resetUrl: string
  }): Promise<EmailResult> {
    return this.provider.sendTransactional(
      'password-reset',
      { email: userData.email, name: userData.name },
      userData,
      { subject: 'Reset your password' }
    )
  }

  // Newsletter and marketing methods
  async sendNewsletter(
    templateName: string,
    recipients: EmailRecipient[],
    data: Record<string, any>
  ): Promise<EmailResult> {
    return this.provider.sendBulk(templateName, recipients, data)
  }

  async subscribeToNewsletter(
    email: string,
    name?: string,
    attributes?: Record<string, any>
  ): Promise<void> {
    if (this.provider.addToList && this.config.brevo?.listId) {
      await this.provider.addToList(
        email,
        this.config.brevo.listId,
        { FIRSTNAME: name, ...attributes }
      )
    }

    if (this.provider.updateContact) {
      await this.provider.updateContact(email, {
        FIRSTNAME: name,
        NEWSLETTER_SUBSCRIBED: true,
        SUBSCRIPTION_DATE: new Date().toISOString(),
        ...attributes
      })
    }
  }

  // Template management
  async syncAllTemplates(): Promise<void> {
    try {
      const localTemplates = await this.getLocalTemplates()

      for (const template of localTemplates) {
        await this.provider.syncTemplate(template)
      }

      console.log(`Synced ${localTemplates.length} templates to ${this.provider.name}`)
    } catch (error) {
      console.error('Failed to sync templates:', error)
      throw error
    }
  }

  async getLocalTemplates() {
    const templateManager = new (await import('./TemplateManager')).TemplateManager()
    return templateManager.getAllTemplates()
  }

  // Low-level provider access
  async sendCustomEmail(
    templateName: string,
    recipient: EmailRecipient,
    data: Record<string, any>,
    options?: { subject?: string }
  ): Promise<EmailResult> {
    return this.provider.sendTransactional(templateName, recipient, data, options)
  }

  async sendBulkEmail(
    templateName: string,
    recipients: EmailRecipient[],
    data: Record<string, any>,
    options?: { subject?: string }
  ): Promise<EmailResult> {
    return this.provider.sendBulk(templateName, recipients, data, options)
  }

  // Health and testing
  async testConnection(): Promise<boolean> {
    return this.provider.testConnection()
  }

  async sendTestEmail(recipientEmail: string): Promise<EmailResult> {
    return this.provider.sendTransactional(
      'test',
      { email: recipientEmail },
      {
        recipientEmail,
        timestamp: new Date().toISOString(),
        provider: this.provider.name
      },
      { subject: 'Test Email from Miracute' }
    )
  }

  // Email preference management
  async updateEmailPreferences(
    email: string,
    preferences: {
      newsletter?: boolean
      orderUpdates?: boolean
      reviewRequests?: boolean
      promotional?: boolean
    }
  ): Promise<void> {
    if (this.provider.updateContact) {
      const attributes = {
        NEWSLETTER_SUBSCRIBED: preferences.newsletter ?? true,
        ORDER_UPDATES: preferences.orderUpdates ?? true,
        REVIEW_REQUESTS: preferences.reviewRequests ?? true,
        PROMOTIONAL_EMAILS: preferences.promotional ?? true,
        PREFERENCES_UPDATED: new Date().toISOString()
      }

      await this.provider.updateContact(email, attributes)
    }
  }

  async getEmailPreferences(): Promise<any> {
    // Note: Brevo doesn't have a direct get contact by email method
    // This would typically require implementing a getContact method in the provider
    // For now, we'll return default preferences
    return {
      newsletter: true,
      orderUpdates: true,
      reviewRequests: true,
      promotional: true
    }
  }

  async unsubscribeFromAll(email: string): Promise<void> {
    if (this.provider.updateContact) {
      const attributes = {
        NEWSLETTER_SUBSCRIBED: false,
        ORDER_UPDATES: false,
        REVIEW_REQUESTS: false,
        PROMOTIONAL_EMAILS: false,
        UNSUBSCRIBED_ALL: true,
        UNSUBSCRIBE_DATE: new Date().toISOString()
      }

      await this.provider.updateContact(email, attributes)
    }
  }

  // Provider info
  getProviderName(): string {
    return this.provider.name
  }

  getProvider(): EmailProvider {
    return this.provider
  }

  // Switch provider (useful for failover)
  switchProvider(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig }
    if (!this.config.brevo?.apiKey) {
      throw new Error('Brevo API key is required')
    }
    this.provider = new BrevoProvider(this.config.brevo.apiKey, this.config.brevo.listId)
    console.log(`Switched to email provider: ${this.provider.name}`)
  }
}