<script setup lang="ts">
import type { StatKey } from '#shared/types/miscrit'
import type { BreedRoll, BreedWant } from '~/utils/breed'

// Six rolled stats in a row, as the catching guide draws them. A stat left open is an empty cell.
defineProps<{ stats: Record<StatKey, BreedWant> }>()
</script>

<template>
  <span class="grid grid-cols-6 gap-0.5" aria-hidden="true">
    <span v-for="s in BREED_STATS" :key="s.k" class="q" :class="`q-${stats[s.k]}`"><BreedGlyph v-if="stats[s.k] !== 'any'" :q="stats[s.k] as BreedRoll" /></span>
  </span>
</template>
