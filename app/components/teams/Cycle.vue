<script setup lang="ts">
// One element cycle as a triangle, each arrow pointing at the element it beats.
const props = defineProps<{ cycle: string[] }>()

const P = [[120, 34], [206, 170], [34, 170]] as const
const pos = [['50%', '17%'], ['85.8%', '85%'], ['14.2%', '85%']] as const
// Each arrow takes the colour of the element doing the beating; a marker per arrow carries its colour.
const arrows = computed(() => [[0, 1], [1, 2], [2, 0]].map(([a, b]) => {
  const [x1, y1] = P[a!]!, [x2, y2] = P[b!]!, dx = x2 - x1, dy = y2 - y1, s = 38 / Math.hypot(dx, dy)
  const el = props.cycle[a!]!
  return { el, x1: x1 + dx * s, y1: y1 + dy * s, x2: x2 - dx * s, y2: y2 - dy * s }
}))
</script>

<template>
  <figure class="rounded-3xl border border-ink/10 bg-card p-4 pb-5">
    <div class="relative mx-auto aspect-[6/5] w-full max-w-xs" aria-hidden="true">
      <svg class="absolute inset-0 h-full w-full" viewBox="0 0 240 200">
        <defs>
          <marker v-for="el in cycle" :id="`head-${el}`" :key="el" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M1 1 9 5 1 9z" :fill="TEAM_ELEMENT_HUE[el]" /></marker>
        </defs>
        <line
          v-for="a in arrows" :key="a.el" :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" :stroke="TEAM_ELEMENT_HUE[a.el]"
          stroke-width="3" stroke-linecap="round" :marker-end="`url(#head-${a.el})`"
        />
      </svg>
      <div
        v-for="(el, k) in cycle" :key="el" class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        :style="{ left: pos[k]![0], top: pos[k]![1] }"
      >
        <span
          class="grid h-14 w-14 place-items-center rounded-full shadow-[0_1px_2px_rgb(var(--shade)/.1)]"
          :style="{ background: `color-mix(in srgb, ${TEAM_ELEMENT_HUE[el]} 16%, var(--card))`, boxShadow: `inset 0 0 0 2px ${TEAM_ELEMENT_HUE[el]}` }"
        ><ElementIcon :element="el" class="h-10 w-10" /></span>
        <span class="mt-1 font-display text-base">{{ el }}</span>
      </div>
    </div>
    <figcaption class="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm">
      <span v-for="(el, k) in cycle" :key="el" class="inline-flex items-center gap-1"><ElementIcon :element="el" class="h-4 w-4" /><span><span class="font-bold">{{ el }}</span> beats {{ cycle[(k + 1) % 3] }}</span></span>
    </figcaption>
  </figure>
</template>
