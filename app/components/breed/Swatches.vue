<script setup lang="ts" generic="T extends BreedWant">
import type { BreedWant } from '~/utils/breed'

// A stat pick: three swatches (minus, dot, plus), and Any for a wanted stat. Radios, so arrows move the pick.
defineProps<{ name: string, label: string, withAny?: boolean }>()
const pick = defineModel<T>({ required: true })
</script>

<template>
  <div role="radiogroup" :aria-label="label" class="flex gap-1.5">
    <label v-if="withAny" class="cursor-pointer"><input v-model="pick" type="radio" :name="name" value="any" class="sr-only" aria-label="Any"><span class="sw sw-any">Any</span></label>
    <label v-for="q in ([0, 1, 2] as const)" :key="q" class="cursor-pointer" :title="BREED_COLOURS[q]">
      <input v-model="pick" type="radio" :name="name" :value="q" class="sr-only" :aria-label="BREED_COLOURS[q]"><span class="sw" :class="`sw-${q}`"><BreedGlyph :q="q" /></span>
    </label>
  </div>
</template>
