<script setup lang="ts">
// An element named in running text, led by its icon.
defineProps<{ el: string }>()
</script>

<template>
  <span class="inline-flex items-baseline gap-1 whitespace-nowrap"><ElementIcon :element="el" class="h-3.5 w-3.5 self-center" />{{ el }}</span>
</template>
