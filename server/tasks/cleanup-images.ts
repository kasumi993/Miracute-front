export default defineTask({
  meta: {
    name: 'cleanup-images',
    description: 'Clean up orphaned images from Product-images bucket that are older than 3 days'
  },
  async run() {
    console.log('Starting image cleanup task...')
    
    try {
      // Call the cleanup API endpoint
      const response = await $fetch('/api/admin/cleanup-images', {
        method: 'POST',
        baseURL: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      })
      
      console.log('Image cleanup completed:', response)
      
      return {
        result: response,
        success: true
      }
    } catch (error) {
      console.error('Image cleanup failed:', error)
      
      return {
        result: error,
        success: false
      }
    }
  }
})