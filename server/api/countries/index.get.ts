export default defineEventHandler(async () => {
  try {
    // Use REST Countries API - a free, reliable API for country data
    const response = await $fetch('https://restcountries.com/v3.1/all?fields=name,cca2', {
      timeout: 10000 // 10 second timeout
    })

    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid response from countries API')
    }

    // Transform the data to a format suitable for select options
    const countries = response
      .map((country: any) => ({
        value: country.cca2, // ISO 2-letter country code (e.g., 'US', 'CA')
        label: country.name.common // Common country name (e.g., 'United States', 'Canada')
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically by name

    // Add empty option at the beginning
    const countryOptions = [
      { value: '', label: 'Select a country' },
      ...countries
    ]

    return {
      success: true,
      data: countryOptions,
      message: `${countries.length} countries loaded successfully`
    }

  } catch (error: any) {
    console.error('Error fetching countries:', error)

    // Fallback to basic list if API fails
    const fallbackCountries = [
      { value: '', label: 'Select a country' },
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'GB', label: 'United Kingdom' },
      { value: 'AU', label: 'Australia' },
      { value: 'DE', label: 'Germany' },
      { value: 'FR', label: 'France' },
      { value: 'ES', label: 'Spain' },
      { value: 'IT', label: 'Italy' },
      { value: 'NL', label: 'Netherlands' },
      { value: 'JP', label: 'Japan' },
      { value: 'KR', label: 'South Korea' },
      { value: 'BR', label: 'Brazil' },
      { value: 'MX', label: 'Mexico' },
      { value: 'IN', label: 'India' },
      { value: 'CN', label: 'China' }
    ]

    return {
      success: false,
      data: fallbackCountries,
      error: error.message || 'Failed to fetch countries',
      message: 'Using fallback country list'
    }
  }
})