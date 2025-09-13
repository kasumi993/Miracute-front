import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const siteUrl = 'https://miracute.com'

  try {
    // Fetch active products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    // Fetch active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'weekly' },
      { url: 'templates', priority: '0.9', changefreq: 'daily' },
      { url: 'categories', priority: '0.8', changefreq: 'weekly' },
      { url: 'about', priority: '0.7', changefreq: 'monthly' },
      { url: 'contact', priority: '0.6', changefreq: 'monthly' },
      { url: 'help', priority: '0.6', changefreq: 'monthly' },
      { url: 'licenses', priority: '0.6', changefreq: 'yearly' },
      { url: 'privacy', priority: '0.5', changefreq: 'yearly' },
      { url: 'terms', priority: '0.5', changefreq: 'yearly' },
      { url: 'refunds', priority: '0.5', changefreq: 'yearly' }
    ]

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${siteUrl}${page.url ? `/${page.url}` : ''}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${categories?.map(category => `
  <url>
    <loc>${siteUrl}/categories/${category.slug}</loc>
    <lastmod>${category.updated_at.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('') || ''}
  ${products?.map(product => `
  <url>
    <loc>${siteUrl}/templates/${product.slug}</loc>
    <lastmod>${product.updated_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
</urlset>`

    // Set XML content type
    event.node.res.setHeader('content-type', 'application/xml')
    event.node.res.setHeader('cache-control', 'public, max-age=3600') // Cache for 1 hour

    return sitemap

  } catch (error) {
    console.error('Error generating sitemap:', error)
    throw new Error('Failed to generate sitemap')
  }
})
