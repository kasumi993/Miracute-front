export interface Country {
  name: string
  code: string
  flag?: string
}

const countriesCache = ref<Country[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export const useCountries = () => {
  const fetchCountries = async (): Promise<Country[]> => {
    if (countriesCache.value.length > 0) {
      return countriesCache.value
    }

    isLoading.value = true
    error.value = null

    try {
      // Using REST Countries API for country data
      const response = await $fetch<any[]>('https://restcountries.com/v3.1/all?fields=name,cca2,flag')

      const countries: Country[] = response
        .map(country => ({
          name: country.name.common,
          code: country.cca2,
          flag: country.flag
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      countriesCache.value = countries
      return countries
    } catch (err) {
      console.error('Failed to fetch countries:', err)
      error.value = 'Failed to load countries'

      // Fallback to common countries if API fails
      const fallbackCountries: Country[] = [
        { name: 'United States', code: 'US' },
        { name: 'Canada', code: 'CA' },
        { name: 'United Kingdom', code: 'GB' },
        { name: 'Australia', code: 'AU' },
        { name: 'Germany', code: 'DE' },
        { name: 'France', code: 'FR' },
        { name: 'Netherlands', code: 'NL' },
        { name: 'Sweden', code: 'SE' },
        { name: 'Norway', code: 'NO' },
        { name: 'Denmark', code: 'DK' }
      ].sort((a, b) => a.name.localeCompare(b.name))

      countriesCache.value = fallbackCountries
      return fallbackCountries
    } finally {
      isLoading.value = false
    }
  }

  return {
    countries: readonly(countriesCache),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchCountries
  }
}
