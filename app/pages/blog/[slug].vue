<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Article Header -->
    <article class="bg-white">
      <!-- Hero Image -->
      <div class="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <img 
          :src="post?.image || 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=600&fit=crop&crop=center'" 
          :alt="post?.title"
          class="w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-black/20"></div>
        
        <!-- Breadcrumbs -->
        <div class="absolute top-6 left-0 right-0">
          <div class="container-custom">
            <nav class="flex items-center space-x-2 text-white text-sm">
              <NuxtLink to="/" class="hover:text-white/80">Home</NuxtLink>
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              <NuxtLink to="/blog" class="hover:text-white/80">Blog</NuxtLink>
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              <span class="text-white/80">{{ post?.title }}</span>
            </nav>
          </div>
        </div>
      </div>

      <!-- Article Content -->
      <div class="container-custom py-12">
        <div class="max-w-4xl mx-auto">
          <!-- Article Header -->
          <header class="mb-12">
            <!-- Category Badge -->
            <div class="mb-4">
              <span 
                v-if="post"
                class="px-4 py-2 rounded-full text-sm font-medium"
                :class="getCategoryBadgeClass(post.category)"
              >
                {{ post.categoryLabel }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-6 leading-tight">
              {{ post?.title || 'Blog Post Title' }}
            </h1>

            <!-- Meta Information -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-8 border-b border-gray-200">
              <div class="flex items-center space-x-6 text-gray-600">
                <!-- Author -->
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-brand-warm rounded-full flex items-center justify-center">
                    <Icon name="heroicons:user" class="w-5 h-5 text-brand-brown" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Your Template Designer</p>
                    <p class="text-sm text-gray-500">Miracute Creator</p>
                  </div>
                </div>
                
                <!-- Date & Reading Time -->
                <div class="flex items-center space-x-4 text-sm">
                  <div class="flex items-center space-x-1">
                    <Icon name="heroicons:calendar" class="w-4 h-4" />
                    <span>{{ formatDate(post?.date) }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Icon name="heroicons:clock" class="w-4 h-4" />
                    <span>{{ post?.readTime || 5 }} min read</span>
                  </div>
                </div>
              </div>

              <!-- Share Buttons -->
              <div class="flex items-center space-x-3 mt-4 sm:mt-0">
                <span class="text-sm text-gray-500">Share:</span>
                <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Icon name="heroicons:share" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <!-- Article Body -->
          <div class="prose prose-lg prose-gray max-w-none mb-12">
            <ContentRenderer :value="post" />
          </div>

          <!-- Author Bio -->
          <div class="bg-gradient-to-r from-brand-pink/10 to-brand-sage/10 rounded-2xl p-8 mb-12">
            <div class="flex items-start space-x-4">
              <div class="w-16 h-16 bg-brand-warm rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="heroicons:user" class="w-8 h-8 text-brand-brown" />
              </div>
              <div>
                <h3 class="text-lg font-heading font-semibold text-gray-900 mb-2">
                  About the Designer
                </h3>
                <p class="text-gray-600 mb-4 leading-relaxed">
                  I'm the creative mind behind every Miracute template. I believe in creating designs that feel personal and tell your unique story. When I'm not designing templates, you can find me sharing tips about Canva, wedding planning, and running a small creative business.
                </p>
                <div class="flex items-center space-x-4">
                  <NuxtLink to="/contact" class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm">
                    Get in touch →
                  </NuxtLink>
                  <NuxtLink to="/listings" class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm">
                    View templates →
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Posts -->
          <div v-if="relatedPosts.length > 0" class="mb-12">
            <h3 class="text-2xl font-heading font-semibold text-gray-900 mb-8">You Might Also Like</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article 
                v-for="relatedPost in relatedPosts" 
                :key="relatedPost._path"
                class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div class="relative">
                  <img 
                    :src="relatedPost.image" 
                    :alt="relatedPost.title"
                    class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  >
                  <div class="absolute top-3 left-3">
                    <span 
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="getCategoryBadgeClass(relatedPost.category)"
                    >
                      {{ relatedPost.categoryLabel }}
                    </span>
                  </div>
                </div>
                
                <div class="p-6">
                  <h4 class="text-lg font-heading font-semibold text-gray-900 mb-3 group-hover:text-brand-brown transition-colors line-clamp-2">
                    {{ relatedPost.title }}
                  </h4>
                  
                  <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                    {{ relatedPost.excerpt }}
                  </p>
                  
                  <NuxtLink 
                    :to="relatedPost._path"
                    class="inline-flex items-center space-x-2 text-brand-brown hover:text-brand-brown/80 font-medium text-sm"
                  >
                    <span>Read More</span>
                    <Icon name="heroicons:arrow-right" class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </article>
            </div>
          </div>

          <!-- Newsletter Signup -->
          <div class="bg-gradient-to-br from-brand-pink/20 to-brand-sage/20 rounded-2xl p-8 text-center">
            <h3 class="text-xl font-heading font-semibold text-gray-900 mb-4">
              Never Miss a Post
            </h3>
            <p class="text-gray-600 mb-6">
              Get my latest design tips and wedding inspiration delivered straight to your inbox.
            </p>
            <form @submit.prevent="subscribeNewsletter" class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                v-model="newsletterEmail"
                type="email" 
                placeholder="Your email address"
                class="form-input flex-1"
                required
              >
              <button 
                type="submit"
                class="btn-primary px-6 py-3 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
// Get route params
const route = useRoute()
const slug = route.params.slug

// Use Nuxt Content v3 to query the blog post
const { data: post, error } = await useAsyncData(`blog-${slug}`, async () => {
  try {
    const allContent = await queryCollection('content').all()
    const blogPost = allContent.find(item => item.path === `/blog/${slug}`)

    if (blogPost) {
      // Map the content structure to match expected format
      return {
        _path: blogPost.path,
        title: blogPost.title || blogPost.meta?.title,
        date: blogPost.meta?.date || blogPost.date,
        readTime: blogPost.meta?.readTime,
        category: blogPost.meta?.category,
        categoryLabel: blogPost.meta?.categoryLabel,
        excerpt: blogPost.description || blogPost.meta?.excerpt,
        image: blogPost.meta?.image,
        body: blogPost.body,
        ...blogPost
      }
    }

    return null
  } catch (err) {
    console.error('Error loading blog post:', err)
    return null
  }
})

// Handle 404 if post not found
if (error.value || !post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Blog post not found'
  })
}

