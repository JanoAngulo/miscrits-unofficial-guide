<script setup lang="ts">
// A miscrit's avatar or full art. Local copy first, the game's CDN if build-data has not fetched it.
// Avatars try upscale.py's 4x copy before that: the game's own are 50px.
const props = withDefaults(defineProps<{ slug: string, kind?: 'avatar' | 'art', alt?: string }>(), {
  kind: 'avatar',
  alt: '',
})

const { localImages } = useRuntimeConfig().public

const sources = computed(() => {
  const s = props.slug
  if (props.kind === 'art') {
    const cdn = `https://cdn.worldofmiscrits.com/miscrits/${s}_back.png`
    return localImages ? [`/assets/art/${s}.png`, cdn] : [cdn]
  }
  const cdn = `https://cdn.worldofmiscrits.com/avatars/${s}_avatar.png`
  return [`/assets/avatars-hd/${s}.webp`, ...(localImages ? [`/assets/avatars/${s}.png`] : []), cdn]
})
</script>

<template>
  <FallbackImg :sources="sources" :alt="alt" loading="lazy" />
</template>
