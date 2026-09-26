<script setup lang="ts">
// A line icon for a spawn flag or answer; `paths` is one of the fixed shapes in utils/field.
defineProps<{ paths: string }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="paths" />
</template>
