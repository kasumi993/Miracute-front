<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="text-center mb-5">
      <h4 class="text-xl font-bold text-gray-900 mb-2">What's Included</h4>
      <p class="text-sm text-gray-500">Everything you need for success</p>
    </div>

    <div class="space-y-4">
      <div class="relative pl-8">
        <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-sage to-brand-sage/80 rounded-full flex items-center justify-center">
          <Icon name="heroicons:sparkles" class="w-3 h-3 text-white" />
        </div>
        <div>
          <h5 class="font-semibold text-gray-900 text-sm">Premium Design</h5>
          <p class="text-xs text-gray-500 mt-1">Professionally crafted templates</p>
        </div>
      </div>

      <div class="relative pl-8">
        <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-pink to-brand-pink/80 rounded-full flex items-center justify-center">
          <Icon name="heroicons:pencil-square" class="w-3 h-3 text-white" />
        </div>
        <div>
          <h5 class="font-semibold text-gray-900 text-sm">Easy Editing</h5>
          <p class="text-xs text-gray-500 mt-1">Customize colors, text & layout</p>
        </div>
      </div>

      <div class="relative pl-8">
        <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-brown to-brand-brown/80 rounded-full flex items-center justify-center">
          <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-3 h-3 text-white" />
        </div>
        <div>
          <h5 class="font-semibold text-gray-900 text-sm">30 Days Support</h5>
          <p class="text-xs text-gray-500 mt-1">Personal help from the designer</p>
        </div>
      </div>

      <div class="relative pl-8">
        <div class="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-brand-sage/70 to-brand-pink/70 rounded-full flex items-center justify-center">
          <Icon name="heroicons:building-office" class="w-3 h-3 text-white" />
        </div>
        <div>
          <h5 class="font-semibold text-gray-900 text-sm">Commercial Rights</h5>
          <p class="text-xs text-gray-500 mt-1">Use for client & business projects</p>
        </div>
      </div>

      <div class="mt-4 p-3 bg-gradient-to-r from-brand-sage/10 to-brand-pink/10 rounded-xl border border-brand-sage/20">
        <div class="flex items-center justify-center space-x-2">
          <Icon name="heroicons:infinity" class="w-5 h-5 text-brand-sage" />
          <span class="text-sm font-semibold text-gray-900">Lifetime Access</span>
        </div>
        <p class="text-center text-xs text-gray-600 mt-1">Download forever, no subscriptions</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This component is self-contained and doesn't need props
</script>