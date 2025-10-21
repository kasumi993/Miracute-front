export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  providerData?: any
}

export interface EmailTemplate {
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables?: string[]
}

export interface EmailProvider {
  name: string

  // Core email sending
  sendTransactional(
    templateName: string,
    recipient: EmailRecipient,
    data: Record<string, any>,
    options?: { subject?: string }
  ): Promise<EmailResult>

  sendBulk(
    templateName: string,
    recipients: EmailRecipient[],
    data: Record<string, any>,
    options?: { subject?: string }
  ): Promise<EmailResult>

  // Template management
  syncTemplate(template: EmailTemplate): Promise<void>
  getTemplates?(): Promise<EmailTemplate[]>

  // Marketing features
  updateContact?(email: string, attributes: Record<string, any>): Promise<void>
  addToList?(email: string, listId: string, attributes?: Record<string, any>): Promise<void>

  // Health check
  testConnection(): Promise<boolean>
}

export interface EmailConfig {
  brevo: {
    apiKey: string
    listId?: string
  }
}