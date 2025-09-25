import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { url, page_path, referrer, user_agent, session_id } = body

    // Get user if available
    const user = await serverSupabaseUser(event)
    const supabase = serverSupabaseServiceRole(event)

    // Track pageview in analytics table - wrapped in try-catch for safety
    try {
      // Prepare analytics data with all possible fields
      const analyticsData = {
        event_type: 'pageview',
        url: url || page_path || '',
        page_path: page_path || url || '',
        referrer: referrer || null,
        user_agent: user_agent || null,
        session_id: session_id || null,
        user_id: user?.id || null,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('analytics_events')
        .insert(analyticsData)

      if (error) {
        console.error('Error tracking pageview:', error)

        // If it's a column not found error, try with minimal data
        if (error.message?.includes('column') || error.code === 'PGRST204') {
          console.log('Retrying with minimal pageview data...')

          // Try to create a basic analytics_events table if it doesn't exist
          await ensureAnalyticsTable(supabase)

          // Retry with just essential fields
          const { error: retryError } = await supabase
            .from('analytics_events')
            .insert({
              event_type: 'pageview',
              url: url || page_path || '',
              created_at: new Date().toISOString()
            })

          if (retryError) {
            console.error('Retry also failed:', retryError)
            return { success: true, analyticsError: 'Analytics schema needs updating' }
          }
        } else {
          return { success: true, analyticsError: error.message }
        }
      }
    } catch (analyticsError) {
      console.error('Analytics database error:', analyticsError)
      return { success: true, analyticsError: 'Analytics temporarily unavailable' }
    }

    return { success: true }

  } catch (error) {
    console.error('Analytics pageview error:', error)
    return { success: false, error: 'Failed to track pageview' }
  }
})

// Helper function to ensure analytics table exists with proper schema
async function ensureAnalyticsTable(supabase: any) {
  try {
    // Check if table exists by trying to select from it
    const { error } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1)

    if (error && error.code === 'PGRST116') {
      console.log('Analytics table does not exist, please run the migration manually')
    }
  } catch (error) {
    console.error('Error checking analytics table:', error)
  }
}
