<script setup lang="ts">
import type { CatchRarity } from '~/utils/catch'

// The catching guide: a wild miscrit's catch rate at full health gives away its score, so tapping the rate seen
// reads its rating, its likely stat colours and how rare the roll is. Everything here is the game's published
// catch, stat and encounter tables, not the miscrit feed.
definePageMeta({ chapter: 'catch' })
useSeoMeta({
  title: 'Catching Guide',
  description: 'Read a wild miscrit\'s stats from its catch rate at full health, before you spend a capture.',
})

type RarityKey = CatchRarity
type Hp = 'full' | 'low'

const RATINGS = ['F-', 'F', 'F+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+']
const RARITIES = (['common', 'rare', 'epic', 'exotic', 'legendary'] as const).map((k) => {
  const name = k[0]!.toUpperCase() + k.slice(1)
  const look = rarityLook(name)
  return { k: k as RarityKey, name, ring: look.ring, text: look.text, wash: look.bg }
})
const R = Object.fromEntries(RARITIES.map(r => [r.k, r])) as Record<RarityKey, typeof RARITIES[number]>

// Catch rate (%) for scores 0 to 12, from the catch rate table. null: the table gives none.
const RATE: Record<Hp, Partial<Record<RarityKey, (number | null)[]>>> = {
  full: {
    common: [45, 43, 42, 40, 39, 37, 36, 34, 33, 31, 30, 28, 27],
    rare: [35, 33, 32, 30, 29, 27, 26, 24, 23, 21, 20, 18, 17],
    epic: [25, 23, 22, 20, 19, 17, 16, 14, 13, 11, 10, 8, 7],
    exotic: [15, 13, 12, 10, 9, 7, 6, 4, 3, 1, 1, 1, 1],
  },
  low: {
    exotic: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 99, 97, 96],
    legendary: [null, null, null, null, null, null, 95, 93, 92, 90, 89, 87, 86],
  },
}
// Chance (%) a caught miscrit's stat rolls red, white, green. Legendaries have no red.
const STAT_ODDS: Record<RarityKey, [number, number, number]> = {
  common: [32, 27, 41], rare: [16, 27, 57], epic: [11, 26, 63], exotic: [8, 24, 68], legendary: [0, 28, 72],
}
const SPLUS = CATCH_SPLUS
const ENCOUNTER = CATCH_ENCOUNTER
const HP: [Hp, string][] = [['full', 'Full health'], ['low', '1% health']]

// Every way six stats can land on a score: g green, w white, r red, weighted by the stat odds.
interface Split { g: number, w: number, r: number, p: number }
const FACT = [1, 1, 2, 6, 24, 120, 720]
function splits(rarity: RarityKey, score: number) {
  const [pr, pw, pg] = STAT_ODDS[rarity].map(v => v / 100) as [number, number, number]
  const out: Split[] = []
  for (let g = 0; g <= 6; g++) {
    const w = score - 2 * g, r = 6 - g - w
    if (w < 0 || r < 0) continue
    const p = FACT[6]! / (FACT[g]! * FACT[w]! * FACT[r]!) * pg ** g * pw ** w * pr ** r
    if (p > 0) out.push({ g, w, r, p })
  }
  return out
}
const SCORE_P = Object.fromEntries(RARITIES.map(r => [r.k, RATINGS.map((_, s) => splits(r.k, s).reduce((t, x) => t + x.p, 0))])) as Record<RarityKey, number[]>

function pct(p: number) {
  const v = p * 100
  if (v === 0) return '0%'
  if (v < 0.01) return '<0.01%'
  if (v < 1) return `${v.toFixed(2)}%`
  if (v < 10) return `${v.toFixed(1)}%`
  return `${Math.round(v)}%`
}
const tier = (s: number) => ({ fill: catchTierFill(s) })
const rangeWords = (scores: number[]) => scores.length === 1 ? RATINGS[scores[0]!]! : `${RATINGS[scores[0]!]} to ${RATINGS[scores.at(-1)!]}`
const spoken = (t: string) => t.replace(/\+/g, ' plus').replace(/-/g, ' minus')
const pluralName = (n: string) => n === 'Legendary' ? 'Legendaries' : `${n}s`
const hasHp = (rarity: RarityKey, hp: Hp) => Boolean(RATE[hp]?.[rarity])

