import { createAnalyticsTracker, extractRequestData, generateSessionId } from '~/server/utils/analyticsTracker'

/**
 * Analytics middleware to track page views automatically
 * This runs on every server request
 */
export default defineEventHandler(async (event) => {
  // Only track GET requests to avoid duplicates on form submissions
  if (event.node.req.method !== 'GET') {
    return
  }

  // Skip API routes, assets, and static files
  const url = getRequestURL(event)
  const path = url.pathname

  const skipPaths = [
    '/api/',
    '/_nuxt/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/',
    '/manifest.json'
  ]

  const shouldSkip = skipPaths.some(skipPath => path.startsWith(skipPath)) ||
                    path.includes('.') && !path.endsWith('.html') // Skip file extensions except HTML

  if (shouldSkip) {
    return
  }

  try {
    // Get Supabase client for service role (bypass RLS)
    const supabase = serverSupabaseServiceRole(event)
    
    // Create analytics tracker
    const tracker = createAnalyticsTracker(supabase)
    
    // Extract request data
    const requestData = extractRequestData(event.node.req)
    
    // Get session ID from cookies or generate new one
    let sessionId = getCookie(event, 'analytics_session')
    if (!sessionId) {
      sessionId = generateSessionId()
      setCookie(event, 'analytics_session', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    // Get user ID if authenticated
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || undefined

    // Track the page view (async, don't wait for completion)
    tracker.trackPageView({
      path,
      user_id: userId,
      session_id: sessionId,
      user_agent: requestData.user_agent,
      referrer: requestData.referrer,
      ip_address: requestData.ip_address
    }).catch(error => {
      // Log error but don't interrupt the request
      console.error('Analytics tracking failed:', error)
    })

  } catch (error) {
    // Log error but don't interrupt the request
    console.error('Analytics middleware error:', error)
  }
})