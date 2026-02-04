<template>
  <div class="min-h-screen bg-background text-foreground">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
    class: 'dark',
  },
  bodyAttrs: {
    class: 'bg-background text-foreground',
  },
})
</script>
