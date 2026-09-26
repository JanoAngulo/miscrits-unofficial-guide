<script setup lang="ts">
// Placeholder until the field guide is ported (step 2): proves the data route, the layout and <MiscritImg>.
useHead({ title: 'Miscrits Field Guide' })
const { data } = await useFetch('/api/miscrits', {
  transform: list => list.slice(0, 12).map(m => ({ id: m.id, name: m.names[0]!, slug: m.slugs[0]! })),
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-6">
    <h1 class="chapter font-display text-3xl tracking-tight sm:text-4xl" style="font-weight:700">Miscrits field guide</h1>
    <ul class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      <li v-for="m in data" :key="m.id" class="flex flex-col items-center gap-2 rounded-2xl border border-line bg-card p-4">
        <MiscritImg :slug="m.slug" class="h-20 w-20 object-contain" />
        <span class="font-display">{{ m.name }}</span>
      </li>
    </ul>
  </main>
</template>
