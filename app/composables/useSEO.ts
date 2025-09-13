import type { Product, Category } from '~/types/database'

interface SEOData {
  title: string
  description: string
  keywords?: string
  image?: string
  canonical?: string
  type?: string
  articleAuthor?: string
  articleSection?: string
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
  nofollow?: boolean
}

export const useSEO = () => {
  const { $config } = useNuxtApp()
  const route = useRoute()
  const siteUrl = $config.public.siteUrl || 'https://miracute.com'

  const setSEO = (data: SEOData) => {
    const {
      title,
      description,
      keywords,
      image,
      canonical,
      type = 'website',
      articleAuthor,
      articleSection,
      publishedTime,
      modifiedTime,
      noindex = false,
      nofollow = false
    } = data

    // Construct full title
    const fullTitle = title.includes('Miracute') ? title : `${title} | Miracute`

    // Construct canonical URL
    const canonicalUrl = canonical || `${siteUrl}${route.path}`

    // Construct image URL
    const imageUrl = image?.startsWith('http') ? image : `${siteUrl}${image || '/images/og-default.jpg'}`

    // Build robots directive
    let robots = 'index,follow'
    if (noindex) {robots = robots.replace('index', 'noindex')}
    if (nofollow) {robots = robots.replace('follow', 'nofollow')}

    useSeoMeta({
      // Basic meta tags
      title: fullTitle,
      description,
      keywords,
      robots,

      // Canonical
      canonical: canonicalUrl,

      // Open Graph
      ogType: type,
      ogTitle: fullTitle,
      ogDescription: description,
      ogImage: imageUrl,
      ogImageAlt: title,
      ogUrl: canonicalUrl,
      ogSiteName: 'Miracute - Professional Website Templates',

      // Twitter Card
      twitterCard: 'summary_large_image',
      twitterTitle: fullTitle,
      twitterDescription: description,
      twitterImage: imageUrl,
      twitterSite: '@miracute_templates',
      twitterCreator: '@miracute_templates',

      // Article meta (for blog posts)
      ...(articleAuthor && { articleAuthor }),
      ...(articleSection && { articleSection }),
      ...(publishedTime && { articlePublishedTime: publishedTime }),
      ...(modifiedTime && { articleModifiedTime: modifiedTime }),

      // Additional SEO
      'theme-color': '#8B7355', // Brand sage color
      'msapplication-TileColor': '#8B7355',
      'application-name': 'Miracute',
      'apple-mobile-web-app-title': 'Miracute',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default'
    })

    // Set HTML lang attribute
    useHead({
      htmlAttrs: {
        lang: 'en'
      }
    })
  }

  // Product SEO
  const setProductSEO = (product: Product, category?: Category | null) => {
    const price = parseFloat(product.price)
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)

    const categoryName = category?.name || 'Template'
    const title = product.seo_title || `${product.name} - ${categoryName} Template`
    const description = product.seo_description ||
      `Download ${product.name}, a professional ${categoryName.toLowerCase()} template. ${product.short_description || ''} Starting at ${formattedPrice}.`

    const keywords = [
      ...(product.meta_keywords || []),
      product.name.toLowerCase(),
      `${categoryName.toLowerCase()} template`,
      'website template',
      'digital download',
      'canva template',
      ...(product.tags || [])
    ].join(', ')

    setSEO({
      title,
      description,
      keywords,
      image: product.preview_images?.[0] || '/images/og-template.jpg',
      type: 'product',
      canonical: `/templates/${product.slug}`
    })
  }

  // Category SEO
  const setCategorySEO = (category: Category, productsCount?: number) => {
    const title = category.seo_title || `${category.name} Templates - Professional Designs`
    const description = category.seo_description ||
      `Browse our collection of ${category.name.toLowerCase()} templates. ${category.description || ''} ${productsCount ? `${productsCount} professional designs available.` : ''}`

    const keywords = [
      `${category.name.toLowerCase()} templates`,
      'website templates',
      'professional design',
      'digital templates',
      'canva templates',
      category.name.toLowerCase(),
      'template marketplace'
    ].join(', ')

    setSEO({
      title,
      description,
      keywords,
      image: category.image_url || '/images/og-category.jpg',
      canonical: `/categories/${category.slug}`
    })
  }

  // Blog post SEO
  const setBlogSEO = (post: {
    title: string
    excerpt: string
    image?: string
    author?: string
    publishedAt: string
    updatedAt?: string
    category?: string
    tags?: string[]
  }) => {
    setSEO({
      title: `${post.title} - Miracute Blog`,
      description: post.excerpt,
      keywords: [
        ...(post.tags || []),
        'web design',
        'templates',
        'design tips',
        'miracute blog'
      ].join(', '),
      image: post.image,
      type: 'article',
      articleAuthor: post.author || 'Miracute Team',
      articleSection: post.category || 'Design',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      canonical: `/blog/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    })
  }

  // Homepage SEO
  const setHomepageSEO = () => {
    setSEO({
      title: 'Miracute - Professional Website Templates & Digital Designs',
      description: 'Download beautiful, professional website templates for businesses, weddings, portfolios & more. Easy to customize Canva templates. Mobile-responsive designs. Instant download.',
      keywords: 'website templates, canva templates, business templates, wedding websites, portfolio templates, professional design, digital templates, template marketplace',
      image: '/images/og-homepage.jpg',
      canonical: '/'
    })
  }

  // Templates page SEO
  const setTemplatesSEO = (filters?: { category?: string, search?: string, total?: number }) => {
    let title = 'Professional Website Templates'
    let description = 'Browse our complete collection of professional website templates. Perfect for businesses, weddings, portfolios, and creative projects.'

    if (filters?.category) {
      title = `${filters.category} Templates`
      description = `Professional ${filters.category.toLowerCase()} templates for your business.`
    }

    if (filters?.search) {
      title = `${filters.search} Templates - Search Results`
      description = `Search results for "${filters.search}". Find the perfect template for your project.`
    }

    if (filters?.total) {
      description += ` ${filters.total} templates available.`
    }

    setSEO({
      title,
      description,
      keywords: 'website templates, professional design, business templates, portfolio templates, wedding templates, canva templates',
      image: '/images/og-templates.jpg',
      canonical: '/templates'
    })
  }

  return {
    setSEO,
    setProductSEO,
    setCategorySEO,
    setBlogSEO,
    setHomepageSEO,
    setTemplatesSEO
  }
}
