<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-16">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl sm:text-5xl font-heading font-medium text-gray-900 mb-6">
            Design Stories & Tips
          </h1>
          <p class="text-xl text-gray-600 mb-4">
            Behind-the-scenes thoughts on design, wedding planning tips, and personal stories from your template designer.
          </p>
          <div class="flex items-center justify-center space-x-2 text-brand-brown">
            <Icon name="heroicons:heart" class="w-5 h-5" />
            <span class="font-medium">Written with love, just like my templates</span>
          </div>
        </div>
      </div>
    </section>

    <div class="container-custom py-16">
      <!-- Featured Post -->
      <div v-if="featuredPost" class="mb-16">
        <h2 class="text-2xl font-heading font-medium text-gray-900 mb-8">Featured Post</h2>
        <NuxtLink :to="featuredPost._path" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block">
          <div class="md:flex">
            <div class="md:w-1/2 relative">
              <!-- Always show the placeholder div, then show image on top if it loads successfully -->
              <div class="w-full h-64 md:h-full bg-gradient-to-br from-brand-pink/20 to-brand-sage/20 flex items-center justify-center">
                <div class="text-center text-gray-500">
                  <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">Blog Image</p>
                </div>
              </div>
              <img
                v-if="featuredPost.image"
                :src="featuredPost.image"
                :alt="featuredPost.title"
                class="absolute inset-0 w-full h-full object-cover"
                :class="{ 'opacity-0': featuredImageError }"
                @error="handleImageError"
                @load="handleImageLoad"
              >
            </div>
            <div class="md:w-1/2 p-8">
              <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Icon name="heroicons:calendar" class="w-4 h-4" />
                <span>{{ formatDate(featuredPost.date) }}</span>
                <span>•</span>
                <span>{{ featuredPost.readTime }} min read</span>
              </div>
              <h3 class="text-2xl font-heading font-semibold text-gray-900 mb-4">
                {{ featuredPost.title }}
              </h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                {{ featuredPost.excerpt }}
              </p>
              <div class="inline-flex items-center space-x-2 bg-brand-brown text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-brown/90 transition-colors">
                <span>Read More</span>
                <Icon name="heroicons:arrow-right" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Blog Posts Grid -->
      <div>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-heading font-medium text-gray-900">Recent Posts</h2>
          <div class="flex items-center space-x-4">
            <!-- Category Filter -->
            <select 
              v-model="selectedCategory"
              class="form-input text-sm border-gray-300 rounded-lg focus:ring-brand-sage"
            >
              <option value="">All Topics</option>
              <option value="wedding">Wedding Tips</option>
              <option value="design">Design Stories</option>
              <option value="canva">Canva Help</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink 
            v-for="post in filteredPosts" 
            :key="post._path"
            :to="post._path"
            class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer block"
          >
            <div class="relative overflow-hidden h-48">
              <!-- Always show the placeholder div first -->
              <div class="absolute inset-0 w-full h-full bg-gradient-to-br from-brand-pink/20 to-brand-sage/20 flex items-center justify-center">
                <div class="text-center text-gray-500">
                  <Icon name="heroicons:photo" class="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p class="text-xs">Blog Image</p>
                </div>
              </div>
              <!-- Then overlay the image if it exists and loads successfully -->
              <img
                v-if="post.image"
                :src="post.image"
                :alt="post.title"
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10"
                :class="{ 'opacity-0': postImageErrors[post._path] }"
                @error="(e) => handlePostImageError(e, post._path)"
              >
              <div class="absolute top-3 left-3 z-20">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getCategoryBadgeClass(post.category)"
                >
                  {{ post.categoryLabel }}
                </span>
              </div>
            </div>
            
            <div class="p-6">
              <div class="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                <Icon name="heroicons:calendar" class="w-4 h-4" />
                <span>{{ formatDate(post.date) }}</span>
                <span>•</span>
                <span>{{ post.readTime }} min read</span>
              </div>
              
              <h3 class="text-lg font-heading font-semibold text-gray-900 mb-3 group-hover:text-brand-brown transition-colors line-clamp-2">
                {{ post.title }}
              </h3>
              
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                {{ post.excerpt }}
              </p>
              
              <div class="inline-flex items-center space-x-2 text-brand-brown group-hover:text-brand-brown/80 font-medium text-sm">
                <span>Read More</span>
                <Icon name="heroicons:arrow-right" class="w-4 h-4" />
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Load More (if needed) -->
        <div v-if="hasMorePosts" class="text-center mt-12">
          <button 
            @click="loadMorePosts"
            class="btn-secondary px-8 py-3"
          >
            Load More Posts
          </button>
        </div>
      </div>

      <!-- Newsletter Signup -->
      <div class="mt-20 bg-gradient-to-br from-brand-pink/20 to-brand-sage/20 rounded-2xl p-8 text-center">
        <h3 class="text-2xl font-heading font-semibold text-gray-900 mb-4">
          Stay Updated with New Posts
        </h3>
        <p class="text-gray-600 mb-6 max-w-lg mx-auto">
          Get notified when I share new design tips, wedding inspiration, or behind-the-scenes stories. No spam, just genuine updates!
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
</template>

