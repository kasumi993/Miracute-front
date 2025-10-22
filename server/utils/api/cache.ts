// Simple in-memory cache for API responses
interface CacheEntry {
  data: any
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

export class ApiCache {
  static set(key: string, data: any, ttlSeconds: number = 300) {
    cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    })
  }

  static get(key: string) {
    const entry = cache.get(key)
    if (!entry) {return null}

    if (Date.now() > entry.expiresAt) {
      cache.delete(key)
      return null
    }

    return entry.data
  }

  static delete(key: string) {
    cache.delete(key)
  }

  static clear() {
    cache.clear()
  }

  static cleanup() {
    const now = Date.now()
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(key)
      }
    }
  }

  static generateKey(prefix: string, params: Record<string, any> = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `${prefix}:${sortedParams}`
  }
}

// Clean up expired cache entries every 5 minutes
setInterval(() => {
  ApiCache.cleanup()
}, 5 * 60 * 1000)
