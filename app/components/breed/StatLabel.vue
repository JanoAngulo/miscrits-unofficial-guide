<script setup lang="ts">
import type { BreedStat } from '~/utils/breed'

// A stat's tile and short name. A parent card has no room for the tiles on the narrowest phones, nor while three
// cards share a row below xl, so there (roomy false) it keeps the words only.
const props = withDefaults(defineProps<{ s: BreedStat, roomy?: boolean }>(), { roomy: true })
const hue = computed(() => STAT_HUE[props.s.col])
</script>

<template>
  <span
    class="flex shrink-0 items-center gap-1.5 text-xs font-bold" :class="roomy ? 'w-14' : 'w-8 min-[420px]:w-14 lg:w-8 xl:w-14'"
    :title="s.name" aria-hidden="true"
  >
    <StatTile
      :icon="s.icon" :hue="hue" svg-class="h-[65%] w-[65%]"
      class="h-5 w-5 shrink-0 place-items-center rounded-md" :class="roomy ? 'grid' : 'hidden min-[420px]:grid lg:hidden xl:grid'"
    />{{ s.ab }}
  </span>
</template>
