<script setup lang="ts">
import type { Miscrit } from '#shared/types/miscrit'

// One miscrit, shown in the field guide's dialog over the list (pages/index.vue owns the dialog). Each miscrit is its
// own prerendered page, so a link opens it straight away and search engines see every line.
definePageMeta({
  chapter: 'field',
  // Opening, stepping and closing the detail keeps the list where it was.
  scrollToTop: (_to, from) => !String(from.name ?? '').startsWith('index'),
})

const route = useRoute()
const slug = route.params.slug as string
const guide = useFieldGuide()
const listed = useMiscritList().find(x => x.slugs[0] === slug)

// A fixed key, so the teams page can read this miscrit from the page's prerendered payload (miscritPayloadKey).
const { data, error, refresh, status } = await useFetch<Miscrit>(`/api/miscrits/${slug}`, { key: miscritPayloadKey(slug) })
// A miscrit that doesn't exist is the error page. Any other failure in the browser (a dropped connection) keeps the
// dialog and offers a retry; while prerendering it fails the build instead.
if (!data.value && (!listed || !error.value || error.value.statusCode === 404 || import.meta.server))
  throw createError({ statusCode: error.value?.statusCode ?? 404, statusMessage: 'No such miscrit', fatal: true })

const name = listed?.names[0] ?? slug
useSeoMeta({
  title: `${name} - Miscrits Field Guide`,
  description: () => data.value
    ? `Where ${name} spawns in Miscrits and on which days, with its evolutions (${data.value.names.slice(1).join(', ')}), stats and twelve moves.`
    : undefined,
  ogTitle: `${name} - Miscrits Field Guide`,
  ogDescription: () => data.value
    ? `Where ${name} spawns in Miscrits and on which days, with its evolutions, stats and twelve moves.`
    : undefined,
  ogImage: `https://cdn.worldofmiscrits.com/miscrits/${slug}_back.png`,
})

// Opened from a link while the filters hide it, there is no place in the list to step from.
const at = computed(() => guide.shown.value.findIndex(x => x.slugs[0] === slug))
const neighbour = (dir: -1 | 1) => (at.value >= 0 ? guide.shown.value[at.value + dir]?.names[0] : undefined)

// The detail opens the dialog once it mounts; a failed load has to open it for the retry.
onMounted(() => {
  if (!data.value) guide.shownDetail()
})
</script>

<template>
  <MiscritDetail
    v-if="data"
    :m="data" :at="at" :total="guide.shown.value.length" :prev="neighbour(-1)" :next="neighbour(1)"
    @step="guide.step" @close="guide.close" @announce="guide.announce" @shown="guide.shownDetail"
  />
  <div v-else class="p-5">
    <div class="flex items-start justify-between gap-3">
      <h2 id="detail-name" tabindex="-1" class="pt-2 font-display text-xl font-bold sm:text-2xl">Couldn't load {{ name }}</h2>
      <button type="button" class="icon-btn press grid h-11 w-11 shrink-0 place-items-center rounded-full" aria-label="Close" @click="guide.close($event.detail > 0)">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>
    <p class="mt-2 text-fog">Check your connection, then try again.</p>
    <button
      type="button" class="press mt-4 min-h-11 rounded-xl bg-ink px-4 py-2.5 text-sm text-on" :aria-busy="status === 'pending'"
      :disabled="status === 'pending'" @click="refresh()"
    >
      {{ status === 'pending' ? 'Trying again…' : 'Try again' }}
    </button>
  </div>
</template>