// The rate keys for one rarity and health: each distinct rate, with the scores it can mean.
function keys(rarity: RarityKey, hp: Hp) {
  const col = RATE[hp][rarity] || []
  const out: { v: number, scores: number[] }[] = []
  col.forEach((v, s) => {
    if (v == null) return
    const k = out.find(o => o.v === v)
    if (k) k.scores.push(s)
    else out.push({ v, scores: [s] })
  })
  return out
}

const KEY = 'miscripedia.catch'
const state = reactive<{ rarity: RarityKey, hp: Hp, rate: number | null }>({ rarity: 'rare', hp: 'full', rate: null })
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }

const rateKeys = computed(() => keys(state.rarity, state.hp))
const hpHelp = computed(() => state.rarity === 'legendary'
  ? 'Legendary rates are only listed at 1% health.'
  : state.rarity === 'exotic'
    ? (state.hp === 'full' ? 'Read it before you deal any damage.' : 'Take it down to 1% health first.')
    : `${R[state.rarity].name} rates are only listed at full health. Read it before you deal any damage.`)

function pickRarity(k: RarityKey) {
  state.rarity = k
  if (!hasHp(k, state.hp)) state.hp = hasHp(k, 'full') ? 'full' : 'low'
  state.rate = null
}
function pickHp(hp: Hp) {
  state.hp = hp
  state.rate = null
}

const splitWords = (s: Split) => ([[s.g, 'green'], [s.w, 'white'], [s.r, 'red']] as [number, string][])
  .filter(([n]) => n).map(([n, w]) => `${n} ${w}`).join(', ')
const strip = (s: Split) => [...Array(s.g).fill(2), ...Array(s.w).fill(1), ...Array(s.r).fill(0)] as number[]

function scoreLine(scores: number[]) {
  if (scores.length > 1) return `Score ${scores[0]} to ${scores.at(-1)} of 12`
  return `Score ${scores[0]} of 12`
}
function scoreNote(scores: number[]) {
  if (scores.length > 1) return null
  const s = scores[0]!
  if (s === 12) return 'Every stat green. As good as it gets.'
  if (s === 0) return 'Every stat red.'
  return `${12 - s} point${12 - s === 1 ? '' : 's'} short of all green.`
}

const reading = computed(() => {
  const { rarity, hp, rate } = state
  const key = rateKeys.value.find(k => k.v === rate)
  if (!key) return null
  const scores = key.scores
  const all = scores.flatMap(s => splits(rarity, s))
  const ps = SCORE_P[rarity]
  return {
    r: R[rarity],
    hpWords: hp === 'full' ? 'full health' : '1% health',
    scores,
    multi: scores.length > 1,
    all,
    total: all.reduce((t, x) => t + x.p, 0),
    top: [...all].sort((a, b) => b.p - a.p).slice(0, 3),
    pThis: scores.reduce((t, s) => t + ps[s]!, 0),
    pBetter: ps.slice(scores[0]).reduce((t, p) => t + p, 0),
    note: scoreNote(scores),
    perfect: scores.length === 1 && scores[0] === 12,
    oneTier: catchTierFill(scores[0]!) === catchTierFill(scores.at(-1)!),
    // A rate several ratings share points at the other health, where they come apart.
    narrow: scores.length > 1 ? (rarity === 'exotic' && hp === 'full' ? 'low' : 'full') as Hp : null,
    // The chart: each score's chance, scaled to the likeliest.
    ps,
    max: Math.max(...ps),
    on: new Set(scores),
    // The same chances as a list, best rating first, so every value shows without hovering a bar.
    shares: ps.map((p, s) => ({ p, s })).filter(x => x.p).reverse(),
  }
})

const live = computed(() => {
  const v = reading.value
  return v ? `${v.r.name} at ${v.hpWords}, ${state.rate}%: ${spoken(rangeWords(v.scores))}, ${scoreLine(v.scores).toLowerCase()}.` : ''
})

// A new reading swaps the card, so it settles in again.
const readingKey = computed(() => `${state.rarity}-${state.hp}-${state.rate}`)

