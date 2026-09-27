<script setup lang="ts">
// An inline rarity badge that sits on the text line rather than as a flex box.
const props = defineProps<{ rarity: string }>()
const look = computed(() => rarityLook(props.rarity))
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-bold" :style="{ background: look.bg, color: look.text }">{{ rarity }}</span>
</template>
