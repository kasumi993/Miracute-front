<template>
  <section v-if="recentlyViewed.length > 0" class="py-8 md:py-12 bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
            Recently Viewed
          </h2>
          <p class="text-sm md:text-base text-gray-600">
            Continue where you left off
          </p>
        </div>
        <button
          @click="clearAll"
          class="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
        >
          Clear all
        </button>
      </div>

      <!-- Recently Viewed Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="template in recentlyViewed"
          :key="template.id"
          class="group relative"
        >
          <NuxtLink :to="`/templates/${template.slug}`" class="block">
            <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-brand-sage/20">
              <!-- Template Image -->
              <div class="aspect-[4/3] bg-gradient-to-br from-brand-sage/10 to-brand-warm/10 relative overflow-hidden">
                <img
                  v-if="template.image"
                  :src="template.image"
                  :alt="template.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <Icon name="heroicons:photo" class="w-12 h-12 text-gray-300" />
                </div>

                <!-- Recently viewed badge -->
                <div class="absolute top-3 left-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-brown/90 text-white">
                    <Icon name="heroicons:clock" class="w-3 h-3 mr-1" />
                    Recently viewed
                  </span>
                </div>
              </div>

              <!-- Template Info -->
              <div class="p-4">
                <h3 class="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-brand-brown transition-colors">
                  {{ template.title }}
                </h3>
                <p class="text-sm text-gray-500 mb-2 capitalize">
                  {{ template.category?.name || 'Template' }}
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold text-gray-900">
                    ${{ template.price }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ formatViewedTime(template.viewedAt) }}
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- View All Link -->
      <div class="text-center mt-8">
        <NuxtLink
          to="/templates"
          class="inline-flex items-center text-brand-brown hover:text-brand-brown/80 font-medium transition-colors"
        >
          Browse all templates
          <Icon name="heroicons:arrow-right" class="ml-2 w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { getRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed()

const recentlyViewed = ref([])

const loadRecentlyViewed = () => {
  recentlyViewed.value = getRecentlyViewed()
}

const clearAll = () => {
  clearRecentlyViewed()
  recentlyViewed.value = []
}

const formatViewedTime = (dateString: string) => {
  if (!dateString) return ''

  const now = new Date()
  const viewed = new Date(dateString)
  const diffInHours = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return viewed.toLocaleDateString()
}

// Load recently viewed on component mount
onMounted(() => {
  loadRecentlyViewed()
})
</script>