export const useRecentlyViewed = () => {
  const STORAGE_KEY = 'miracute_recently_viewed'
  const MAX_ITEMS = 4

  // Get recently viewed templates from localStorage
  const getRecentlyViewed = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Error reading recently viewed:', error)
        return []
      }
    }
    return []
  }

  // Add a template to recently viewed
  const addToRecentlyViewed = (template: any) => {
    if (process.client && template) {
      try {
        let recentlyViewed = getRecentlyViewed()

        // Remove if already exists to avoid duplicates
        recentlyViewed = recentlyViewed.filter((item: any) => item.id !== template.id)

        // Add to beginning
        recentlyViewed.unshift({
          id: template.id,
          title: template.title,
          slug: template.slug,
          image: template.image,
          price: template.price,
          category: template.category,
          viewedAt: new Date().toISOString()
        })

        // Keep only the most recent items
        recentlyViewed = recentlyViewed.slice(0, MAX_ITEMS)

        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed))
      } catch (error) {
        console.error('Error saving recently viewed:', error)
      }
    }
  }

  // Clear recently viewed
  const clearRecentlyViewed = () => {
    if (process.client) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error clearing recently viewed:', error)
      }
    }
  }

  return {
    getRecentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  }
}