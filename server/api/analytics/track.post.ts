import { createAnalyticsTracker } from '../../utils/analyticsTracker'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Support both 'event' and 'event_type' for backwards compatibility
    const eventName = body.event || body.event_type
    
    if (!eventName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Event name is required (use "event" or "event_type" field)'
      })
    }

    // Get Supabase client
    const supabase = serverSupabaseClient(event)
    
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
        event_type: eventName,
        page_path: body.page_path || null,
        page_title: body.page_title || null,
        visitor_id: body.visitor_id || sessionId,
        session_id: sessionId,
        user_agent: body.user_agent || null,
        referrer: body.referrer || null,
        product_id: body.product_id || null,
        created_at: body.timestamp || new Date().toISOString()
      })

    if (error) {
      // If table doesn't exist yet, log the event to console for development
      console.log('Analytics event (table not ready):', {
        event_type: eventName,
        page_path: body.page_path,
        visitor_id: body.visitor_id || sessionId,
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