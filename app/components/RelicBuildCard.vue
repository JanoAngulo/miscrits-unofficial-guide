<script setup lang="ts">
import type { StatColumn, StatIcon } from '~/utils/field'

// One of the relics guide's numbered builds. What it leans on picks its colour, from the game's stat fills: attack
// kind for bruisers, health for tanks and hybrids, speed for snipers. Words and icons say it too.
const props = defineProps<{
  b: { n: number, lean: StatColumn, name: string, who: string, relics: string[][], note?: string }
  // The stats the build is for, drawn as tiles before who it suits.
  tiles: { icon: StatIcon, col: StatColumn }[]
  // The reference list's cards are link targets; a copy inside a pick is not.
  anchor?: boolean
}>()

// Green and gold fills are too light for white numerals, so those take dark ink.
const LEAN_TEXT: Record<StatColumn, string> = { elemental: '#fff', physical: '#fff', core: '#1B2E2A', speed: '#1B2E2A' }
const hue = computed(() => STAT_HUE[props.b.lean])
</script>

<template>
  <article
    :id="anchor ? `build-${b.n}` : undefined" class="build rounded-2xl bg-card p-4"
    :style="{ '--hf': hue.fill, '--hw': hue.empty }"
  >
    <div class="flex items-start gap-3">
      <span
        class="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-lg"
        :style="{ background: hue.fill, color: LEAN_TEXT[b.lean], boxShadow: `inset 0 0 0 1.5px ${hue.deep}` }"
      ><span class="sr-only">Build </span>{{ b.n }}</span>
      <div class="min-w-0">
        <h4 class="font-display text-xl leading-tight">{{ b.name }}</h4>
        <p class="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-bold text-fog">
          <StatTile
            v-for="(t, i) in tiles" :key="i" :icon="t.icon" :hue="STAT_HUE[t.col]"
            class="grid h-5 w-5 shrink-0 place-items-center rounded-md" svg-class="h-[65%] w-[65%]"
          />
          <span>{{ b.who }}</span>
        </p>
      </div>
    </div>
    <!-- Each joiner travels with the relic after it, so a line break never strands an "or" or a "+". -->
    <p class="mt-3 flex flex-wrap items-center gap-y-1.5 text-sm">
      <template v-for="(opts, g) in b.relics" :key="g">
        <span v-for="(r, i) in opts" :key="r" class="inline-flex items-center">
          <template v-if="g && !i"><span class="px-1.5 font-display text-fog" aria-hidden="true">+</span><span class="sr-only">plus </span></template>
          <span v-if="i" class="px-1 text-xs text-fog">or</span>
          <span class="relic rounded-lg px-2 py-1 font-bold">{{ r }}</span>
        </span>
      </template>
    </p>
    <p v-if="b.note" class="mt-2 text-xs text-fog">{{ b.note }}</p>
  </article>
</template>
