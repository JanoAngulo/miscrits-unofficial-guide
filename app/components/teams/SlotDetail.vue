<script setup lang="ts">
import type { TeamUtility } from '#shared/utils/teams'

// What a filled slot brings, read from base stats: element, points, role, the kinds it hits and tanks with, what it
// is weak to and its utility.
const props = defineProps<{ entry: TeamEntry, utility: TeamUtility[] }>()

const m = computed(() => props.entry.m)
const pts = computed(() => teamPoints(m.value.rarity))
const rows = computed(() => [
  { dt: 'Hits', ks: teamLean(m.value, 'pa', 'ea'), icon: 'attack' as const },
  { dt: 'Tanks', ks: teamLean(m.value, 'pd', 'ed'), icon: 'defense' as const },
])
</script>

<template>
  <p class="mt-2 flex items-center gap-1"><ElementIcon :element="m.element" class="h-5 w-5" /><span class="truncate text-sm font-bold">{{ parts(m.element).join(' and ') }}</span></p>
  <p class="mt-1.5 flex items-center gap-2 whitespace-nowrap"><TeamsRarity :rarity="m.rarity" /><span class="text-xs font-bold text-fog">{{ pts }} {{ pts === 1 ? 'point' : 'points' }}</span></p>
  <dl class="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-sm">
    <dt class="text-fog">Role</dt>
    <dd class="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold"><TeamsSpeedBars :n="teamSpeed(m)" /><span class="whitespace-nowrap">{{ teamRole(m).label }}</span><span class="sr-only">, speed {{ teamSpeed(m) }} of 5</span></dd>
    <template v-for="r in rows" :key="r.dt">
      <dt class="text-fog">{{ r.dt }}</dt>
      <dd class="flex items-center gap-1 font-bold">
        <StatTile v-for="k in r.ks" :key="k" :icon="r.icon" :hue="STAT_HUE[k]" class="grid h-5 w-5 shrink-0 place-items-center rounded-md" svg-class="h-[70%] w-[70%]" />
        <span>{{ r.ks.length > 1 ? 'Both' : teamKindWord(r.ks[0]!) }}</span>
      </dd>
    </template>
    <dt class="text-fog">Weak to</dt>
    <dd class="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold">
      <template v-if="teamThreats(m).length">
        <span v-for="t in teamThreats(m)" :key="t" class="inline-flex items-center gap-1"><ElementIcon :element="t" class="h-5 w-5" />{{ t }}</span>
      </template>
      <span v-else class="font-normal text-fog">Nothing in either cycle</span>
    </dd>
  </dl>
  <p v-if="utility.length" class="mt-auto flex flex-wrap gap-1 pt-3">
    <span v-for="u in utility" :key="u.k" class="rounded-md bg-leaf px-1.5 py-px text-xs font-bold text-fog">{{ u.label }}</span>
  </p>
</template>
