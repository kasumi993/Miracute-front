<template>
  <div>
    <!-- Hero Section -->
    <HomeHeroSection />

    <!-- Featured Categories Section -->
    <HomeFeaturedCategories />

    <!-- Featured Products Section -->
    <HomeFeaturedProducts />

    <!-- Benefits Section -->
    <HomeBenefitsSection />

    <!-- CTA Section -->
    <HomeCtaSection />
  </div>
</template>

<script setup>
// SEO Meta Tags
useHead({
  title: 'Beautiful Website Templates | Miracute - Make Someone Smile Every Day',
  meta: [
    { name: 'description', content: 'Professional website templates for businesses, weddings, therapists, and creatives. Easy to customize, mobile-responsive designs. No coding required. Download instantly.' },
    { name: 'keywords', content: 'website templates, canva website template, wedding website, business template, therapist website, portfolio template, professional design' }
  ]
})

// Add page view tracking
onMounted(() => {
  // Track page view for analytics
  // This would integrate with your analytics service
})
</script>