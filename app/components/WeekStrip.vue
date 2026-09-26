<script setup lang="ts">
// The page's one strong visual element: seven cells, the days a miscrit is missing hatched and struck.
const props = defineProps<{ days: number[] }>()
const today = useToday()
</script>

<template>
  <div class="grid grid-cols-7 gap-1">
    <span
      v-for="d in WEEK" :key="d"
      class="grid h-6 place-items-center rounded-md text-[11px] font-bold"
      :class="[props.days.includes(d) ? 'day-on' : 'day-off', { 'day-today': d === today }]"
      :title="`${DAYS[d]}: ${props.days.includes(d) ? 'spawns' : 'does not spawn'}`"
    ><span class="day-l">{{ DAYS[d]![0] }}</span><span class="sr-only">{{ DAYS[d]!.slice(1) }} {{ props.days.includes(d) ? 'spawns' : 'missing' }}</span></span>
  </div>
</template>
