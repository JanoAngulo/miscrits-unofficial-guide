<script setup lang="ts">
// The link that opens each slot: the word, then the relation in the game's element icons.
const props = defineProps<{ entry: TeamEntry | null, prev: TeamEntry | null, i: number }>()

const link = computed(() => {
  const { entry: e, prev, i } = props
  if (!e || !i || !prev) return null
  const c = teamCover(e.m, prev.m)
  return { c, threats: teamThreats(prev.m) }
})
</script>

<template>
  <!-- An empty slot keeps an invisible row from 768px up, so the slot heads stay level across the grid. -->
  <div v-if="!entry" class="mb-3 invisible hidden md:flex min-h-[2.25rem] items-center gap-2.5 border-b border-ink/10 pb-3">
    <span class="link grid h-7 w-7 shrink-0 place-items-center rounded-full lg:hidden"><StatusIcon :paths="TEAM_ICON.dash" class="h-4 w-4 shrink-0" /></span>
    <span class="min-w-0 leading-tight"><span class="block text-sm font-bold">&nbsp;</span>
      <span class="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-fog">&nbsp;</span></span>
  </div>
  <template v-else-if="!link">
    <div class="mb-3 flex min-h-[2.25rem] items-center gap-2.5 border-b border-ink/10 pb-3">
      <span class="link grid h-7 w-7 shrink-0 place-items-center rounded-full bg-leaf text-fog lg:hidden"><StatusIcon :paths="i ? TEAM_ICON.dash : TEAM_ICON.flag" class="h-4 w-4 shrink-0" /></span>
      <span v-if="!i" class="min-w-0 leading-tight"><span class="block text-sm font-bold text-ink">Starts the train</span>
        <span class="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-fog">Speed {{ teamSpeed(entry.m) }}/5</span></span>
      <span v-else class="min-w-0 leading-tight"><span class="block text-sm font-bold text-fog">Fill slot {{ i }} to link</span>
        <span class="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-fog">Covers the one before</span></span>
    </div>
  </template>
  <template v-else>
    <!-- From lg up a badge also sits in the gap between the two slots it joins. -->
    <span
      class="link absolute left-[calc(-2.25rem-2px)] top-[16px] hidden h-8 w-8 place-items-center rounded-full lg:grid"
      :class="link.c.length ? 'bg-moss text-on' : 'link-off text-fog'" aria-hidden="true"
    ><StatusIcon :paths="link.c.length ? TEAM_ICON.link : TEAM_ICON.broken" class="h-[18px] w-[18px] shrink-0" /></span>
    <div class="mb-3 flex min-h-[2.25rem] items-center gap-2.5 border-b border-ink/10 pb-3">
      <span class="link grid h-7 w-7 shrink-0 place-items-center rounded-full lg:hidden" :class="link.c.length ? 'bg-moss text-on' : 'link-off text-fog'"><StatusIcon :paths="link.c.length ? TEAM_ICON.link : TEAM_ICON.broken" class="h-4 w-4 shrink-0" /></span>
      <span v-if="link.c.length" class="min-w-0 leading-tight"><span class="block text-sm font-bold text-moss">Covers {{ prev!.name }}</span>
        <span class="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-fog">
          <span class="inline-flex items-center gap-1"><ElementIcon :element="link.c[0]!.by" class="h-3.5 w-3.5" />{{ link.c[0]!.by }}</span>
          beats
          <span class="inline-flex items-center gap-1"><ElementIcon :element="link.c[0]!.threat" class="h-3.5 w-3.5" />{{ link.c[0]!.threat }}</span>
        </span></span>
      <span v-else class="min-w-0 leading-tight"><span class="block text-sm font-bold text-ink">Doesn't cover {{ prev!.name }}</span>
        <span class="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-fog">
          Doesn't beat
          <template v-if="link.threats.length">
            <template v-for="(t, n) in link.threats" :key="t">
              <template v-if="n">or</template>
              <span class="inline-flex items-center gap-1"><ElementIcon :element="t" class="h-3.5 w-3.5" />{{ t }}</span>
            </template>
          </template>
          <template v-else>its weakness</template>
        </span></span>
    </div>
  </template>
</template>