// Query related posts (same category, excluding current post)
const { data: relatedPosts } = await useAsyncData(`blog-related-${slug}`, async () => {
  if (!post.value) return []

  try {
    const allContent = await queryCollection('content').all()

    const blogPosts = allContent
      .filter(item => item.path?.startsWith('/blog'))
      .filter(item => item.path !== `/blog/${slug}`)
      .filter(item => (item.meta?.category || item.category) === post.value.category)
      .slice(0, 2)
      .map(item => ({
        _path: item.path,
        title: item.title || item.meta?.title,
        date: item.meta?.date || item.date,
        readTime: item.meta?.readTime,
        category: item.meta?.category,
        categoryLabel: item.meta?.categoryLabel,
        excerpt: item.description || item.meta?.excerpt,
        image: item.meta?.image,
        ...item
      }))

    return blogPosts
  } catch (err) {
    console.error('Error loading related posts:', err)
    return []
  }
})

// State
const newsletterEmail = ref('')

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

const getCategoryBadgeClass = (category) => {
  const classes = {
    wedding: 'bg-brand-pink text-brand-brown',
    design: 'bg-brand-sage text-brand-brown',
    canva: 'bg-brand-warm text-brand-brown',
    business: 'bg-gray-100 text-gray-700'
  }
  return classes[category] || 'bg-gray-100 text-gray-700'
}

const subscribeNewsletter = () => {
  console.log('Subscribe:', newsletterEmail.value)
  newsletterEmail.value = ''
}

// SEO
useSeoMeta({
  title: () => post.value ? `${post.value.title} | Miracute Blog` : 'Blog Post | Miracute',
  description: () => post.value?.excerpt || 'Read design tips and wedding inspiration from your template designer.',
  keywords: () => post.value?.category ? `${post.value.category}, design tips, wedding inspiration, canva tutorials` : 'design blog, wedding tips',
  ogTitle: () => post.value?.title || 'Blog Post',
  ogDescription: () => post.value?.excerpt || 'Read design tips and wedding inspiration from your template designer.',
  ogImage: () => post.value?.image || '/images/og-blog.jpg'
})
</script>