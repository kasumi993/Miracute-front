export default defineNuxtPlugin(() => {
  // This plugin will make the toast globally available
  // The actual toast functionality is handled by the useToast composable
  
  if (process.client) {
    // Create a global toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div')
      toastContainer.id = 'toast-container'
      document.body.appendChild(toastContainer)
    }
  }
})