const form = ref<HTMLFormElement>()
async function readAt(hp: Hp) {
  state.hp = hp
  state.rate = null
  await nextTick()
  form.value?.querySelector<HTMLInputElement>('input[name=rate]')?.focus({ preventScroll: false })
}

const COLS: { hp: Hp, r: RarityKey }[] = [
  { hp: 'full', r: 'common' }, { hp: 'full', r: 'rare' }, { hp: 'full', r: 'epic' }, { hp: 'full', r: 'exotic' },
  { hp: 'low', r: 'exotic' }, { hp: 'low', r: 'legendary' },
]
const hit = computed(() => new Set(rateKeys.value.find(k => k.v === state.rate)?.scores ?? []))

const wrap = ref<HTMLDivElement>()
const hintHidden = ref(true)
const scrolled = ref(false)
const more = ref(false)
const stick = ref<string>()

function edgeState() {
  const w = wrap.value
  if (!w) return
  scrolled.value = w.scrollLeft > 0
  more.value = w.scrollLeft + w.clientWidth < w.scrollWidth - 1
}
function onResize() {
  const w = wrap.value
  if (!w) return
  hintHidden.value = w.scrollWidth <= w.clientWidth + 1
  edgeState()
}
function placeTable() {
  const w = wrap.value
  if (!w) return
  hintHidden.value = w.scrollWidth <= w.clientWidth + 1
  const cell = w.querySelector<HTMLElement>('tr.hit td.col-on') || w.querySelector<HTMLElement>('td.col-on')
  const col = w.querySelector<HTMLElement>('tbody .sticky-col')
  if (col) stick.value = `${col.offsetWidth}px`
  if (cell && col) {
    // Stop on a column edge: the column left of the reading is either fully shown or fully hidden.
    const need = cell.offsetLeft + cell.offsetWidth - w.clientWidth
    const edges = [...cell.parentElement!.children].slice(1).map(c => (c as HTMLElement).offsetLeft - col.offsetWidth)
    w.scrollLeft = need <= 0 ? 0 : edges.find(e => e >= need) ?? need
  }
  edgeState()
}
watch(() => [state.rarity, state.hp, state.rate], placeTable, { flush: 'post' })
watch(state, save)

