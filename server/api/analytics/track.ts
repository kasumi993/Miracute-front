export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const body = await readBody(event)
    const { 
      event_type, 
      page_path, 
      page_title, 
      visitor_id, 
      session_id,
      user_agent,
      referrer,
      product_id
    } = body

    // Validate required fields
    if (!event_type || !visitor_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: event_type, visitor_id'
      })
    }

    const supabase = serverSupabaseClient(event)
    
    // Insert analytics event into database
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        page_path,
        page_title,
        visitor_id,
        session_id,
        user_agent,
        referrer,
        product_id,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Analytics tracking database error:', error)
      // Don't throw error - we don't want tracking failures to break the app
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    console.error('Analytics tracking error:', error)
    
    return {
      success: false,
      error: error.message
    }
  }
})