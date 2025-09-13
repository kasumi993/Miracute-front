import { serverSupabaseServiceRole } from '#supabase/server'
import { generateSessionId } from '../utils/analyticsTracker'
import type { Database } from '~/types/database'

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
    // Get Supabase service role client to bypass RLS for analytics
    const supabase = serverSupabaseServiceRole<Database>(event)

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

    // Get visitor ID (use session for visitor tracking)
    const visitorId = sessionId

    // Extract request data
    const userAgent = event.node.req.headers?.['user-agent'] || ''
    const referrer = event.node.req.headers?.referer || event.node.req.headers?.referrer || ''

    // Track the page view directly to analytics_events table
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'page_view',
        page_path: path,
        page_title: path, // We'll extract real titles on the client side if needed
        visitor_id: visitorId,
        session_id: sessionId,
        user_agent: userAgent,
        referrer,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Analytics tracking failed:', error)
    }

  } catch (error) {
    // Log error but don't interrupt the request
    console.error('Analytics middleware error:', error)
  }
})
