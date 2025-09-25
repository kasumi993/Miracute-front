import { serverSupabaseServiceRole } from '#supabase/server'

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
    const supabase = await serverSupabaseServiceRole(event)

    // Get session ID from cookies or generate new one
    let sessionId = getCookie(event, 'analytics_session')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setCookie(event, 'analytics_session', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    // Track event in analytics_events table
    try {
      const analyticsData = {
        event_type: eventName,
        url: body.url || body.page_path || null,
        page_path: body.page_path || null,
        page_title: body.page_title || null,
        visitor_id: body.visitor_id || sessionId,
        session_id: sessionId,
        user_agent: body.user_agent || null,
        referrer: body.referrer || null,
        product_id: body.product_id || null,
        created_at: body.timestamp || new Date().toISOString()
      }

      const { error } = await supabase
        .from('analytics_events')
        .insert(analyticsData)

      if (error) {
        console.error('Analytics tracking error:', error)

        // If it's a column not found error, try with minimal data
        if (error.message?.includes('column') || error.code === 'PGRST204') {
          console.log('Retrying with minimal tracking data...')

          // Retry with just essential fields
          const { error: retryError } = await supabase
            .from('analytics_events')
            .insert({
              event_type: eventName,
              created_at: new Date().toISOString()
            })

          if (retryError) {
            console.error('Retry tracking failed:', retryError)
            // Log to console for development
            console.log('Analytics event (schema issue):', {
              event_type: eventName,
              page_path: body.page_path,
              visitor_id: body.visitor_id || sessionId
            })
          }
        } else {
          // Log to console for development
          console.log('Analytics event (other error):', {
            event_type: eventName,
            page_path: body.page_path,
            visitor_id: body.visitor_id || sessionId,
            error: error.message
          })
        }
      }
    } catch (trackingError) {
      console.error('Analytics tracking exception:', trackingError)
      // Log to console for development
      console.log('Analytics event (exception):', {
        event_type: eventName,
        page_path: body.page_path,
        visitor_id: body.visitor_id || sessionId
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
