<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />
  
  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <h1>Page</h1>
    <!-- Content will be implemented here -->
  </div>
</template>

<script setup>
// Admin Guard
const { isCheckingAccess, hasAdminAccess } = useAdminGuard()

// Page will be implemented
</script>