<script setup>

// SEO
useSeoMeta({
  title: 'Design Stories & Tips | Miracute Blog - Wedding & Design Inspiration',
  description: 'Read personal stories, design tips, and wedding inspiration from the designer behind Miracute templates. Canva tutorials, business advice, and more.',
  keywords: 'design blog, wedding tips, canva tutorials, template design, business advice, wedding inspiration',
  ogTitle: 'Design Stories & Tips | Miracute Blog',
  ogDescription: 'Personal stories and design tips from your template designer.',
  ogImage: '/images/og-blog.jpg'
})

// State
const selectedCategory = ref('')
const newsletterEmail = ref('')
const featuredImageError = ref(false)
const postImageErrors = ref({})
const featuredImageLoaded = ref(false)

// Query blog posts using queryCollection (Nuxt Content v3 API)
const { data: allPosts } = await useAsyncData('blog-posts', async () => {
  try {
    const allContent = await queryCollection('content').all()

    // Filter blog posts and sort manually
    const blogPosts = allContent
      ?.filter(item => item.path?.startsWith('/blog'))
      ?.sort((a, b) => new Date(b.meta?.date || b.date) - new Date(a.meta?.date || a.date))
      ?.map(item => ({
        // Map the content structure to match the old format
        _path: item.path,
        title: item.title || item.meta?.title,
        date: item.meta?.date || item.date,
        readTime: item.meta?.readTime,
        category: item.meta?.category,
        categoryLabel: item.meta?.categoryLabel,
        excerpt: item.description || item.meta?.excerpt,
        image: item.meta?.image,
        featured: item.meta?.featured,
        ...item
      })) || []

    return blogPosts
  } catch (error) {
    console.error('Error loading blog posts:', error)
    return []
  }
})


const hasMorePosts = ref(false)

// Computed
const featuredPost = computed(() => {
  if (!allPosts.value) return null
  return allPosts.value.find(post => post.featured) || allPosts.value[0]
})

const filteredPosts = computed(() => {
  if (!allPosts.value) return []
  let posts = allPosts.value.filter(post => !post.featured)
  
  if (selectedCategory.value) {
    posts = posts.filter(post => post.category === selectedCategory.value)
  }
  
  return posts
})

// Methods
const formatDate = (date) => {
  if (!date) return 'Coming soon'
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Coming soon'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
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

const loadMorePosts = () => {
  // Implement pagination if needed
  console.log('Load more posts')
}

const subscribeNewsletter = () => {
  // Implement newsletter subscription
  console.log('Subscribe:', newsletterEmail.value)
  newsletterEmail.value = ''
  // Show success message
}

// Image error handling
const handleImageError = () => {
  console.log('Featured image failed to load')
  featuredImageError.value = true
}

const handleImageLoad = () => {
  console.log('Featured image loaded successfully')
  featuredImageError.value = false
  featuredImageLoaded.value = true
}

const handlePostImageError = (event, path) => {
  console.log('Post image error for:', path, event)
  postImageErrors.value = { ...postImageErrors.value, [path]: true }
}
</script>