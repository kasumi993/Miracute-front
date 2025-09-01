import type { CustomerForm } from '~/components/Checkout/CustomerInformation.vue'

interface SavedCheckoutData {
  firstName: string
  lastName: string
  email: string
  country: string
  newsletter: boolean
  // Note: saveInfo is not included in saved data as it's a preference for saving
}

const STORAGE_KEY = 'miracute_saved_checkout'

export const useSavedCheckout = () => {
  // Save checkout information to localStorage
  const saveCheckoutInfo = (customerData: CustomerForm) => {
    if (!customerData.saveInfo) {
      // If user doesn't want to save info, remove any existing saved data
      clearSavedInfo()
      return
    }

    try {
      // Extract data excluding saveInfo field and card information
      const dataToSave: SavedCheckoutData = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        country: customerData.country,
        newsletter: customerData.newsletter
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
      console.log('Checkout information saved successfully')
    } catch (error) {
      console.error('Failed to save checkout information:', error)
    }
  }

  // Load saved checkout information
  const loadSavedCheckoutInfo = (): Partial<CustomerForm> | null => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (!savedData) {
        return null
      }

      const parsedData: SavedCheckoutData = JSON.parse(savedData)
      
      // Return the data with saveInfo set to true (since they previously opted in)
      return {
        ...parsedData,
        saveInfo: true
      }
    } catch (error) {
      console.error('Failed to load saved checkout information:', error)
      return null
    }
  }

  // Check if there is saved checkout information
  const hasSavedInfo = (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null
    } catch {
      return false
    }
  }

  // Clear saved checkout information
  const clearSavedInfo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('Saved checkout information cleared')
    } catch (error) {
      console.error('Failed to clear saved checkout information:', error)
    }
  }

  return {
    saveCheckoutInfo,
    loadSavedCheckoutInfo,
    hasSavedInfo,
    clearSavedInfo
  }
}