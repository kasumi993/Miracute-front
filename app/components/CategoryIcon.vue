<template>
    <NuxtLink :to="`/listings?category=${slug}`">
        <div class="text-center">
            <div :class="`${bgColor} border-2 sm:border-3 border-brand-brown/20 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95`">
              <Icon :name="icon" :class="`w-5 h-5 sm:w-6 sm:h-6 text-brand-brown ${iconClass}`" />
            </div>
            <h3 class="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors line-clamp-1">{{ title }}</h3>
            <p class="text-xs text-gray-500 mt-1 hidden sm:block line-clamp-2">{{ description }}</p>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon: string
  iconClass?: string
  bgColor: string
  slug: string
}

const props = defineProps<Props>()

</script>