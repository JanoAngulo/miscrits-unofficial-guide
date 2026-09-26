<script setup lang="ts">
// Speed as five bars, lit in the game's speed colour; a role reads off how many are lit.
defineProps<{ n: number }>()
const h = STAT_HUE.speed
</script>

<template>
  <span class="flex gap-0.5" aria-hidden="true">
    <span
      v-for="i in 5" :key="i" class="h-3 w-2 rounded-xs"
      :style="i <= n ? { background: h.fill, boxShadow: `inset 0 0 0 1px ${h.deep}` } : { background: h.empty }"
    />
  </span>
</template>
