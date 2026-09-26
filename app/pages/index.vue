<script setup lang="ts">
// The field guide: every miscrit, filtered by name, place, element, day, stat and rarity. A card opens the miscrit's
// own page (pages/index/miscrit/[slug].vue) in the dialog here, over the list, which stays as it was.
definePageMeta({
  chapter: 'field',
  scrollToTop: (_to, from) => !String(from.name ?? '').startsWith('index'),
})
useSeoMeta({
  title: 'Miscrits Field Guide',
  description: 'Where every miscrit spawns, the weekdays it doesn\'t, and its evolutions, stats and moves. An unofficial Miscrits field guide.',
})

const MISCRITS = useMiscritList()
const route = useRoute()
const router = useRouter()
const today = useToday()

// Select options with icons and bars need a browser that parses them (appearance: base-select); a server-rendered
// option would lose its markup in any other browser and fail hydration. They are plain words until mount.
const rich = ref(false)
// On a miscrit's page the list behind the dialog is left to the browser, so 425 prerendered pages don't each carry
// the whole grid. The field guide's own page renders it, which is where search engines find every miscrit.
const listReady = ref(!route.params.slug)

const state = reactive({ q: '', zone: '', element: '', day: '', stat: '', rarities: new Set<string>() })

const zones = [...new Set(MISCRITS.flatMap(m => m.spots.map(s => s.zone)))].sort()
// A single element also matches the mixed miscrits that include it; the Mixed group picks mixed miscrits exactly
// ("=FireWind") or all of them ("mixed").
const elements = [...new Set(MISCRITS.flatMap(m => parts(m.element)))].sort()
const mixed = [...new Set(MISCRITS.map(m => m.element).filter(e => parts(e).length > 1))]
  .sort((a, b) => parts(a).join(' ').localeCompare(parts(b).join(' ')))
const matchesElement = (el: string, v: string) =>
  !v || (v === 'mixed' ? parts(el).length > 1 : v[0] === '=' ? el === v.slice(1) : parts(el).includes(v))

// "spd:4" keeps miscrits whose Speed is Max or better.
const STAT_ORDER = ['hp', 'spd', 'pa', 'pd', 'ea', 'ed'] as const
const LEVEL_NAMES = Object.keys(STAT_LEVEL)
// The closed field has room for the tile, a short name and the bar; the full name stays for screen readers.
const STAT_SHORT = { hp: 'Health', spd: 'Speed', pa: 'Phys. atk', pd: 'Phys. def', ea: 'Elem. atk', ed: 'Elem. def' }
const statGroups = STAT_ORDER.map((k) => {
  const s = STAT_GRID.find(x => x.k === k)!
  return { ...s, hue: STAT_HUE[s.col] }
})

const rarityCounts = Object.keys(RARITY).map(r => ({ r, n: MISCRITS.filter(m => m.rarity === r).length }))

const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// A number is read with the word before it: "forest 1" means Forest 1, not Forest 2 and Cave 1.
const queryTests = (terms: string[]) => terms.map((t, i) => /^\d+$/.test(t) && i
  ? ((re: RegExp) => (hay: string) => re.test(hay))(new RegExp(`${reEsc(terms[i - 1]!)}[^|]*\\s${t}(?!\\d)`))
  : (hay: string) => hay.includes(t))

const shown = computed(() => {
  const q = queryTests(state.q.trim().toLowerCase().split(/\s+/).filter(Boolean))
  const day = state.day === '' ? null : Number(state.day)
  // With a location picked, the day has to be one it spawns there, not somewhere else.
  const inZone = (s: { zone: string }) => !state.zone || s.zone === state.zone
  return MISCRITS.filter(m =>
    q.every(test => test(m.hay))
    && (!state.zone || m.spots.some(inZone))
    && matchesElement(m.element, state.element)
    && (!state.stat || (STAT_LEVEL[m.stats[state.stat.split(':')[0] as keyof typeof m.stats]] ?? 0) >= Number(state.stat.split(':')[1]))
    && (!state.rarities.size || state.rarities.has(m.rarity))
    && (day === null || m.spots.some(s => inZone(s) && spawnsOn(s, day))))
})

function toggleRarity(r: string) {
  if (state.rarities.has(r)) state.rarities.delete(r)
  else state.rarities.add(r)
}

const search = ref<HTMLInputElement>()
function reset() {
  Object.assign(state, { q: '', zone: '', element: '', day: '', stat: '' })
  state.rarities.clear()
  // The button hides with the empty state, so focus goes to the search it just cleared.
  search.value?.focus()
}

// Detail dialog
const dialog = ref<HTMLDialogElement>()
const live = ref('')
// The miscrit last shown, so closing returns focus to its card.
let lastSlug = ''
// Set by previous/next, so the next miscrit keeps focus on the button pressed.
let stepFocus: -1 | 1 | null = null

const isDetail = () => !!router.currentRoute.value.params.slug

