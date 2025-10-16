import { requireAdminAuthentication } from '../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)

  try {
    // Get total customers count
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get paying customers count (users with stripe_customer_id)
    const { count: payingCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('stripe_customer_id', 'is', null)

    // TODO: These will be implemented when we add newsletter and contact tables
    const newsletterSubscribers = 0
    const contactSubmissions = 0

    return {
      data: {
        totalCustomers: totalCustomers || 0,
        payingCustomers: payingCustomers || 0,
        newsletterSubscribers,
        contactSubmissions
      }
    }

  } catch (error: any) {
    console.error('Error fetching customer stats:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch customer statistics',
      data: error
    })
  }
})
