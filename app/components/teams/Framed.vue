<script setup lang="ts">
// A miscrit's avatar in its rarity ring, the way the builder and the guide show a team member.
const props = withDefaults(defineProps<{ entry: TeamEntry, size?: number }>(), { size: 58 })
const slug = computed(() => props.entry.m.slugs[props.entry.i] || props.entry.m.slugs[0]!)
</script>

<template>
  <span class="inline-block shrink-0 rounded-2xl p-[3px]" :style="{ background: rarityLook(entry.m.rarity).ring }">
    <MiscritImg :slug="slug" class="block rounded-[13px] shrink-0 bg-leaf object-cover" :style="{ width: `${size}px`, height: `${size}px` }" />
  </span>
</template>
