// Security middleware for API protection
export default defineEventHandler(async (event) => {
  // Skip for non-API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Security headers
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'X-XSS-Protection', '1; mode=block')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')

  // CORS headers for API
  if (event.node.req.method === 'OPTIONS') {
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
    setHeader(event, 'Access-Control-Max-Age', '3600')
    return new Response(null, { status: 204 })
  }

  // Content-Type validation for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(event.node.req.method || '')) {
    const contentType = getHeader(event, 'content-type')
    if (!contentType?.includes('application/json')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content-Type must be application/json'
      })
    }
  }

  // Basic request size limit (10MB)
  const contentLength = getHeader(event, 'content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Request too large'
    })
  }
})