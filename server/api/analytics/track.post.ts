import { createAnalyticsTracker } from '../../utils/analyticsTracker'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.event) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Event name is required'
      })
    }

    // Get Supabase client for service role (bypass RLS)
    const supabase = serverSupabaseServiceRole(event)
    
    // Create analytics tracker
    const tracker = createAnalyticsTracker(supabase)
    
    // Get session ID from cookies or generate new one
    let sessionId = getCookie(event, 'analytics_session')
    if (!sessionId) {
      const { generateSessionId } = await import('../../utils/analyticsTracker')
      sessionId = generateSessionId()
      setCookie(event, 'analytics_session', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    // For client-side events, we'll store them in a separate events table
    // This is different from page_views which are tracked server-side
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: body.event,
        properties: body.properties || {},
        user_id: body.user_id || null,
        session_id: sessionId,
        created_at: body.timestamp || new Date().toISOString()
      })

    if (error) {
      // If table doesn't exist yet, log the event to console for development
      console.log('Analytics event (table not ready):', {
        event: body.event,
        properties: body.properties,
        user_id: body.user_id,
        session_id: sessionId
      })
    }

    return {
      success: true,
      message: 'Event tracked successfully'
    }

  } catch (error: any) {
    console.error('Analytics tracking error:', error)
    
    // Don't throw errors for analytics - just log them
    return {
      success: false,
      message: 'Failed to track event'
    }
  }
})