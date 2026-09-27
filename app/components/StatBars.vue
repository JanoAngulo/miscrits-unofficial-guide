<script setup lang="ts">
import type { StatKey, StatWord } from '#shared/types/miscrit'

defineProps<{ stats: Record<StatKey, StatWord> }>()

// Physical and elemental cells drop the column word, which the column head already says (screen readers keep it).
const split = (label: string) => {
  const [first, second] = label.split(' ')
  return second && (first === 'Physical' || first === 'Elemental')
    ? { hidden: `${first} `, shown: second.replace(/^./, c => c.toUpperCase()) }
    : { hidden: '', shown: label }
}
const heads = ['physical', 'elemental'] as const
</script>

<template>
  <div class="grid grid-cols-3 gap-x-3 gap-y-3 rounded-2xl bg-leaf/60 p-3">
    <!-- Column heads sit inside the panel, in their column's colour, so they read as part of the grid. -->
    <div class="col-span-3 -mb-1 grid grid-cols-3 gap-x-3" aria-hidden="true">
      <span />
      <span v-for="col in heads" :key="col" class="text-xs font-bold" :style="{ color: STAT_HUE[col].text }">{{ col[0]!.toUpperCase() + col.slice(1) }}</span>
    </div>
    <div v-for="s in STAT_GRID" :key="s.k" class="min-w-0">
      <div class="flex items-center gap-1.5">
        <StatTile :icon="s.icon" :hue="STAT_HUE[s.col]" class="grid h-6 w-6 shrink-0 place-items-center rounded-md" svg-class="h-4 w-4" />
        <span class="grid flex-1 grid-cols-5 gap-0.5" aria-hidden="true">
          <span v-for="i in 5" :key="i" class="h-3 rounded-[3px]" :style="segmentStyle(i <= (STAT_LEVEL[stats[s.k]] ?? 0), STAT_HUE[s.col])" />
        </span>
      </div>
      <p class="mt-1 flex flex-wrap justify-between gap-x-1 text-xs">
        <span class="text-fog"><span v-if="split(s.label).hidden" class="sr-only">{{ split(s.label).hidden }}</span>{{ split(s.label).shown }}</span>
        <span class="font-bold" :style="{ color: STAT_HUE[s.col].text }">{{ stats[s.k] }}</span>
      </p>
    </div>
  </div>
</template>
