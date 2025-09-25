import { requireAdminAuthentication } from '../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { supabase } = await requireAdminAuthentication(event)

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      brevoApiKey: !!config.brevoApiKey ? 'Configured' : 'Missing',
      stripeWebhookSecret: !!config.stripeWebhookSecret ? 'Configured' : 'Missing',
      stripeSecretKey: !!config.stripeSecretKey ? 'Configured' : 'Missing',
      siteUrl: config.public.siteUrl || 'Not configured'
    },
    database: {
      recentOrders: null as any,
      paidOrdersCount: 0,
      completedOrdersCount: 0
    },
    emailTest: null as any,
    webhookTest: null as any,
    recommendations: [] as string[]
  }

  try {
    // Check recent orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        payment_status,
        customer_email,
        total_amount,
        stripe_payment_intent_id
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (ordersError) {
      diagnostics.database.recentOrders = { error: ordersError.message }
    } else {
      diagnostics.database.recentOrders = orders || []
      diagnostics.database.paidOrdersCount = orders?.filter(o => o.payment_status === 'paid').length || 0
      diagnostics.database.completedOrdersCount = orders?.filter(o => o.status === 'completed').length || 0
    }

    // Test email sending capability
    try {
      const brevo = await import('@getbrevo/brevo')
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

      const testEmail = new brevo.SendSmtpEmail()
      testEmail.to = [{ email: 'hello@miracute.com', name: 'Diagnostic Test' }]
      testEmail.subject = `[DIAGNOSTIC] Email System Test - ${  new Date().toISOString()}`
      testEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email System Diagnostic</h2>
          <p>This is a diagnostic email sent at: ${new Date().toISOString()}</p>
          <p>If you receive this email, the basic email sending is working.</p>
          <h3>Configuration Status:</h3>
          <ul>
            <li>Brevo API Key: ${!!config.brevoApiKey ? '✅ Configured' : '❌ Missing'}</li>
            <li>Site URL: ${config.public.siteUrl || 'Not configured'}</li>
          </ul>
        </div>
      `
      testEmail.sender = { email: 'hello@miracute.com', name: 'Miracute Diagnostics' }

      const result = await apiInstance.sendTransacEmail(testEmail)
      diagnostics.emailTest = {
        success: true,
        messageId: result.body.messageId,
        sentAt: new Date().toISOString()
      }
    } catch (emailError: any) {
      diagnostics.emailTest = {
        success: false,
        error: emailError.message,
        errorDetails: emailError.body || emailError
      }
    }

    // Analyze potential issues and provide recommendations
    if (!config.brevoApiKey) {
      diagnostics.recommendations.push('❌ BREVO_API_KEY is not configured in environment variables')
    }

    if (!config.stripeWebhookSecret) {
      diagnostics.recommendations.push('❌ STRIPE_WEBHOOK_SECRET is not configured - webhooks won\'t work')
    }

    if (diagnostics.database.paidOrdersCount === 0) {
      diagnostics.recommendations.push('⚠️  No paid orders found - webhook might not be triggering or orders not processing')
    }

    if (diagnostics.emailTest && !diagnostics.emailTest.success) {
      if (diagnostics.emailTest.error?.includes('401') || diagnostics.emailTest.error?.includes('Unauthorized')) {
        diagnostics.recommendations.push('❌ Brevo API key is invalid or expired')
      } else if (diagnostics.emailTest.error?.includes('sender')) {
        diagnostics.recommendations.push('❌ Sender email (hello@miracute.com) is not verified in Brevo')
      } else {
        diagnostics.recommendations.push(`❌ Email sending failed: ${  diagnostics.emailTest.error}`)
      }
    } else if (diagnostics.emailTest?.success) {
      diagnostics.recommendations.push('✅ Basic email sending is working')
    }

    // Check for webhook configuration
    if (config.stripeWebhookSecret && diagnostics.database.paidOrdersCount > 0) {
      diagnostics.recommendations.push('✅ Stripe webhook appears to be configured (paid orders exist)')

      // Check if recent orders have email-related issues
      const recentPaidOrders = diagnostics.database.recentOrders?.filter((o: any) =>
        o.payment_status === 'paid' &&
        new Date(o.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      ) || []

      if (recentPaidOrders.length > 0) {
        diagnostics.recommendations.push(`ℹ️  Found ${recentPaidOrders.length} paid order(s) in the last 24 hours - check if emails were sent for these`)
      }
    }

    // Domain verification reminder
    diagnostics.recommendations.push('💡 Ensure hello@miracute.com domain is verified in your Brevo account')
    diagnostics.recommendations.push('💡 Check spam folders if emails are being sent but not received')
    diagnostics.recommendations.push('💡 Verify Stripe webhook endpoint is set to: https://yourdomain.com/api/payments/webhook')

    return {
      success: true,
      diagnostics
    }

  } catch (error: any) {
    console.error('Diagnostic error:', error)
    return {
      success: false,
      error: error.message,
      diagnostics
    }
  }
})