// Opening pushed the detail, so closing goes back to the list's history entry. A detail reached some other way
// (a shared link) leaves for the list in place.
function leave() {
  if (!isDetail()) return
  const back = window.history.state?.back
  if (typeof back === 'string' && router.resolve(back).name === 'index') router.back()
  else router.replace('/')
}

// A pointer close plays a short exit; a keyboard close (detail 0, or Escape) is instant.
function close(animate: boolean) {
  const el = dialog.value
  if (!el?.open) return leave()
  if (!animate || el.classList.contains('closing')) return el.close()
  el.classList.add('closing')
  const done = () => {
    el.classList.remove('closing')
    if (el.open) el.close()
  }
  el.addEventListener('animationend', done, { once: true })
  setTimeout(done, 260) // in case no animation runs
}

function step(dir: -1 | 1, fromButton = false) {
  const slug = router.currentRoute.value.params.slug
  const at = shown.value.findIndex(x => x.slugs[0] === slug)
  const to = at >= 0 ? shown.value[at + dir] : undefined
  if (!to) return
  stepFocus = fromButton ? dir : null
  // Stepping replaces the entry, so back still closes the detail.
  router.replace(`/miscrit/${to.slugs[0]}`)
}

function shownDetail() {
  const el = dialog.value
  if (!el) return
  lastSlug = String(router.currentRoute.value.params.slug ?? '')
  if (!el.open) el.showModal()
  el.scrollTop = 0
  // Pressing previous/next again should not need a trip back from the heading.
  const btn = stepFocus !== null && el.querySelector<HTMLButtonElement>(`[data-step="${stepFocus}"]:not(:disabled)`)
  if (btn) {
    btn.focus()
    const at = shown.value.findIndex(x => x.slugs[0] === lastSlug)
    live.value = `${shown.value[at]?.names[0]}, ${at + 1} of ${shown.value.length}`
  }
  else {
    el.querySelector<HTMLElement>('#detail-name')?.focus()
  }
  stepFocus = null
}

function onClose() {
  live.value = ''
  leave()
  // After stepping with previous/next, return focus to the card of the miscrit last shown.
  const card = lastSlug && document.querySelector<HTMLElement>(`#grid [data-open="${lastSlug}"]`)
  if (card) {
    card.focus({ preventScroll: true })
    card.scrollIntoView({ block: 'nearest' })
  }
}

function onDialogKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement).matches('input, select, textarea') || e.altKey || e.ctrlKey || e.metaKey) return
  if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
  if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
}

// Back from a detail to the list closes the dialog.
watch(() => route.params.slug, (slug) => {
  if (!slug && dialog.value?.open) dialog.value.close()
})

provideFieldGuide({ shown, step, close, shownDetail, announce: (text) => { live.value = text } })

function onKey(e: KeyboardEvent) {
  if (e.key === '/' && !dialog.value?.open && document.activeElement !== search.value) {
    e.preventDefault()
    search.value?.focus()
  }
}

onMounted(() => {
  rich.value = true
  listReady.value = true
  addEventListener('keydown', onKey)
})
// Old links to the static page (index.html#flue) named the miscrit in the hash. Waits for hydration: the router
// ignores a navigation made while its first one is still settling.
onNuxtReady(() => {
  const legacy = location.hash.slice(1)
  if (legacy && MISCRITS.some(m => m.slugs[0] === legacy)) router.replace(`/miscrit/${legacy}`)
})
onBeforeUnmount(() => removeEventListener('keydown', onKey))
</script>