onMounted(() => {
  // Read after hydration: the prerendered page shows the default reading.
  let saved: { rarity?: unknown, hp?: unknown, rate?: unknown } | null = null
  try { saved = JSON.parse(localStorage.getItem(KEY)!) || null } catch { saved = null }
  const rarity = saved?.rarity as RarityKey, hp = saved?.hp as Hp
  if (saved && Object.hasOwn(R, rarity) && (hp === 'full' || hp === 'low') && hasHp(rarity, hp))
    Object.assign(state, { rarity, hp, rate: typeof saved.rate === 'number' ? saved.rate : null })
  addEventListener('resize', onResize)
  nextTick(placeTable)
})
onBeforeUnmount(() => {
  removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="catch-page">
    <div class="border-b border-ink/10">
      <div class="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6">
        <h1 class="chapter font-display text-3xl tracking-tight sm:text-4xl font-bold">Catching guide</h1>
        <p class="mt-2 max-w-2xl text-fog">A wild miscrit's catch rate at full health gives away its stats: the better they are, the harder it is to catch. Tap the rate you see to read its rating before you spend a capture.</p>
        <p class="mt-1 max-w-2xl text-sm text-fog">Rates are from the game's published catch, stat and encounter tables.</p>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6">
      <section aria-labelledby="read-h" class="grid gap-6 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
        <form ref="form" class="rounded-3xl border border-ink/10 bg-card p-4 shadow-[0_1px_2px_rgb(var(--shade)/.06)] sm:p-5" autocomplete="off" @submit.prevent>
          <h2 id="read-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Read a wild miscrit</h2>

          <fieldset class="mt-4">
            <legend class="text-sm font-bold">Rarity</legend>
            <div class="mt-1 grid grid-cols-2 gap-1.5 min-[400px]:grid-cols-3 sm:grid-cols-5 lg:grid-cols-3">
              <label v-for="r in RARITIES" :key="r.k" class="seg block cursor-pointer">
                <input type="radio" name="rarity" :value="r.k" class="sr-only" :checked="state.rarity === r.k" @change="pickRarity(r.k)">
                <span class="press flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line px-2 text-sm font-bold">
                  <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: r.ring }" aria-hidden="true" />{{ r.name }}
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset class="mt-4" aria-describedby="hp-help">
            <legend class="text-sm font-bold">Its health</legend>
            <div class="mt-1 grid grid-cols-2 gap-1.5">
              <label v-for="[v, label] in HP" :key="v" class="seg block cursor-pointer">
                <input
                  type="radio" name="hp" :value="v" class="sr-only"
                  :checked="state.hp === v" :disabled="!hasHp(state.rarity, v)" @change="pickHp(v)"
                >
                <span class="press flex h-11 items-center justify-center rounded-xl border border-line text-sm font-bold">{{ label }}</span>
              </label>
            </div>
            <p id="hp-help" class="mt-1 text-xs text-fog">{{ hpHelp }}</p>
          </fieldset>

          <fieldset class="mt-4">
            <legend class="text-sm font-bold">Catch rate you see</legend>
            <p class="text-xs text-fog">The rating each rate means is under it.</p>
            <div class="mt-2 grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-1.5">
              <label v-for="k in rateKeys" :key="k.v" class="seg block cursor-pointer">
                <input
                  type="radio" name="rate" :value="k.v" class="sr-only" :checked="k.v === state.rate"
                  :aria-label="`${k.v}%, ${spoken(rangeWords(k.scores))}`" @change="state.rate = k.v"
                >
                <span class="press flex h-14 flex-col items-center justify-center rounded-xl border border-line leading-tight">
                  <span class="text-base font-bold">{{ k.v }}%</span>
                  <span class="mt-0.5 whitespace-nowrap text-xs"><span class="rtag" :style="{ background: tier(k.scores[0]!).fill }">{{ RATINGS[k.scores[0]!] }}</span><template v-if="k.scores.length > 1"><span class="sub px-0.5 text-fog">to</span><span class="rtag" :style="{ background: tier(k.scores.at(-1)!).fill }">{{ RATINGS[k.scores.at(-1)!] }}</span></template></span>
                </span>
              </label>
            </div>
          </fieldset>
        </form>

        <div class="min-w-0">
          <div v-if="!reading" class="grid h-full min-h-[18rem] place-items-center rounded-3xl border-2 border-dashed border-line/60 p-6 text-center">
            <div>
              <p class="font-display text-xl">Tap the catch rate you see</p>
              <p class="mx-auto mt-1 max-w-sm text-sm text-fog">{{ state.hp === 'full'
                ? 'Check it at the start of the battle, while the miscrit is still at full health.'
                : 'Bring the miscrit down to 1% health, then check its catch rate.' }}</p>
            </div>
          </div>
          <div v-else :key="readingKey" class="settle rounded-3xl bg-card p-4 shadow-[0_1px_2px_rgb(var(--shade)/.06)] sm:p-5">
            <div class="flex items-center gap-4">
              <span
                class="grid h-24 w-24 shrink-0 place-items-center rounded-[1.25rem] font-display font-bold"
                :class="[reading.oneTier ? 'text-ink-fixed' : 'bg-ink text-on', reading.multi ? 'text-2xl leading-none' : 'text-5xl']"
                :style="reading.oneTier ? { background: tier(reading.scores[0]!).fill, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-ink-fixed) 18%, transparent)' } : undefined"
              >
                <span v-if="reading.multi" class="text-center">{{ RATINGS[reading.scores[0]!] }}<span class="block py-0.5 font-body text-xs font-bold">to</span>{{ RATINGS[reading.scores.at(-1)!] }}</span>
                <template v-else>{{ RATINGS[reading.scores[0]!] }}</template>
              </span>
              <div class="min-w-0">
                <p class="text-sm text-fog"><span class="rounded-full px-2 py-0.5 text-xs font-bold" :style="{ background: reading.r.wash, color: reading.r.text }">{{ reading.r.name }}</span> at {{ reading.hpWords }}, {{ state.rate }}%</p>
                <p class="mt-1 font-display text-2xl leading-tight sm:text-3xl sm:leading-9 font-bold">{{ scoreLine(reading.scores) }}</p>
                <p v-if="reading.note" class="mt-0.5 flex items-center gap-1.5 text-sm" :class="reading.perfect ? 'font-bold text-[var(--q-green-text)]' : 'text-fog'">
                  <svg v-if="reading.perfect" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{{ reading.note }}
                </p>
              </div>
            </div>

            <div v-if="reading.narrow === 'low'" class="mt-4 rounded-2xl bg-leaf p-4">
              <p class="font-bold">Four ratings share this rate</p>
              <p class="mt-0.5 text-sm text-fog">Take it down to 1% health and check again: 100% is A, 99% is A+, 97% is S, 96% is S+.</p>
              <button type="button" class="press mt-3 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-on" @click="readAt('low')">Read it at 1% health</button>
            </div>
            <div v-else-if="reading.narrow === 'full'" class="mt-4 rounded-2xl bg-leaf p-4">
              <p class="font-bold">Ten ratings share this rate</p>
              <p class="mt-0.5 text-sm text-fog">Anything A or lower is a sure catch at 1% health. Its rate at full health tells them apart.</p>
              <button type="button" class="press mt-3 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-on" @click="readAt('full')">Read it at full health</button>
            </div>

            <h3 class="mt-6 font-display text-lg">What its stats likely are</h3>
            <p class="text-xs text-fog">The rate gives the total only, not which stat is which colour.</p>
            <ul class="mt-2 max-w-md space-y-2">
              <li v-for="(s, i) in reading.top" :key="i" class="flex items-center gap-3">
                <span class="grid w-28 shrink-0 grid-cols-6 gap-1 sm:w-40" aria-hidden="true"><span v-for="(q, j) in strip(s)" :key="j" class="q" :class="`q-${q}`" /></span>
                <span class="min-w-0 flex-1 text-sm">{{ splitWords(s) }}<template v-if="reading.multi">{{ ' ' }}<span class="rtag text-xs" :style="{ background: tier(2 * s.g + s.w).fill }">{{ RATINGS[2 * s.g + s.w] }}</span></template></span>
                <span class="text-sm font-bold">{{ pct(s.p / reading.total) }}</span>
              </li>
            </ul>
            <p v-if="reading.all.length > reading.top.length" class="mt-1 text-xs text-fog">{{ reading.all.length - reading.top.length }} rarer mix{{ reading.all.length - reading.top.length === 1 ? '' : 'es' }} not shown.</p>

            <h3 class="mt-6 font-display text-lg">How rare this roll is</h3>
            <p class="text-sm"><strong>{{ pct(reading.pThis) }}</strong> of caught {{ pluralName(reading.r.name) }} score {{ rangeWords(reading.scores) }}<template v-if="reading.scores.at(-1)! < 12 && reading.pBetter < 0.9999">, and <strong>{{ pct(reading.pBetter) }}</strong> score {{ RATINGS[reading.scores[0]!] }} or better</template>.</p>
            <figure class="mt-2">
              <ol class="flex h-36 items-end gap-1 border-b border-line pt-6" :aria-label="`Chance of each rating on a caught ${reading.r.name}`">
                <li v-for="(p, s) in reading.ps" :key="s" class="bar relative flex h-full flex-1 flex-col justify-end">
                  <span class="sr-only">{{ RATINGS[s]!.replace('+', ' plus').replace('-', ' minus') }}: {{ p ? pct(p) : 'not possible' }}{{ reading.on.has(s) ? ', this reading' : '' }}</span>
                  <span v-if="reading.on.has(s) && !reading.multi" class="absolute inset-x-0 text-center text-xs font-bold" :style="{ bottom: `calc(${(p / reading.max) * 100}% + 4px)` }" aria-hidden="true">{{ pct(p) }}</span>
                  <span
                    class="tip absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-bold text-on shadow-[0_6px_16px_-8px_rgb(var(--shade)/.5)]"
                    :style="{ bottom: `calc(${(p / reading.max) * 100}% + 6px)` }" aria-hidden="true"
                  >{{ RATINGS[s] }} &middot; {{ p ? pct(p) : 'not possible' }}</span>
                  <span
                    v-if="p" class="bar-fill block rounded-t-sm" aria-hidden="true"
                    :style="{ height: `${Math.max((p / reading.max) * 100, 1.5)}%`, background: tier(s).fill, boxShadow: reading.on.has(s) ? '0 0 0 2px var(--card), 0 0 0 4px var(--ink)' : 'inset 0 0 0 1px color-mix(in srgb, var(--color-ink-fixed) 20%, transparent)' }"
                  />
                  <span v-else class="never block h-3 rounded-t-sm" aria-hidden="true" />
                </li>
              </ol>
              <ol class="mt-1 flex gap-1" aria-hidden="true">
                <li
                  v-for="(n, s) in RATINGS" :key="n" class="flex-1 text-center text-[11px] font-bold"
                  :class="[reading.on.has(s) ? 'text-ink' : 'text-fog', reading.ps[s] ? '' : 'line-through']"
                >{{ n }}</li>
              </ol>
              <ul class="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
                <li v-for="x in reading.shares" :key="x.s" class="flex items-center gap-1.5 rounded-lg py-1 pl-1 pr-2.5 text-xs font-bold" :class="reading.on.has(x.s) ? 'bg-ink text-on' : 'bg-leaf'"><span class="rtag" :style="{ background: tier(x.s).fill }">{{ RATINGS[x.s] }}</span> {{ pct(x.p) }}</li>
              </ul>
              <figcaption class="mt-2 text-xs text-fog">Chance of each rating on a caught {{ reading.r.name }}. Computed from the stat odds.</figcaption>
            </figure>
          </div>
        </div>
        <p class="sr-only" aria-live="polite">{{ live }}</p>
      </section>

      <section aria-labelledby="table-h" class="mt-14">
        <h2 id="table-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Catch rate by rating</h2>
        <p class="mt-1 max-w-2xl text-fog">Each of a miscrit's six stats rolls red, white or green, worth 0, 1 or 2 points. The total, 0 to 12, is its score. <strong class="text-ink">12/12 is S+, every stat green.</strong></p>
        <p class="mt-4 text-xs font-bold text-fog" :hidden="hintHidden">Swipe the table sideways for more rarities.</p>
        <div
          id="table-wrap" ref="wrap" class="relative mt-2 overflow-x-auto overscroll-x-contain rounded-3xl border border-ink/10 bg-card"
          :class="{ scrolled, more }" :style="stick ? { '--stick': stick } : undefined" @scroll.passive="edgeState"
        >
          <table id="rate-table" class="w-full min-w-[40rem] border-collapse text-sm">
            <caption class="sr-only">Catch rate for each rating, by rarity, at full health and at 1% health</caption>
            <colgroup span="2" /><colgroup span="4" /><colgroup span="2" />
            <thead>
              <!-- pb-px stands in for the browser's 1px cell padding, which the group row's height was drawn on. -->
              <tr class="text-xs text-fog">
                <td class="sticky-col" /><td />
                <th scope="colgroup" colspan="4" class="border-l border-ink/10 px-3 pt-3 pb-px text-left font-bold"><span class="group-label">At full health</span></th>
                <th scope="colgroup" colspan="2" class="border-l border-ink/10 px-3 pt-3 pb-px text-left font-bold"><span class="group-label">At 1% health</span></th>
              </tr>
              <tr class="border-b border-ink/10">
                <th scope="col" class="sticky-col px-3 py-2 text-left font-display text-base">Rating</th>
                <th scope="col" class="px-3 py-2 text-right font-bold">Score</th>
                <th v-for="(c, i) in COLS" :key="i" scope="col" class="px-3 py-2 text-right font-bold" :class="{ 'border-l border-ink/10': i === 0 || i === 4 }">
                  <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: R[c.r].ring }" aria-hidden="true" />{{ R[c.r].name }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(n, s) in RATINGS" :key="n" :class="[hit.has(s) ? 'hit' : '', s < 12 ? 'border-b border-ink/5' : '']">
                <th scope="row" class="sticky-col whitespace-nowrap px-3 py-2 text-left font-display text-base">
                  <span class="rtag min-w-[2.25rem] text-center" :style="{ background: tier(s).fill }">{{ n }}</span><template v-if="s === 0">{{ ' ' }}<span class="font-body text-xs font-bold text-fog">all red</span></template><template v-else-if="s === 12">{{ ' ' }}<span class="font-body text-xs font-bold text-[var(--q-green-text)]">all green</span></template>
                </th>
                <td class="px-3 py-2 text-right text-fog">{{ s }}</td>
                <td
                  v-for="(c, i) in COLS" :key="i" class="px-3 py-2 text-right"
                  :class="{ 'border-l border-ink/10': i === 0 || i === 4, 'col-on': c.r === state.rarity && c.hp === state.hp }"
                >
                  <template v-if="RATE[c.hp][c.r]![s] == null"><span class="never mx-auto block h-4 w-10 rounded-sm" aria-hidden="true" /><span class="sr-only">Not possible</span></template>
                  <template v-else>{{ RATE[c.hp][c.r]![s] }}%</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 max-w-2xl text-sm text-fog">Four Exotic ratings share 1% at full health; bring it down to 1% health to tell them apart. Legendaries never roll a red stat, so none scores below C+, and their rates are only listed at 1% health.</p>
      </section>

      <section aria-labelledby="odds-h" class="mt-14">
        <h2 id="odds-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Stat odds on a caught miscrit</h2>
        <p class="mt-1 max-w-2xl text-fog">How often each stat comes out red, white or green, and the chance that all six are green.</p>
        <ul class="mt-4 divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-card">
          <li v-for="r in RARITIES" :key="r.k" class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[8rem_minmax(0,1fr)_10rem] sm:items-center">
            <p class="flex items-center gap-2 font-display text-xl"><span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: r.ring }" aria-hidden="true" />{{ r.name }}</p>
            <div class="min-w-0">
              <div class="flex gap-0.5" aria-hidden="true">
                <template v-for="(v, q) in STAT_ODDS[r.k]" :key="q">
                  <span v-if="v" class="q h-3.5 rounded-sm" :class="`q-${q}`" :style="{ flex: v }" />
                </template>
              </div>
              <p class="mt-1.5 flex flex-wrap gap-x-4 text-sm">
                <span class="inline-flex items-center gap-1.5"><span class="q q-0 h-2.5 w-2.5 rounded-xs" aria-hidden="true" /><span class="text-fog">Red</span> <strong>{{ STAT_ODDS[r.k][0] ? `${STAT_ODDS[r.k][0]}%` : 'none' }}</strong></span>
                <span class="inline-flex items-center gap-1.5"><span class="q q-1 h-2.5 w-2.5 rounded-xs" aria-hidden="true" /><span class="text-fog">White</span> <strong>{{ STAT_ODDS[r.k][1] }}%</strong></span>
                <span class="inline-flex items-center gap-1.5"><span class="q q-2 h-2.5 w-2.5 rounded-xs" aria-hidden="true" /><span class="text-fog">Green</span> <strong>{{ STAT_ODDS[r.k][2] }}%</strong></span>
              </p>
            </div>
            <p class="text-sm sm:text-right">
              <span class="text-fog">12/12 (S+)</span> <strong class="font-display text-xl">{{ SPLUS[r.k] }}%</strong>
              <span class="block text-xs text-fog">about 1 in {{ Math.round(100 / Number(SPLUS[r.k])) }}</span>
            </p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="enc-h" class="mt-14">
        <h2 id="enc-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Encounter rate</h2>
        <p class="mt-1 max-w-2xl text-fog">How often a wild encounter turns out to be each rarity.</p>
        <ul class="mt-4 max-w-2xl divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-card">
          <li v-for="e in ENCOUNTER" :key="e.label" class="grid grid-cols-[minmax(0,1fr)_auto_6.5rem] items-baseline gap-x-4 px-4 py-3">
            <p class="flex items-center gap-2 font-display text-xl"><span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: R[e.r].ring }" aria-hidden="true" />{{ e.label }}</p>
            <p class="text-right font-display text-xl font-bold">{{ e.pct }}%</p>
            <p class="text-right text-sm text-fog">1 in {{ Math.round(100 / e.pct) }}</p>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
