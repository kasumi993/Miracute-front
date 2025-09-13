export default defineEventHandler(async (event) => {
  try {
    // Get the client IP address
    const forwarded = getHeader(event, 'x-forwarded-for')
    const realIp = getHeader(event, 'x-real-ip')
    const clientIP = forwarded?.split(',')[0] || realIp || getClientIP(event) || ''

    // For development/localhost, return a default country
    if (!clientIP || clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.') || clientIP.startsWith('10.')) {
      return {
        success: true,
        country: 'US', // Default to US for local development
        ip: clientIP,
        source: 'default'
      }
    }

    // Use a free IP geolocation service
    try {
      // Using ip-api.com (free service with 1000 requests per hour)
      const response = await $fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode,message`, {
        timeout: 5000
      })

      if (response.status === 'success' && response.countryCode) {
        return {
          success: true,
          country: response.countryCode,
          countryName: response.country,
          ip: clientIP,
          source: 'ip-api'
        }
      }
    } catch (apiError) {
      console.warn('IP geolocation API failed:', apiError)
    }

    // Fallback: try another free service
    try {
      // Using ipapi.co (free tier: 1000 requests per day)
      const response = await $fetch(`https://ipapi.co/${clientIP}/json/`, {
        timeout: 5000
      })

      if (response.country_code) {
        return {
          success: true,
          country: response.country_code,
          countryName: response.country_name,
          ip: clientIP,
          source: 'ipapi.co'
        }
      }
    } catch (fallbackError) {
      console.warn('Fallback IP geolocation failed:', fallbackError)
    }

    // Final fallback
    return {
      success: false,
      country: 'US', // Default fallback
      ip: clientIP,
      source: 'fallback',
      message: 'Could not determine country from IP'
    }

  } catch (error: any) {
    console.error('Geolocation error:', error)

    return {
      success: false,
      country: 'US', // Default fallback
      source: 'error',
      error: error.message
    }
  }
})
