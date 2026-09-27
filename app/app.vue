<script setup lang="ts">
useHead({
  bodyAttrs: { class: 'font-body text-ink antialiased' },
  titleTemplate: title => (title ? `${title} - Miscripedia` : 'Miscripedia'),
})
</script>

<template>
  <!-- Opening a miscrit waits on its record; the bar says so when that takes a moment. -->
  <NuxtLoadingIndicator color="var(--chapter)" :height="3" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* The bar grows only for a pointer action with motion allowed; otherwise it steps (and fades, for reduced motion). */
@media (prefers-reduced-motion: reduce) {
  .nuxt-loading-indicator { transition: opacity 0.4s !important; }
}
[data-input="key"] .nuxt-loading-indicator { transition: none !important; }
</style>
