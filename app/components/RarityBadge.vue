<script setup lang="ts">
const props = defineProps<{ rarity: string }>()
const look = computed(() => rarityLook(props.rarity))
</script>

<template>
  <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold" :style="{ background: look.bg, color: look.text }">{{ rarity }}</span>
</template>
