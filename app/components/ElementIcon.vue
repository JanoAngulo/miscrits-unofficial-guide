<script setup lang="ts">
// An element's icon, mixed elements (FireWind...) included. The site has none for Misc, so that one is a dot.
// Size it with a class.
const props = defineProps<{ element: string }>()

const key = computed(() => props.element.toLowerCase())
const name = computed(() => parts(props.element).join(' and '))
</script>

<template>
  <span v-if="key === 'misc'" class="inline-block shrink-0 rounded-full" :style="{ background: MISC_COLOUR }" title="Misc" />
  <FallbackImg
    v-else
    :sources="[`/assets/elements/${key}.png`, `https://www.worldofmiscrits.com/${key}.png`]"
    alt="" :title="name" class="shrink-0 object-contain"
  />
</template>
