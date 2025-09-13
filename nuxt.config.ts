export default defineNuxtConfig({
  srcDir: 'app/',
  devtools: { enabled: true },
  pages: true,
  css: ['~/assets/css/main.css'],

  // Reduce file watchers to prevent EMFILE errors
  vite: {
    server: {
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.nuxt/**', '**/.output/**', '**/.vercel/**']
      }
    }
  },

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  supabase: {
    redirectOptions: {
      login: false,
      callback: '/auth/callback',
      exclude: ['/*']
    }
  },

  image: {
    quality: 85,
    format: ['webp', 'avif', 'png', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  },

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    brevoApiKey: process.env.BREVO_API_KEY,
    brevoListId: process.env.BREVO_LIST_ID,
    public: {
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://miracute.com'
    }
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        // Basic SEO
        { name: 'robots', content: 'index,follow' },
        { name: 'googlebot', content: 'index,follow' },
        { name: 'author', content: 'Miracute Team' },
        { name: 'generator', content: 'Nuxt.js' },

        // Theme and app info
        { name: 'theme-color', content: '#8B7355' },
        { name: 'msapplication-TileColor', content: '#8B7355' },
        { name: 'application-name', content: 'Miracute' },

        // Apple mobile web app
        { name: 'apple-mobile-web-app-title', content: 'Miracute' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },

        // Security
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        // Favicon and icons
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },

        // Fonts (preload for performance)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },

        // DNS prefetch for external domains
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: '//www.google-analytics.com' },

        // Canonical (will be overridden by pages)
        { rel: 'canonical', href: 'https://miracute.com' }
      ]
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css'
  },

  build: {
    transpile: ['@headlessui/vue']
  },

  nitro: {
    preset: 'vercel'
  }
})
