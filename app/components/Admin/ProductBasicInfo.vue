<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
    
    <!-- Product Name -->
    <div class="mb-6">
      <label for="name" class="form-label">Template Title *</label>
      <input
        id="name"
        :value="product.name"
        @input="updateProduct('name', ($event.target as HTMLInputElement).value)"
        type="text"
        required
        class="form-input"
        placeholder="e.g., Modern Instagram Story Templates Pack"
      />
      <p class="mt-1 text-sm text-gray-500">
        Include what it is, what it's for, and style keywords buyers might search for
      </p>
    </div>

    <!-- Template Type -->
    <div class="mb-6">
      <label for="templateType" class="form-label">Template Type *</label>
      <select
        id="templateType"
        :value="product.templateType"
        @change="updateProduct('templateType', ($event.target as HTMLSelectElement).value)"
        required
        class="form-input"
      >
        <option value="canva">Canva Template</option>
        <option value="photoshop">Photoshop Template (PSD)</option>
        <option value="figma">Figma Template</option>
        <option value="wordpress">WordPress Theme</option>
        <option value="squarespace">Squarespace Template</option>
        <option value="notion">Notion Template</option>
        <option value="powerpoint">PowerPoint Template</option>
        <option value="google-slides">Google Slides Template</option>
        <option value="illustrator">Illustrator Template (AI)</option>
        <option value="indesign">InDesign Template</option>
        <option value="other">Other</option>
      </select>
    </div>

    <!-- Category -->
    <div class="mb-6">
      <label for="category" class="form-label">Category *</label>
      <select
        id="category"
        :value="product.category_id"
        @change="updateProduct('category_id', ($event.target as HTMLSelectElement).value)"
        required
        class="form-input"
      >
        <option value="">Select a category</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Short Description -->
    <div class="mb-6">
      <label for="shortDescription" class="form-label">Short Description *</label>
      <textarea
        id="shortDescription"
        :value="product.short_description"
        @input="updateProduct('short_description', ($event.target as HTMLTextAreaElement).value)"
        required
        rows="2"
        class="form-input"
        maxlength="160"
        placeholder="Brief description that appears in listings (160 characters max)"
      />
      <div class="mt-1 text-sm text-gray-500 text-right">
        {{ product.short_description?.length || 0 }}/160
      </div>
    </div>

    <!-- Full Description -->
    <div class="mb-6">
      <label for="description" class="form-label">Full Description *</label>
      <textarea
        id="description"
        :value="product.description"
        @input="updateProduct('description', ($event.target as HTMLTextAreaElement).value)"
        required
        rows="8"
        class="form-input"
        placeholder="Detailed description of what buyers will get, how to use it, what's included, etc."
      />
      <p class="mt-1 text-sm text-gray-500">
        Explain what's included, how to customize, software requirements, etc.
      </p>
    </div>

    <!-- Tags -->
    <div class="mb-6">
      <label for="tags" class="form-label">Tags</label>
      <input
        id="tags"
        :value="tagsInput"
        @input="updateTagsInput(($event.target as HTMLInputElement).value)"
        type="text"
        class="form-input"
        placeholder="social media, instagram, modern, minimalist (separated by commas)"
      />
      <p class="mt-1 text-sm text-gray-500">
        Add keywords buyers might search for (separated by commas)
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  product: any
  categories: any[]
  tagsInput: string
}

interface Emits {
  (e: 'update:product', value: any): void
  (e: 'update:tagsInput', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper functions to update specific fields
const updateProduct = (field: string, value: any) => {
  const updatedProduct = { ...props.product, [field]: value }
  emit('update:product', updatedProduct)
}

const updateTagsInput = (value: string) => {
  emit('update:tagsInput', value)
}
</script>