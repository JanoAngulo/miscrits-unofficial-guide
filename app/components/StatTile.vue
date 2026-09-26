<script setup lang="ts">
import type { StatHue, StatIcon } from '~/utils/field'

// The game's stat tile: a white glyph on the stat's fill. Shared by the detail's stat grid and the stat filter.
defineProps<{ icon: StatIcon, hue: StatHue, svgClass?: string }>()
</script>

<template>
  <span :style="{ background: hue.fill, boxShadow: `inset 0 0 0 1.5px ${hue.deep}` }" aria-hidden="true">
    <svg :class="svgClass" viewBox="0 0 24 24" fill="#fff" :stroke="hue.deep" stroke-width="1.2" stroke-linejoin="round"><path :d="STAT_ICON[icon]" /></svg>
  </span>
</template>
