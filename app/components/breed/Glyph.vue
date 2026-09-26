<script setup lang="ts">
import type { BreedRoll } from '~/utils/breed'

// A rolled stat's glyph, so red, white and green read without colour: minus, dot, plus.
defineProps<{ q: BreedRoll }>()
</script>

<template>
  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
    <path v-if="q === 0" d="M6.5 12h11" />
    <circle v-else-if="q === 1" cx="12" cy="12" r="3.25" />
    <path v-else d="M12 6.5v11M6.5 12h11" />
  </svg>
</template>
