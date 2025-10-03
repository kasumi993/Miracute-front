<template>
  <div>
    <!-- Hero Section -->
    <HomeHeroSection />

    <!-- Featured Categories Section -->
    <HomeFeaturedCategories />

    <!-- Recently Viewed Section -->
    <HomeRecentlyViewedSection />

    <!-- Benefits Section -->
    <HomeBenefitsSection />

    <!-- About the Creator -->
    <HomeCreatorSection />

    <!-- Customer Testimonials -->
    <HomeTestimonialSection />

    <!-- CTA Section -->
    <HomeCtaSection />
  </div>
</template>

<script setup>
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from '~/utils/seo'

// SEO optimization
const { setHomepageSEO } = useSEO()
setHomepageSEO()

// Add structured data for better SEO (using head meta)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify(generateWebsiteStructuredData())
    }
  ]
})

// Add page view tracking
onMounted(() => {
  // Track page view for analytics
  // This would integrate with your analytics service
})
</script>