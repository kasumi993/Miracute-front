<template>
  <div class="pt-4">
    <button
      @click="toggleSpecs"
      class="flex items-center justify-between w-full text-left lg:cursor-default"
      :class="{'lg:pointer-events-none': true}"
    >
      <h3 class="text-lg lg:text-xl font-medium text-gray-900">Technical Specs</h3>
      <Icon
        :name="isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
        class="w-5 h-5 text-gray-400 lg:hidden"
      />
    </button>
    <div :class="['overflow-hidden transition-all duration-300', isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 lg:max-h-96 lg:opacity-100 lg:mt-4']">
      <div class="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div class="space-y-2 lg:space-y-3">
          <div v-if="product.difficulty_level" class="flex items-center justify-between py-2 lg:py-3 px-3 lg:px-4 bg-gray-50 rounded-lg lg:rounded-xl border border-gray-100">
            <div class="flex items-center space-x-2 lg:space-x-3">
              <div class="w-6 h-6 lg:w-8 lg:h-8 bg-brand-sage rounded-md lg:rounded-lg flex items-center justify-center">
                <Icon name="heroicons:academic-cap" class="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span class="text-xs lg:text-sm font-medium text-gray-700">Difficulty Level</span>
            </div>
            <span class="text-xs lg:text-sm font-semibold text-brand-brown">{{ product.difficulty_level }}</span>
          </div>

          <div v-if="product.template_type" class="flex items-center justify-between py-2 lg:py-3 px-3 lg:px-4 bg-gray-50 rounded-lg lg:rounded-xl border border-gray-100">
            <div class="flex items-center space-x-2 lg:space-x-3">
              <div class="w-6 h-6 lg:w-8 lg:h-8 bg-brand-pink rounded-md lg:rounded-lg flex items-center justify-center">
                <Icon name="heroicons:tag" class="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span class="text-xs lg:text-sm font-medium text-gray-700">Template Type</span>
            </div>
            <span class="text-xs lg:text-sm font-semibold text-brand-brown">{{ product.template_type }}</span>
          </div>

          <div v-if="product.file_size" class="flex items-center justify-between py-2 lg:py-3 px-3 lg:px-4 bg-gray-50 rounded-lg lg:rounded-xl border border-gray-100">
            <div class="flex items-center space-x-2 lg:space-x-3">
              <div class="w-6 h-6 lg:w-8 lg:h-8 bg-brand-brown rounded-md lg:rounded-lg flex items-center justify-center">
                <Icon name="heroicons:cloud-arrow-down" class="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span class="text-xs lg:text-sm font-medium text-gray-700">Download Size</span>
            </div>
            <span class="text-xs lg:text-sm font-semibold text-brand-brown">{{ product.file_size }}</span>
          </div>

          <div v-if="product.dimensions" class="flex items-center justify-between py-2 lg:py-3 px-3 lg:px-4 bg-gray-50 rounded-lg lg:rounded-xl border border-gray-100">
            <div class="flex items-center space-x-2 lg:space-x-3">
              <div class="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-brand-sage to-brand-pink rounded-md lg:rounded-lg flex items-center justify-center">
                <Icon name="heroicons:arrows-pointing-out" class="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span class="text-xs lg:text-sm font-medium text-gray-700">Dimensions</span>
            </div>
            <span class="text-xs lg:text-sm font-semibold text-brand-brown">{{ product.dimensions }}</span>
          </div>

          <div v-if="product.software_required?.length" class="flex items-center justify-between py-2 lg:py-3 px-3 lg:px-4 bg-gray-50 rounded-lg lg:rounded-xl border border-gray-100">
            <div class="flex items-center space-x-2 lg:space-x-3">
              <div class="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-brand-pink to-brand-brown rounded-md lg:rounded-lg flex items-center justify-center">
                <Icon name="heroicons:computer-desktop" class="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span class="text-xs lg:text-sm font-medium text-gray-700">Required Software</span>
            </div>
            <span class="text-xs lg:text-sm font-semibold text-brand-brown">{{ product.software_required.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCategory } from '@/types/database'

interface Props {
  product: ProductWithCategory
  isOpen: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleSpecs = () => {
  emit('toggle')
}
</script>