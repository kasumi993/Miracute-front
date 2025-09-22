// Rate limiting utility for API security
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (event: any) => string
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getClientIP(event: any): string {
  return getHeader(event, 'x-forwarded-for') ||
         getHeader(event, 'x-real-ip') ||
         event.node.req.connection?.remoteAddress ||
         event.node.req.socket?.remoteAddress ||
         'unknown'
}

export function rateLimit(config: RateLimitConfig) {
  return async (event: any) => {
    const key = config.keyGenerator ? config.keyGenerator(event) : getClientIP(event)
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }

    const entry = rateLimitStore.get(key)

    if (!entry || entry.resetTime < now) {
      // New window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return true
    }

    if (entry.count >= config.maxRequests) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests'
      })
    }

    entry.count++
    return true
  }
}