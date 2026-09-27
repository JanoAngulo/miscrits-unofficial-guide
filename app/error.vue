<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const route = useRoute()
const missing = computed(() => props.error.statusCode === 404)
useHead({ title: () => (missing.value ? 'Page not found' : 'Something went wrong') })

const GUIDES = [
  { to: '/catch', chapter: 'catch', name: 'Catching', note: 'Read stats from a catch rate' },
  { to: '/breed', chapter: 'breed', name: 'Breeding', note: 'What two miscrits can hatch' },
  { to: '/teams', chapter: 'teams', name: 'Teams and PvP', note: 'Build and check a team' },
  { to: '/relics', chapter: 'relics', name: 'Relics and bonus', note: 'Relic builds per miscrit' },
]

// The path that failed, kept per error: clearError changes the route before the next page has loaded, and this
// page would otherwise rename itself after the link that was just chosen.
const path = ref(route.path)
const going = ref<string | null>(null)
watch(() => props.error, () => {
  path.value = route.path
  going.value = null
})

// A dead link usually names a miscrit (/miscrit/afterburm, an old page#flue), so the last part of the path is read
// as a name and the closest ones are offered. Every form of a line counts; the link opens the line's page.
const wanted = computed(() => {
  let last = path.value.split('/').filter(Boolean).pop() ?? ''
  try { last = decodeURIComponent(last) } catch {}
  return last.replace(/\.html?$/i, '').replace(/[-_\s]+/g, ' ').trim().toLowerCase()
})

function distance(a: string, b: string) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(row[j]! + 1, next[j - 1]! + 1, row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
    row = next
  }
  return row[b.length]!
}

const suggestions = computed(() => {
  const w = wanted.value
  if (!missing.value || w.length < 3) return []
  const limit = Math.max(2, Math.floor(w.length / 3))
  const best = new Map<string, { slug: string, avatar: string, name: string, base: string, score: number }>()
  for (const m of useMiscritList()) {
    m.names.forEach((n, i) => {
      const name = n.toLowerCase()
      const score = name === w ? 0 : name.startsWith(w) || w.startsWith(name) ? 1 : name.includes(w) ? 2 : 3 + distance(w, name)
      if (score > 2 && score - 3 > limit) return
      const seen = best.get(m.slugs[0]!)
      if (!seen || score < seen.score) best.set(m.slugs[0]!, { slug: m.slugs[0]!, avatar: m.slugs[i]!, name: n, base: m.names[0]!, score })
    })
  }
  return [...best.values()].sort((a, b) => a.score - b.score || a.name.localeCompare(b.name)).slice(0, 3)
})

// The error page sits outside the router's view, so a plain link would leave the error showing. Modified clicks
// (new tab, new window) keep the browser's own handling. The page stays up until the next one has its data, so the
// chosen link says it is opening.
function go(e: MouseEvent, to: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  if (going.value) return
  going.value = to
  clearError({ redirect: to }).catch(() => { going.value = null })
}
const retry = () => location.reload()
</script>

<template>
  <NuxtLayout>
    <main class="mx-auto min-h-[60vh] max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
      <div class="max-w-2xl">
        <p class="text-sm font-bold text-fog">
          Error {{ error.statusCode }}<template v-if="missing">
            <span aria-hidden="true"> · </span><span class="sr-only">at </span><code class="break-all font-body font-normal">{{ path }}</code>
          </template>
        </p>
        <h1 class="chapter mt-2 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {{ missing ? 'No page here' : 'Something went wrong' }}
        </h1>
        <p class="mt-3 max-w-prose text-pretty text-fog">
          <template v-if="missing">The link may be old, or the miscrit's name spelled differently.</template>
          <template v-else>The page didn't load. Check your connection and try again.</template>
        </p>

        <section v-if="suggestions.length" aria-labelledby="error-guess" class="mt-8">
          <h2 id="error-guess" class="font-display text-lg font-bold">Did you mean</h2>
          <ul class="mt-3 grid gap-2 sm:grid-cols-3">
            <li v-for="s in suggestions" :key="s.slug">
              <a
                :href="`/miscrit/${s.slug}`"
                :aria-busy="going === `/miscrit/${s.slug}` || undefined"
                class="press flex min-h-14 items-center gap-3 rounded-xl border border-line bg-card px-3 py-2 hover:bg-leaf"
                @click="go($event, `/miscrit/${s.slug}`)"
              >
                <MiscritImg :slug="s.avatar" class="h-10 w-10 shrink-0 object-contain" width="40" height="40" />
                <span class="min-w-0">
                  <span class="block truncate font-display font-bold">{{ s.name }}</span>
                  <span v-if="going === `/miscrit/${s.slug}`" class="block truncate text-xs text-fog">Opening…</span>
                  <span v-else-if="s.name !== s.base" class="block truncate text-xs text-fog">{{ s.base }} line</span>
                </span>
              </a>
            </li>
          </ul>
        </section>

        <div class="mt-8 flex flex-wrap gap-2">
          <button
            v-if="!missing" type="button"
            class="press min-h-11 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-on"
            @click="retry"
          >
            Try again
          </button>
          <a
            href="/"
            :aria-busy="going === '/' || undefined"
            class="press inline-flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-bold"
            :class="missing ? 'bg-ink text-on' : 'border border-line bg-card hover:bg-leaf'"
            @click="go($event, '/')"
          >
            {{ missing ? 'Search the field guide' : 'Go to the field guide' }}
          </a>
        </div>

        <nav aria-labelledby="error-guides" class="mt-12 border-t border-ink/10 pt-6">
          <h2 id="error-guides" class="text-sm font-bold text-fog">Or open a guide</h2>
          <ul class="mt-3 grid gap-2 sm:grid-cols-2">
            <li v-for="g in GUIDES" :key="g.to">
              <a
                :href="g.to"
                :aria-busy="going === g.to || undefined"
                class="press flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 hover:bg-leaf"
                @click="go($event, g.to)"
              >
                <span class="nav-dot" :style="{ background: `var(--chf-${g.chapter})` }" aria-hidden="true" />
                <span>
                  <span class="block font-bold">{{ g.name }}</span>
                  <span class="block text-sm text-fog">{{ going === g.to ? 'Opening…' : g.note }}</span>
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  </NuxtLayout>
</template>
