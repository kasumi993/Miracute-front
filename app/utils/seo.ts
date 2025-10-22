import type { Product, Category } from '@/types/database'

// Text truncation utility
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// SEO constants
export const SEO_CONFIG = {
  siteName: 'Miracute',
  siteUrl: 'https://miracute.com',
  defaultTitle: 'Miracute - Professional Website Templates & Digital Designs',
  defaultDescription: 'Download beautiful, professional website templates for businesses, weddings, portfolios & more. Easy to customize Canva templates. Mobile-responsive designs. Instant download.',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@miracute_templates',
  themeColor: '#8B7355',
  locale: 'en_US',
  maxTitleLength: 60,
  maxDescriptionLength: 160
}

// Generate structured data for products
export function generateProductStructuredData(product: Product, category?: Category | null) {
  const price = parseFloat(product.price)
  const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description || '',
    image: product.preview_images || [],
    brand: {
      '@type': 'Brand',
      name: 'Miracute'
    },
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: 'USD',
      availability: product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Miracute'
      },
      ...(comparePrice && comparePrice > price && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: comparePrice.toString(),
          priceCurrency: 'USD',
          name: 'Compare at price'
        }
      })
    },
    category: category?.name || 'Digital Template',
    sku: product.id,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: product.download_count > 0 ? Math.floor(product.download_count / 10) : 5
    },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: 'Verified Customer'
      },
      reviewBody: 'High quality template, easy to customize and very professional looking.'
    }
  }
}

// Generate structured data for categories
export function generateCategoryStructuredData(category: Category, productsCount?: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Templates`,
    description: category.description || `Professional ${category.name.toLowerCase()} templates`,
    url: `${SEO_CONFIG.siteUrl}/categories/${category.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl
    },
    ...(productsCount && {
      numberOfItems: productsCount
    })
  }
}

// Generate structured data for organization
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Miracute',
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/images/logo.svg`,
    description: 'Professional website templates and digital designs marketplace',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@miracute.com',
      contactType: 'Customer Service',
      availableLanguage: 'English'
    },
    sameAs: [
      'https://twitter.com/miracute_templates',
      'https://instagram.com/miracute_templates',
      'https://pinterest.com/miracute_templates'
    ],
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    }
  }
}

// Generate structured data for website
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: 'Miracute'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SEO_CONFIG.siteUrl}/listings?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SEO_CONFIG.siteUrl}${item.url}`
    }))
  }
}

// Generate FAQ structured data
export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}


export function generateTitle(title: string, includeBase = true): string {
  const truncated = truncateText(title, SEO_CONFIG.maxTitleLength - (includeBase ? 12 : 0)) // Account for " | Miracute"
  return includeBase && !title.includes('Miracute') ? `${truncated} | Miracute` : truncated
}

export function generateDescription(description: string): string {
  return truncateText(description, SEO_CONFIG.maxDescriptionLength)
}

export function generateKeywords(keywords: string[]): string {
  return keywords.slice(0, 10).join(', ') // Max 10 keywords
}

// Price formatting
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numPrice)
}

// Template category mappings for SEO
export const CATEGORY_SEO_MAP = {
  'business': {
    title: 'Professional Business Website Templates',
    description: 'Professional business website templates perfect for companies, startups, and entrepreneurs. Modern, responsive designs that convert visitors into customers.',
    keywords: ['business website templates', 'professional business templates', 'corporate website design', 'business website builder']
  },
  'wedding': {
    title: 'Beautiful Wedding Website Templates',
    description: 'Elegant wedding website templates to celebrate your special day. Share your love story, manage RSVPs, and create unforgettable memories.',
    keywords: ['wedding website templates', 'wedding invitation templates', 'bride website', 'wedding planning templates']
  },
  'portfolio': {
    title: 'Creative Portfolio Website Templates',
    description: 'Showcase your work with stunning portfolio templates. Perfect for photographers, designers, artists, and creative professionals.',
    keywords: ['portfolio website templates', 'creative portfolio', 'photographer templates', 'designer portfolio']
  },
  'restaurant': {
    title: 'Restaurant & Food Website Templates',
    description: 'Delicious restaurant website templates with online ordering, menu displays, and reservation systems. Perfect for cafes, restaurants, and food businesses.',
    keywords: ['restaurant website templates', 'food website design', 'cafe templates', 'menu templates']
  },
  'health': {
    title: 'Health & Wellness Website Templates',
    description: 'Professional healthcare and wellness website templates for therapists, doctors, fitness instructors, and wellness professionals.',
    keywords: ['healthcare templates', 'therapist website', 'wellness templates', 'medical website design']
  }
}

export function getCategorySEO(categorySlug: string) {
  return CATEGORY_SEO_MAP[categorySlug as keyof typeof CATEGORY_SEO_MAP] || {
    title: 'Professional Website Templates',
    description: 'High-quality website templates for your business.',
    keywords: ['website templates', 'professional design']
  }
}
