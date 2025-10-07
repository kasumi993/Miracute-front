<template>
  <div class="py-3 border-b border-gray-100">
    <nav class="flex items-center space-x-2 text-sm" :aria-label="ariaLabel">
      <template v-for="(item, index) in items" :key="index">
        <!-- Separator -->
        <Icon
          v-if="index > 0"
          :name="separatorIcon"
          class="w-4 h-4 text-gray-400"
        />

        <!-- Link -->
        <NuxtLink
          v-if="item.to && !item.active"
          :to="item.to"
          :class="linkClass"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- Active item -->
        <span
          v-else
          :class="activeClass"
        >
          {{ item.label }}
        </span>
      </template>
    </nav>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (items) => {
      return items.every(item =>
        typeof item === 'object' &&
        'label' in item &&
        (item.active || 'to' in item)
      )
    }
  },
  separatorIcon: {
    type: String,
    default: 'heroicons:chevron-right'
  },
  linkClass: {
    type: String,
    default: 'text-gray-500 hover:text-gray-700'
  },
  activeClass: {
    type: String,
    default: 'text-gray-900 font-medium'
  },
  ariaLabel: {
    type: String,
    default: 'Breadcrumb navigation'
  }
})
</script>