<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <Icon name="heroicons:x-mark" class="h-6 w-6 text-gray-600" />
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h2>

          <p class="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div class="space-y-3">
            <NuxtLink
              :to="$route.query.return_url as string || '/'"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-brown hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown"
            >
              Try Again
            </NuxtLink>

            <NuxtLink
              to="/"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown"
            >
              Continue Shopping
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Payment Cancelled',
  description: 'Your payment was cancelled',
  robots: 'noindex, nofollow'
})
</script>