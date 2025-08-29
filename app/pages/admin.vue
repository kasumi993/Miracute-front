<template>
  <div></div>
</template>

<script setup>
// Redirect to secure dashboard route
await navigateTo('/dashboard', { redirectCode: 301 })
</script>