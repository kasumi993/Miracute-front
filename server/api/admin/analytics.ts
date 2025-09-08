export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { period = 'today', from, to } = query
    
    const supabase = serverSupabaseClient(event)
    
    // Calculate date range based on period
    let startDate, endDate
    const now = new Date()
    
    if (from && to) {
      startDate = new Date(from as string)
      endDate = new Date(to as string)
      endDate.setHours(23, 59, 59, 999) // End of day
    } else {
      switch (period) {
        case 'today':
          startDate = new Date(now)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          endDate = new Date(now)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          endDate = new Date(now)
          break
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          endDate = new Date(now)
          break
        default:
          startDate = new Date(now)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
      }
    }
    
    // Get analytics data from database
    const { data: analyticsData, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
    
    if (error) {
      console.error('Analytics query error:', error)
      throw error
    }
    
    // Calculate previous period for comparison
    const periodDiff = endDate.getTime() - startDate.getTime()
    const prevStartDate = new Date(startDate.getTime() - periodDiff)
    const prevEndDate = new Date(startDate.getTime() - 1)
    
    const { data: prevAnalyticsData } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', prevStartDate.toISOString())
      .lte('created_at', prevEndDate.toISOString())
    
    // Process analytics data
    const events = analyticsData || []
    const prevEvents = prevAnalyticsData || []
    
    // Calculate metrics
    const visitors = new Set(events.filter(e => e.event_type === 'page_view').map(e => e.visitor_id)).size
    const prevVisitors = new Set(prevEvents.filter(e => e.event_type === 'page_view').map(e => e.visitor_id)).size
    const visitorsChange = prevVisitors > 0 ? ((visitors - prevVisitors) / prevVisitors) * 100 : 0
    
    const pageViews = events.filter(e => e.event_type === 'page_view').length
    const prevPageViews = prevEvents.filter(e => e.event_type === 'page_view').length
    const pageViewsChange = prevPageViews > 0 ? ((pageViews - prevPageViews) / prevPageViews) * 100 : 0
    
    const productViews = events.filter(e => 
      e.event_type === 'page_view' && 
      (e.page_path?.includes('/products/') || e.event_type === 'product_view')
    ).length
    
    const addToCarts = events.filter(e => e.event_type === 'add_to_cart').length
    
    // Get top pages
    const pageViewEvents = events.filter(e => e.event_type === 'page_view')
    const pageStats = {}
    
    pageViewEvents.forEach(event => {
      const path = event.page_path
      if (!pageStats[path]) {
        pageStats[path] = {
          path,
          title: event.page_title || path,
          views: 0
        }
      }
      pageStats[path].views++
    })
    
    const topPages = Object.values(pageStats)
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10)
    
    return {
      success: true,
      data: {
        visitors,
        visitorsChange: Math.round(visitorsChange),
        pageViews,
        pageViewsChange: Math.round(pageViewsChange),
        productViews,
        addToCarts,
        topPages
      }
    }
    
  } catch (error) {
    console.error('Analytics API error:', error)
    
    // Return empty data if there's an error
    return {
      success: true,
      data: {
        visitors: 0,
        visitorsChange: 0,
        pageViews: 0,
        pageViewsChange: 0,
        productViews: 0,
        addToCarts: 0,
        topPages: []
      }
    }
  }
})