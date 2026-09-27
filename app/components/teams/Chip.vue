<script setup lang="ts">
// A named miscrit as a small inline chip: avatar, name, element.
defineProps<{ entry: TeamEntry, withRole?: boolean }>()
</script>

<template>
  <span class="inline-flex min-w-0 items-center gap-2 rounded-2xl bg-leaf py-1 pl-1 pr-3">
    <TeamsFramed :entry="entry" :size="34" />
    <span class="min-w-0"><span class="block truncate font-display text-base leading-tight">{{ entry.name }}</span>
      <span class="flex items-center gap-1 text-xs text-fog"><ElementIcon :element="entry.m.element" class="h-3.5 w-3.5" />{{ parts(entry.m.element).join(' and ') }}{{ withRole ? `, ${teamRole(entry.m).label.toLowerCase()}` : '' }}</span></span>
  </span>
</template>
