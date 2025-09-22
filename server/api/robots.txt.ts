export default defineEventHandler(async (event) => {
  const siteUrl = 'https://miracute.com'

  const robots = `User-agent: *
Allow: /

# Allow important pages
Allow: /templates
Allow: /categories
Allow: /about
Allow: /contact
Allow: /help
Allow: /blog

# Disallow admin and private areas
Disallow: /dashboard
Disallow: /admin
Disallow: /account
Disallow: /auth
Disallow: /api
Disallow: /_nuxt
Disallow: /.nuxt

# Disallow checkout and cart pages (private)
Disallow: /cart
Disallow: /checkout
Disallow: /checkout/success

# Allow specific file types
Allow: *.css
Allow: *.js
Allow: *.png
Allow: *.jpg
Allow: *.jpeg
Allow: *.gif
Allow: *.svg
Allow: *.webp
Allow: *.pdf

# Crawl delay
Crawl-delay: 1

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml`

  // Set plain text content type
  setHeader(event, 'content-type', 'text/plain')
  setHeader(event, 'cache-control', 'public, max-age=86400') // Cache for 24 hours

  return robots
})
