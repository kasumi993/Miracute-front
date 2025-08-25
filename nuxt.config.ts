// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // CSS Framework
  css: ['~/assets/css/main.css'],
  
  // Modules for SEO, Performance, and Functionality
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  // Supabase Configuration
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/']
    }
  },

  // SEO Configuration
  site: {
    url: 'https://miracute.com',
    name: 'Miracute',
    description: 'Beautiful Human-crafted Canva Free website templates for weddings, therapists, and creative businesses. Thoughtfully designed templates that work without Canva Pro. Passion-driven design, not AI-generated.',
    defaultLocale: 'en',
    keywords: 'human crafted templates,canva templates, wedding website templates, therapist website templates, canva free templates, website templates, business templates, creative templates',
    author: 'Miracute',
  },

  // SEO Module Configuration
  seo: {
    meta: {
      themeColor: '#F4F1ED'
    }
  },

  // Image Optimization
  image: {
    quality: 85,
    format: ['webp', 'avif', 'png', 'jpg'],
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      '2xl': 1536,
    }
  },

  // Sitemap Configuration
  sitemap: {
    hostname: 'https://miracute.com',
    gzip: true,
    routes: async () => {
      // Dynamic routes will be added here for products
      return []
    }
  },

  // Robots.txt Configuration
  robots: {
    UserAgent: '*',
    Allow: '/',
    Disallow: ['/admin', '/auth'],
    Sitemap: 'https://miracute.com/sitemap.xml'
  },

  // Runtime Configuration
  runtimeConfig: {
    // Private keys (server-side only)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    
    // Public keys (exposed to client)
    public: {
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://miracute.com'
    }
  },

  // App Configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'en'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
      ]
    }
  },

  // Tailwind Configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css'
  },

  // Build Configuration
  build: {
    transpile: ['@headlessui/vue']
  },

  // Nitro Configuration for Vercel
  nitro: {
    preset: 'vercel',
    prerender: {
      routes: ['/sitemap.xml']
    }
  }
})