<template>
  <div>
    <div id="filters" class="z-10 border-b border-ink/10 bg-paper/95 backdrop-blur md:sticky md:top-[var(--bar-h,0px)]">
      <div class="mx-auto max-w-7xl px-4 pt-5 pb-4 sm:px-6">
        <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h1 class="chapter font-display text-3xl tracking-tight sm:text-4xl" style="font-weight:700">Miscrits field guide</h1>
          <p class="text-sm text-fog">Where each miscrit lives, and the days it doesn't show. <span v-if="today !== null">Today is {{ DAYS[today] }}.</span></p>
        </div>

        <div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label class="relative block flex-1">
            <span class="sr-only">Search miscrits</span>
            <svg class="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-fog" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              ref="search" v-model="state.q" type="search" autocomplete="off" placeholder="Name, evolution, or place like Forest 1"
              class="w-full rounded-2xl border border-line bg-card py-3 pr-4 pl-11 text-base shadow-xs placeholder:text-fog"
            >
          </label>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            <select v-model="state.zone" class="min-w-0 rounded-xl border border-line bg-card px-3 py-2.5 text-sm lg:w-44" aria-label="Location">
              <button v-if="rich" type="button"><selectedcontent /></button>
              <option value="">Anywhere</option>
              <!-- Each zone leads with the cards' location pin. -->
              <option v-for="z in zones" :key="z" :value="z">
                <template v-if="rich"><PinIcon class="opt-icon" /><span class="opt-text">{{ z }}</span></template>
                <template v-else>{{ z }}</template>
              </option>
            </select>
            <select v-model="state.element" class="min-w-0 rounded-xl border border-line bg-card px-3 py-2.5 text-sm lg:w-44" aria-label="Element">
              <button v-if="rich" type="button"><selectedcontent /></button>
              <option value="">Any element</option>
              <optgroup label="Element">
                <option v-for="e in elements" :key="e" :value="e">
                  <template v-if="rich"><ElementIcon :element="e" class="opt-icon" /><span class="opt-text">{{ e }}</span></template>
                  <template v-else>{{ e }}</template>
                </option>
              </optgroup>
              <optgroup label="Mixed">
                <option value="mixed">
                  <span v-if="rich" class="opt-text">Any mixed element</span><template v-else>Any mixed element</template>
                </option>
                <option v-for="e in mixed" :key="e" :value="`=${e}`">
                  <template v-if="rich"><ElementIcon :element="e" class="opt-icon" /><span class="opt-text">{{ parts(e).join(' + ') }}</span></template>
                  <template v-else>{{ parts(e).join(' + ') }}</template>
                </option>
              </optgroup>
            </select>
            <select v-model="state.day" class="min-w-0 rounded-xl border border-line bg-card px-3 py-2.5 text-sm lg:w-40" aria-label="Findable on">
              <button v-if="rich" type="button"><selectedcontent /></button>
              <option value="">Any day</option>
              <!-- Each day is a lit week-strip cell; the letter is drawn from data-l so plain-text lists read just the day. -->
              <option v-for="(d, i) in DAYS" :key="d" :value="String(i)">
                <template v-if="rich">
                  <span class="opt-day day-on" :class="{ 'day-today': i === today }" :data-l="d[0]" aria-hidden="true" /><span class="opt-text">{{ d }}</span>
                  <span v-if="i === today" class="opt-tag"><span class="opt-paren">(</span>today<span class="opt-paren">)</span></span>
                </template>
                <template v-else>{{ d }}</template>
              </option>
            </select>
            <select v-model="state.stat" class="min-w-0 rounded-xl border border-line bg-card px-3 py-2.5 text-sm lg:w-44" aria-label="Minimum stat">
              <button v-if="rich" type="button"><selectedcontent /></button>
              <option value="">Any stats</option>
              <!-- In the list a row is the bar and the level, under a group head in the stat's colour. The words read
                   "Speed: Strong or better", which is all a browser without rich options shows. -->
              <optgroup v-for="g in statGroups" :key="g.k" :label="g.label" :style="{ color: g.hue.text }">
                <legend v-if="rich"><StatTile :icon="g.icon" :hue="g.hue" class="opt-tile opt-head" />{{ g.label }}</legend>
                <option v-for="n in [2, 3, 4, 5]" :key="n" :value="`${g.k}:${n}`">
                  <template v-if="rich">
                    <StatTile :icon="g.icon" :hue="g.hue" class="opt-tile" /><span class="sr-only">{{ g.label }}: </span><span class="opt-short" :data-t="STAT_SHORT[g.k]" aria-hidden="true" />
                    <span class="opt-meter" aria-hidden="true"><span v-for="i in 5" :key="i" :style="segmentStyle(i <= n, g.hue)" /></span>
                    <span class="opt-level">{{ LEVEL_NAMES[n - 1] }}<span v-if="n < 5" class="opt-more"> or better</span></span>
                  </template>
                  <template v-else>{{ g.label }}: {{ LEVEL_NAMES[n - 1] }}{{ n < 5 ? ' or better' : '' }}</template>
                </option>
              </optgroup>
            </select>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Rarity">
            <button
              v-for="{ r, n } in rarityCounts" :key="r" type="button" :aria-pressed="state.rarities.has(r)"
              class="chip press inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm"
              @click="toggleRarity(r)"
            >
              <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: RARITY[r]!.ring }" aria-hidden="true" /><span>{{ r }}</span><span class="chip-count text-fog tabular-nums">{{ n }}</span>
            </button>
          </div>
          <p class="ml-auto text-sm text-fog" aria-live="polite">{{ shown.length }} of {{ MISCRITS.length }} miscrits</p>
        </div>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-6">
      <ul v-if="listReady" id="grid" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li v-for="m in shown" :key="m.id"><MiscritCard :m="m" :today="today" /></li>
      </ul>
      <div v-if="!shown.length" class="py-24 text-center">
        <p class="font-display text-2xl">No miscrit matches that.</p>
        <p class="mt-2 text-fog">Try fewer filters, or search part of a name.</p>
        <button type="button" class="mt-5 rounded-xl bg-ink px-4 py-2.5 text-sm text-on" @click="reset">Clear filters</button>
      </div>
    </main>

    <dialog
      ref="dialog" class="overflow-y-auto bg-card p-0 text-ink shadow-2xl" aria-labelledby="detail-name"
      @close="onClose" @keydown="onDialogKey" @click="$event.target === dialog && close($event.detail > 0)"
    >
      <NuxtPage />
      <p class="sr-only" aria-live="polite">{{ live }}</p>
    </dialog>
  </div>
</template>
