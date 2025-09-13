// Currency formatting
export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {return '$0.00'}

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

// Date formatting
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj)
}

// Relative time formatting
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()

  // Convert to different units
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMinutes < 1) {return 'just now'}
  if (diffMinutes < 60) {return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`}
  if (diffHours < 24) {return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`}
  if (diffDays < 7) {return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`}
  if (diffWeeks < 4) {return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`}
  if (diffMonths < 12) {return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`}
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`
}

// Number formatting
export function formatNumber(num: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', options).format(num)
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {return '0 Bytes'}

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// Truncate text
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {return text}
  return text.slice(0, maxLength - suffix.length) + suffix
}

// Capitalize first letter
export function capitalize(str: string): string {
  if (!str) {return ''}
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Convert to title case
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  return phone
}

// Format array to readable list
export function formatArrayToList(array: string[], conjunction: string = 'and'): string {
  if (!array || array.length === 0) {return ''}
  if (array.length === 1) {return array[0]}
  if (array.length === 2) {return `${array[0]} ${conjunction} ${array[1]}`}

  return `${array.slice(0, -1).join(', ')}, ${conjunction} ${array[array.length - 1]}`
}

// Convert camelCase to human readable
export function camelCaseToHuman(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Format product rating
export function formatRating(rating: number, maxRating: number = 5): string {
  const stars = ''.repeat(Math.floor(rating)) + ''.repeat(maxRating - Math.floor(rating))
  return `${stars} ${rating.toFixed(1)}`
}

// Format order status for display
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  }

  return statusMap[status] || toTitleCase(status)
}

// Format payment status for display
export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded'
  }

  return statusMap[status] || toTitleCase(status)
}

// Format difficulty level
export function formatDifficulty(level: string): string {
  const levelMap: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  }

  return levelMap[level] || toTitleCase(level)
}

// Format template type
export function formatTemplateType(type: string): string {
  return toTitleCase(type.replace(/[-_]/g, ' '))
}

// URL slug formatting
export function formatSlugToTitle(slug: string): string {
  return toTitleCase(slug.replace(/[-_]/g, ' '))
}

// Format discount percentage
export function formatDiscount(originalPrice: number, salePrice: number): string {
  if (originalPrice <= salePrice) {return ''}
  const discount = ((originalPrice - salePrice) / originalPrice) * 100
  return `${Math.round(discount)}% off`
}
