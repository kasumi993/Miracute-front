<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="animate-pulse">
      <!-- Breadcrumb skeleton -->
      <div class="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>

      <!-- Mobile header skeleton -->
      <div class="lg:hidden mb-4 space-y-3">
        <div class="flex space-x-2">
          <div class="h-6 bg-gray-200 rounded w-16"></div>
          <div class="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
        <div class="flex justify-between">
          <div class="h-8 bg-gray-200 rounded w-20"></div>
          <div class="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      <!-- Main content skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Left column -->
        <div class="space-y-6">
          <!-- Image gallery skeleton -->
          <div class="aspect-[4/3] bg-gray-200 rounded-lg"></div>

          <!-- What's included skeleton (desktop) -->
          <div class="hidden lg:block">
            <div class="bg-gray-100 rounded-2xl p-6 space-y-4">
              <div class="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div class="space-y-3">
                <div v-for="i in 4" :key="i" class="flex items-center space-x-3">
                  <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div class="flex-1 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews skeleton (desktop) -->
          <div class="hidden lg:block space-y-4">
            <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="flex space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-6">
          <!-- Desktop header skeleton -->
          <div class="hidden lg:block space-y-4">
            <div class="flex space-x-2">
              <div class="h-6 bg-gray-200 rounded w-16"></div>
              <div class="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="flex items-center space-x-4">
              <div class="h-4 bg-gray-200 rounded w-32"></div>
              <div class="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div class="h-10 bg-gray-200 rounded w-32"></div>
          </div>

          <!-- Actions skeleton -->
          <div class="space-y-3">
            <div class="h-12 bg-gray-200 rounded w-full"></div>
            <div class="flex space-x-3">
              <div class="h-12 bg-gray-200 rounded flex-1"></div>
              <div class="h-12 bg-gray-200 rounded w-12"></div>
            </div>
          </div>

          <!-- Sections skeleton -->
          <div class="space-y-6">
            <div v-for="i in 3" :key="i" class="space-y-3">
              <div class="h-6 bg-gray-200 rounded w-1/3"></div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded w-full"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This component is self-contained and doesn't need props
</script>