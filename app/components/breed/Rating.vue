<script setup lang="ts">
// A rating letter on its tier's fill, as the catching guide draws it. Size comes from the caller's classes.
defineProps<{ s: number }>()
</script>

<template>
  <span class="rtag" :style="{ background: breedTierFill(s) }">{{ BREED_RATINGS[s] }}</span>
</template>
