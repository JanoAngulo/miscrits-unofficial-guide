<script setup lang="ts">
import type { ListedMiscrit } from '~/composables/useMiscritList'

const props = defineProps<{ m: ListedMiscrit, today: number | null }>()

const ring = computed(() => rarityLook(props.m.rarity).ring)
const name = computed(() => props.m.names[0]!)
const evos = computed(() => props.m.names.slice(1).join(', '))
const elementName = computed(() => parts(props.m.element).join(' and '))
const places = computed(() => props.m.spots.map(place).join(', '))
// The card names zones only, one line; exact spots and days are in the detail.
const zones = computed(() => [...new Set(props.m.spots.map(s => s.zone))].join(', '))
const avail = computed(() => availability(props.m, props.today))
// The label replaces the card's text, so it carries the where and the day flag too.
const label = computed(() => [name.value, elementName.value, props.m.rarity, zones.value, avail.value && AVAIL[avail.value].label]
  .filter(Boolean).join(', '))
</script>

<template>
  <NuxtLink
    :to="`/miscrit/${m.slugs[0]}`" :data-open="m.slugs[0]" prefetch-on="interaction"
    :aria-label="`${label}. See evolutions and moves`"
    class="card press flex h-full w-full flex-col rounded-3xl border-2 bg-card p-4 text-left shadow-[0_1px_2px_rgb(var(--shade)/.06)]"
    :style="{ borderColor: `${ring}66`, color: ring }"
  >
    <div class="flex w-full items-center gap-3 text-ink">
      <span class="shrink-0 rounded-2xl p-[3px]" :style="{ background: ring }">
        <MiscritImg :slug="m.slugs[0]!" class="block h-[58px] w-[58px] rounded-[13px] bg-leaf object-cover" />
      </span>
      <div class="min-w-0">
        <div class="flex min-w-0 items-center gap-1.5">
          <span class="inline-flex shrink-0 items-center" :title="elementName"><ElementIcon :element="m.element" class="h-5 w-5" /><span class="sr-only">{{ elementName }}</span></span>
          <h2 class="truncate font-display text-xl leading-tight font-bold">{{ name }}</h2>
        </div>
        <div class="mt-1 text-xs"><RarityBadge :rarity="m.rarity" /></div>
      </div>
    </div>
    <p class="mt-2 w-full truncate text-xs text-fog" :title="`Evolves into ${evos}`">Evolves into {{ evos }}</p>
    <div class="mt-auto w-full pt-3">
      <div class="flex w-full items-start gap-2 border-t border-ink/10 pt-3 text-ink">
        <template v-if="m.spots.length">
          <PinIcon class="mt-0.5 h-4 w-4" />
          <p class="min-w-0 flex-1 truncate font-display text-[15px] leading-snug" :title="places">{{ zones }}</p>
        </template>
        <span v-else class="flex-1" />
        <span v-if="avail" class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold" :class="AVAIL[avail].cls">
          <StatusIcon :paths="AVAIL[avail].icon" class="h-3.5 w-3.5" />{{ AVAIL[avail].label }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
