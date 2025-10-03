import * as brevo from '@getbrevo/brevo'
import { createBrevoContactsClient, sendBrevoEmail } from './brevoClient'

// Add contact to Brevo newsletter list
export async function addToBrevoNewsletter(contactData: {
  email: string
  firstName?: string
  lastName?: string
  attributes?: Record<string, any>
}) {
  try {
    const apiInstance = createBrevoContactsClient()
    const config = useRuntimeConfig()

    const createContact = new brevo.CreateContact()
    createContact.email = contactData.email

    if (contactData.firstName || contactData.lastName) {
      createContact.attributes = {
        FIRSTNAME: contactData.firstName || '',
        LASTNAME: contactData.lastName || '',
        ...contactData.attributes
      }
    }

    // Add to newsletter list if list ID is configured
    if (config.brevoListId) {
      createContact.listIds = [parseInt(config.brevoListId)]
    }

    const result = await apiInstance.createContact(createContact)

    console.log('Contact added to Brevo:', result.body)
    return { success: true, contactId: result.body.id }

  } catch (error: any) {
    // Handle case where contact already exists
    if (error.status === 400 && error.message?.includes('Contact already exist')) {
      console.log('Contact already exists in Brevo')
      return { success: true, contactId: null, message: 'Contact already exists' }
    }

    console.error('Failed to add contact to Brevo:', error)
    return { success: false, error: error.message }
  }
}