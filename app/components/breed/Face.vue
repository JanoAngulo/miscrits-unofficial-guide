<script setup lang="ts">
import type { MiscritSummary } from '#shared/types/miscrit'

// A slot's face: the miscrit's avatar in its rarity frame, or the slot number.
const props = withDefaults(defineProps<{ m: MiscritSummary | null, name: string, slot: number, size?: 'lg' | 'sm' }>(), { size: 'lg' })
const slug = computed(() => {
  const m = props.m
  if (!m) return ''
  const key = props.name.trim().toLowerCase()
  return m.slugs[Math.max(0, m.names.findIndex(n => n.toLowerCase() === key))]!
})
</script>

<template>
  <span
    v-if="!m" class="grid shrink-0 place-items-center bg-leaf font-display text-fog"
    :class="size === 'lg' ? 'h-12 w-12 rounded-2xl text-xl' : 'h-8 w-8 rounded-xl text-sm'" style="font-weight:700" aria-hidden="true"
  >{{ slot + 1 }}</span>
  <span
    v-else class="grid shrink-0 p-[3px]" :class="size === 'lg' ? 'h-12 w-12 rounded-2xl' : 'h-8 w-8 rounded-xl'"
    :style="{ background: rarityLook(m.rarity).ring }" aria-hidden="true"
  >
    <MiscritImg :slug="slug" class="h-full w-full shrink-0 bg-leaf object-cover" :class="size === 'lg' ? 'rounded-[13px]' : 'rounded-[9px]'" />
  </span>
</template>
