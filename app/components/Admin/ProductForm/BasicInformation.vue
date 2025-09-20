<template>
  <div class="card p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        v-model="form.name"
        label="Product Name"
        required
        :error="errors.name"
        placeholder="Beautiful Wedding Website Template"
      />

      <div>
        <label class="form-label">Category</label>
        <select
          v-model="form.category_id"
          class="form-input"
          required
          :class="{ 'border-red-300': errors.category_id }"
        >
          <option value="">Select Category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <p v-if="errors.category_id" class="mt-2 text-sm text-red-600">{{ errors.category_id }}</p>
      </div>

      <Input
        v-model="form.slug"
        label="URL Slug"
        :error="errors.slug"
        placeholder="beautiful-wedding-template"
        hint="Auto-generated from product name if left empty"
      />

      <Input
        v-model="form.price"
        label="Price ($)"
        type="number"
        step="0.01"
        min="0"
        required
        :error="errors.price"
      />

      <Input
        v-model="form.compare_at_price"
        label="Compare at Price ($)"
        type="number"
        step="0.01"
        min="0"
        :error="errors.compare_at_price"
        hint="Original price for showing discounts"
      />

      <div>
        <label class="form-label">Status</label>
        <select v-model="form.status" class="form-input">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <div class="mt-6">
      <Input
        v-model="form.short_description"
        label="Short Description"
        :error="errors.short_description"
        placeholder="Brief description for product cards"
        hint="Shown in product listings and previews"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
}

interface Props {
  form: any
  errors: Record<string, string>
  categories: Category[]
}

defineProps<Props>()
</script>