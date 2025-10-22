import * as brevo from '@getbrevo/brevo'
import type {
  EmailProvider,
  EmailRecipient,
  EmailResult,
  EmailTemplate,
  AutomationTrigger
} from '../types'
import { TemplateManager } from '../TemplateManager'

export class BrevoProvider implements EmailProvider {
  readonly name = 'brevo'
  private apiClient: brevo.TransactionalEmailsApi
  private contactsClient: brevo.ContactsApi
  private templateManager: TemplateManager
  private apiKey: string
  private defaultListId?: string

  constructor(apiKey: string, defaultListId?: string) {
    this.apiKey = apiKey
    this.defaultListId = defaultListId
    this.templateManager = new TemplateManager()

    // Initialize Brevo clients
    this.apiClient = new brevo.TransactionalEmailsApi()
    this.apiClient.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey)

    this.contactsClient = new brevo.ContactsApi()
    this.contactsClient.setApiKey(brevo.ContactsApiApiKeys.apiKey, apiKey)
  }

  async sendTransactional(
    templateName: string,
    recipient: EmailRecipient,
    data: Record<string, any>,
    options?: { subject?: string }
  ): Promise<EmailResult> {
    try {
      // Render local template
      const { html, subject } = await this.templateManager.renderTemplate(templateName, data)

      const email = new brevo.SendSmtpEmail()
      email.to = [{ email: recipient.email, name: recipient.name }]
      email.subject = options?.subject || subject
      email.htmlContent = html
      email.sender = { email: 'hello@miracute.com', name: 'Miracute' }

      const result = await this.apiClient.sendTransacEmail(email)

      return {
        success: true,
        messageId: result.body?.messageId || result.response?.headers?.['message-id'],
        providerData: result.body
      }
    } catch (error: any) {
      console.error('Brevo send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email via Brevo'
      }
    }
  }

  async sendBulk(
    templateName: string,
    recipients: EmailRecipient[],
    data: Record<string, any>,
    options?: { subject?: string }
  ): Promise<EmailResult> {
    try {
      // For bulk emails, render template once and send to multiple recipients
      const { html, subject } = await this.templateManager.renderTemplate(templateName, data)

      const email = new brevo.SendSmtpEmail()
      email.to = recipients.map(r => ({ email: r.email, name: r.name }))
      email.subject = options?.subject || subject
      email.htmlContent = html
      email.sender = { email: 'hello@miracute.com', name: 'Miracute' }

      const result = await this.apiClient.sendTransacEmail(email)

      return {
        success: true,
        messageId: result.body?.messageId,
        providerData: result.body
      }
    } catch (error: any) {
      console.error('Brevo bulk send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send bulk email via Brevo'
      }
    }
  }

  async syncTemplate(template: EmailTemplate): Promise<void> {
    try {
      // Get existing templates from Brevo
      const templates = await this.apiClient.getSmtpTemplates()
      const existing = templates.body?.templates?.find(
        (t: any) => t.name === template.name
      )

      const templateData = {
        templateName: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        sender: { email: 'hello@miracute.com', name: 'Miracute' },
        isActive: true
      }

      if (existing) {
        // Update existing template
        await this.apiClient.updateSmtpTemplate(existing.id, templateData)
        console.log(`Updated Brevo template: ${template.name}`)
      } else {
        // Create new template
        await this.apiClient.createSmtpTemplate(templateData)
        console.log(`Created Brevo template: ${template.name}`)
      }
    } catch (error: any) {
      console.error(`Failed to sync template ${template.name} to Brevo:`, error)
      throw error
    }
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const result = await this.apiClient.getSmtpTemplates()

      return result.body?.templates?.map((t: any) => ({
        name: t.name,
        subject: t.subject || '',
        htmlContent: t.htmlContent || '',
        variables: [] // Brevo doesn't expose variables list
      })) || []
    } catch (error: any) {
      console.error('Failed to get Brevo templates:', error)
      return []
    }
  }

  async updateContact(email: string, attributes: Record<string, any>): Promise<void> {
    try {
      const updateContact = new brevo.UpdateContact()
      updateContact.attributes = attributes

      await this.contactsClient.updateContact(email, updateContact)
    } catch (error: any) {
      // Contact might not exist, create it
      if (error.response?.status === 404) {
        await this.createContact(email, attributes)
      } else {
        console.error('Failed to update Brevo contact:', error)
        throw error
      }
    }
  }

  async addToList(
    email: string,
    listId: string,
    attributes?: Record<string, any>
  ): Promise<void> {
    try {
      const createContact = new brevo.CreateContact()
      createContact.email = email
      createContact.listIds = [parseInt(listId)]

      if (attributes) {
        createContact.attributes = attributes
      }

      await this.contactsClient.createContact(createContact)
    } catch (error: any) {
      // Contact might already exist
      if (error.response?.status === 400 &&
          error.response?.data?.message?.includes('already exist')) {
        // Add to list if not already there
        await this.contactsClient.addContactToList(parseInt(listId), {
          emails: [email]
        })
      } else {
        console.error('Failed to add contact to Brevo list:', error)
        throw error
      }
    }
  }

  async createAutomation(trigger: AutomationTrigger): Promise<void> {
    // Note: Brevo automation creation via API is complex and may require
    // setting up workflows in the Brevo dashboard manually
    console.warn('Brevo automation creation not implemented - use Brevo dashboard')
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.apiClient.getSmtpTemplates()
      return true
    } catch (error) {
      console.error('Brevo connection test failed:', error)
      return false
    }
  }

  private async createContact(email: string, attributes: Record<string, any>): Promise<void> {
    const createContact = new brevo.CreateContact()
    createContact.email = email
    createContact.attributes = attributes

    if (this.defaultListId) {
      createContact.listIds = [parseInt(this.defaultListId)]
    }

    await this.contactsClient.createContact(createContact)
  }
}