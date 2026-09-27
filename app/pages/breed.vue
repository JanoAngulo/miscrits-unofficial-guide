<script setup lang="ts">
import type { MiscritSummary, StatKey } from '#shared/types/miscrit'
import type { BreedRoll, BreedWant } from '~/utils/breed'

// The breeding guide: three parent cards and a wanted result give the chance a breed hits it, its cost in gold and
// the rating spread. Each stat is copied from one of the three parents at random; the result is one of the three.
definePageMeta({ chapter: 'breed' })
useSeoMeta({
  title: 'Breeding Guide',
  description: 'Work out the chance a Miscrits breed gives you the miscrit and stats you want, and what it costs in gold.',
})

const MISCRITS = useMiscritList()
const STATS = BREED_STATS
const RATINGS = BREED_RATINGS
const COLOURS = BREED_COLOURS
const GOLD = 5000

type Stats<T> = Record<StatKey, T>
interface Parent { name: string, stats: Stats<BreedRoll> }
interface Breed { parents: Parent[], want: number, target: Stats<BreedWant> }

// Breeding takes miscrits by their first evolution, so only first names are offered and matched.
const byName = new Map(MISCRITS.map(m => [m.names[0]!.toLowerCase(), m]))
const ENTRIES = MISCRITS.map(m => ({ name: m.names[0]!, m, key: m.names[0]!.toLowerCase() }))
  .sort((a, b) => a.name.localeCompare(b.name))
type Entry = (typeof ENTRIES)[number]

const allOf = <T,>(q: T) => Object.fromEntries(STATS.map(s => [s.k, q])) as Stats<T>
const parent = (name: string, stats: Stats<BreedRoll>): Parent => ({ name, stats: { ...stats } })
interface Example { title: string, body: string, math: string, parents: Parent[], labels: string[], want: number, target: Stats<BreedWant> }
const EXAMPLES: Example[] = [
  {
    title: 'Turn an A+ into an S+',
    body: 'You have an A+ Blighted Flowerpiller with white HP and white EA, and you want every stat green. Breed it with two S+ Commons. It has a 1 in 3 chance of coming back; HP and EA are each green 2 times in 3, and the rest are sure to be.',
    math: '1/3 × 2/3 × 2/3',
    parents: [
      parent('Blighted Flowerpiller', { ...allOf<BreedRoll>(2), hp: 1, ea: 1 }),
      parent('', allOf<BreedRoll>(2)),
      parent('', allOf<BreedRoll>(2)),
    ],
    labels: ['A+ Blighted Flowerpiller', 'S+ Common', 'S+ Common'],
    want: 0, target: allOf<BreedWant>(2),
  },
  {
    title: 'Give a Legendary red speed',
    body: 'Red speed is far easier to find on Commons, and Legendaries never spawn with a red stat, so breeding is the only way to get one. Put a Blighted Flue with white speed in with two Commons that have red speed and every other stat green. The same idea suits Legendaries like Foil Croaky or Da Windy.',
    math: '1/3 × 2/3',
    parents: [
      parent('Blighted Flue', { ...allOf<BreedRoll>(2), spd: 1 }),
      parent('', { ...allOf<BreedRoll>(2), spd: 0 }),
      parent('', { ...allOf<BreedRoll>(2), spd: 0 }),
    ],
    labels: ['Blighted Flue', 'Red speed Common', 'Red speed Common'],
    want: 0, target: { ...allOf<BreedWant>(2), spd: 0 },
  },
]
const fromExample = (ex: Example): Breed => ({ parents: ex.parents.map(p => parent(p.name, p.stats)), want: ex.want, target: { ...ex.target } })
const BLANK = (): Breed => ({ parents: [0, 1, 2].map(() => parent('', allOf<BreedRoll>(1))), want: 0, target: allOf<BreedWant>('any') })

const KEY = 'miscripedia.breed'
const valid = (s: any): s is Breed => s && Array.isArray(s.parents) && s.parents.length === 3 && [0, 1, 2].includes(s.want)
  && s.parents.every((p: any) => typeof p.name === 'string' && STATS.every(t => [0, 1, 2].includes(p.stats?.[t.k])))
  && STATS.every(t => ['any', 0, 1, 2].includes(s.target?.[t.k]))
// The page opens on the red speed example, so the first view already shows a worked answer. A saved breed replaces
// it once mounted: the page is prerendered, so storage is read on the client only.
const state = ref<Breed>(fromExample(EXAMPLES[1]!))

// Who a parent is: a named miscrit by its line, typed text by that text, or else just its slot.
const lineOf = (p: Parent): MiscritSummary | null => byName.get(p.name.trim().toLowerCase()) ?? null
const who = (p: Parent, i: number) => {
  const m = lineOf(p)
  return m ? `m${m.id}` : p.name.trim() ? `t${p.name.trim().toLowerCase()}` : `p${i}`
}
const label = (p: Parent, i: number) => {
  const m = lineOf(p)
  return m ? m.names.find(n => n.toLowerCase() === p.name.trim().toLowerCase())! : p.name.trim() || `Parent ${i + 1}`
}
const score = (stats: Stats<BreedWant>) => STATS.reduce((t, s) => t + (stats[s.k] as number), 0)

// Maths

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a
function frac(n: number, d: number) { const g = gcd(n, d) || 1; return [n / g, d / g] as const }
const fracText = ([n, d]: readonly [number, number]) => d === 1 ? `${n}` : `${n}/${d}`
function pct(p: number) {
  const v = p * 100
  if (v === 0) return '0%'
  if (v >= 99.95) return v === 100 ? '100%' : '>99.9%'
  if (v < 0.01) return '<0.01%'
  if (v < 1) return `${v.toFixed(2)}%`
  return `${v.toFixed(1).replace(/\.0$/, '')}%`
}
const oneIn = (p: number) => { const n = 1 / p; return n < 10 ? n.toFixed(1).replace(/\.0$/, '') : Math.round(n).toLocaleString('en-US') }
const say = (r: string) => r.replace('+', ' plus').replace('-', ' minus')

function solve(b: Breed) {
  const P = b.parents
  // How many parents carry each colour, per stat. A stat's chance of a colour is that count over three.
  const count = Object.fromEntries(STATS.map(s => [s.k, [0, 1, 2].map(q => P.filter(p => p.stats[s.k] === q).length)])) as Stats<number[]>
  const wantId = who(P[b.want]!, b.want)
  const same = P.filter((p, i) => who(p, i) === wantId).length
  const set = STATS.filter(s => b.target[s.k] !== 'any')
  const hits = set.map((s) => {
    const q = b.target[s.k] as BreedRoll
    return { s, q, n: count[s.k][q]!, from: P.map((p, i) => p.stats[s.k] === q ? i : -1).filter(i => i >= 0) }
  })
  const statN = hits.reduce((t, h) => t * h.n, 1), statD = 3 ** hits.length
  const pStats = statN / statD, pWant = same / 3, p = pWant * pStats
  // Rating spread of whatever comes back: the six stats convolved.
  let dist = [1]
  for (const s of STATS) {
    const next: number[] = Array(dist.length + 2).fill(0)
    dist.forEach((v, t) => { for (let q = 0; q < 3; q++) next[t + q]! += v * count[s.k][q]! / 3 })
    dist = next
  }
  return { same, pWant, pStats, p, hits, set, statN, statD, dist, blocked: hits.filter(h => !h.n) }
}

// Parents

const slots = computed(() => {
  const s = state.value
  const wantId = who(s.parents[s.want]!, s.want)
  return s.parents.map((p, i) => {
    const m = lineOf(p)
    const wanted = who(p, i) === wantId
    return {
      m, wanted, score: score(p.stats),
      // Shadows, not a border: the wanted ring and rarity line take no layout, so picking a card never shifts it.
      shadow: [
        m && `inset 0 4px 0 ${rarityLook(m.rarity).ring}`,
        wanted && '0 0 0 2px var(--ink)',
        '0 1px 2px rgb(var(--shade) / .06)',
      ].filter(Boolean).join(', '),
    }
  })
})

// Typed text that names no miscrit still counts as a name, so two slots typed the same are treated as the same miscrit.
function search(q: string): Entry[] {
  q = q.trim().toLowerCase()
  return (q ? [...ENTRIES.filter(e => e.key.startsWith(q)), ...ENTRIES.filter(e => !e.key.startsWith(q) && e.key.includes(q))] : ENTRIES).slice(0, 40)
}

// Target

// One option per distinct miscrit: two slots holding the same one are one choice with a better chance.
const wantGroups = computed(() => {
  const s = state.value
  const groups: { id: string, slots: number[] }[] = []
  s.parents.forEach((p, i) => {
    const id = who(p, i)
    const g = groups.find(x => x.id === id)
    if (g) g.slots.push(i)
    else groups.push({ id, slots: [i] })
  })
  const wantId = who(s.parents[s.want]!, s.want)
  return groups.map(g => ({ ...g, i: g.slots[0]!, checked: g.id === wantId }))
})

function preset(p: 'green' | 'redspd' | 'any') {
  state.value.target = p === 'green' ? allOf<BreedWant>(2) : p === 'redspd' ? { ...allOf<BreedWant>(2), spd: 0 } : allOf<BreedWant>('any')
}

// Answer

const r = computed(() => solve(state.value))
const answer = computed(() => {
  const s = state.value, res = r.value
  const w = s.parents[s.want]!
  const all = res.set.length === STATS.length
  const wScore = score(w.stats)
  const blockedWords = res.blocked.map(h => `${COLOURS[h.q]} ${h.s.name.toLowerCase()}`)
  const listWords = (a: string[]) => a.length < 3 ? a.join(' or ') : `${a.slice(0, -1).join(', ')} or ${a.at(-1)}`
  // What it takes, on average and to be fairly sure.
  const sure = res.p >= 1 ? 1 : Math.ceil(Math.log(0.1) / Math.log1p(-res.p))
  return {
    w, all, wScore,
    name: label(w, s.want),
    tScore: all ? score(s.target) : 0,
    blockedText: listWords(blockedWords),
    them: res.blocked.length > 1 ? 'them' : 'it',
    anyStats: STATS.filter(t => s.target[t.k] === 'any'),
    sure,
    max: Math.max(...res.dist),
    up: res.dist.slice(wScore + 1).reduce((t, v) => t + v, 0) * res.pWant,
    shares: res.dist.map((v, n) => ({ v, n })).filter(x => x.v).reverse(),
  }
})
// Per stat: which parents can hand the wanted colour down.
const who3 = (from: number[]) => from.length === 3 ? 'Every parent' : from.length ? `Parent${from.length > 1 ? 's' : ''} ${from.map(i => i + 1).join(' and ')}` : 'No parent'

// The answer settles in on each change; the key remounts it.
const version = ref(0)

// Examples

const examples = EXAMPLES.map((ex) => {
  const s = fromExample(ex)
  return { ...ex, s, p: solve(s).p }
})

// Worth the shot: an S+ Legendary in the wild is a Legendary encounter times the share of caught Legendaries that
// are S+, both from the catching guide's tables. Legendary and Legendary+ spots give the low and high ends.
const huntPer = CATCH_ENCOUNTER.filter(e => e.r === 'legendary').map(e => e.pct / 100 * Number(CATCH_SPLUS.legendary) / 100)
const hunt = { lo: Math.min(...huntPer), hi: Math.max(...huntPer) }
const huntText = (p: number) => `${(p * 100).toFixed(2)}%`
const bred = examples[0]!.p
const SPLUS_FILL = breedTierFill(12)

const input = useInputMode()
const calcH = ref<HTMLElement>()
function load(n: number) {
  state.value = fromExample(EXAMPLES[n]!)
  const h = calcH.value
  if (!h) return
  h.scrollIntoView({ behavior: input.value === 'key' || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  h.focus({ preventScroll: true })
}

// Peek, status, storage

// On small screens the answer sits below all three parents; keep the chance in view while editing them. The parents
// grid gives its controls a bottom scroll margin, so keyboard focus never lands under the bar.
const parentsEl = ref<HTMLElement>()
const answerEl = ref<HTMLElement>()
const peekShown = ref(false)
let io: IntersectionObserver | undefined

// A short line for screen readers, since the whole answer is too long to read out on every change.
// Waits for a pause, so typing a name doesn't announce each letter.
const status = ref('')
const statusText = computed(() => {
  const res = r.value, name = answer.value.name
  return res.p > 0 ? `${pct(res.p)} chance a breed gives you ${name}${res.set.length ? ' with the stats you marked' : ''}.`
    : `Can't happen: no parent has ${res.blocked.map(h => `${COLOURS[h.q]} ${h.s.name.toLowerCase()}`).join(' or ')}.`
})
let statusTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  let saved: unknown = null
  try { saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') }
  catch { saved = null }
  if (valid(saved)) state.value = saved
  // Registered after the saved breed is in, so restoring it doesn't replay the settle.
  watch(state, () => { version.value++ }, { deep: true })
  watch(state, () => {
    try { localStorage.setItem(KEY, JSON.stringify(state.value)) }
    catch {}
  }, { deep: true })
  // Registered after the saved breed is in, so opening the page announces nothing.
  watch(statusText, (text) => {
    clearTimeout(statusTimer)
    statusTimer = setTimeout(() => { status.value = text }, 500)
  })

  if ('IntersectionObserver' in window) {
    const seen: Record<string, boolean> = { parents: false, answer: false }
    io = new IntersectionObserver((es) => {
      for (const e of es) seen[e.target.id] = e.isIntersecting
      peekShown.value = !!seen.parents && !seen.answer
    })
    io.observe(parentsEl.value!)
    io.observe(answerEl.value!)
  }
})
onBeforeUnmount(() => {
  io?.disconnect()
  clearTimeout(statusTimer)
})
</script>

<template>
  <div class="breed-page">
    <div class="border-b border-ink/10">
      <div class="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6">
        <h1 class="chapter font-display text-3xl tracking-tight sm:text-4xl font-bold">Breeding guide</h1>
        <p class="mt-2 max-w-2xl text-fog">Three miscrits go in and one of them comes back, each of its six stats copied from a parent at random. Set your three below and mark what you want to see the odds before you pay.</p>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6">
      <section aria-labelledby="calc-h">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="calc-h" ref="calcH" tabindex="-1" class="chapter font-display text-2xl focus:outline-hidden sm:text-3xl font-bold">Work out a breed</h2>
          <button id="clear" type="button" class="press min-h-11 rounded-lg px-2 py-1 text-sm font-bold text-moss underline decoration-moss/40 underline-offset-4" @click="state = BLANK()">Start over</button>
        </div>
        <p class="mt-1 text-sm text-fog">Set each parent's stats as the game colours them. Naming a parent is optional; the same miscrit twice raises its chance of coming back.</p>

        <div id="parents" ref="parentsEl" class="mt-4 grid items-stretch gap-2 max-lg:[&_*]:scroll-mb-24 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-3">
          <template v-for="(p, i) in state.parents" :key="i">
            <div v-if="i" class="flex justify-center lg:items-center" aria-hidden="true">
              <span class="grid h-8 w-8 place-items-center rounded-full bg-card text-ink shadow-[0_1px_2px_rgb(var(--shade)/.08)]">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </div>
            <article class="rounded-3xl bg-card p-4" :style="{ boxShadow: slots[i]!.shadow }" :aria-labelledby="`pname-${i}`">
              <div class="flex items-center gap-3">
                <span><BreedFace :m="slots[i]!.m" :name="p.name" :slot="i" /></span>
                <div class="min-w-0 flex-1">
                  <label :id="`pname-${i}`" :for="`pick-${i}`" class="flex items-center gap-2 text-xs font-bold text-fog">Parent {{ i + 1 }}<span class="rounded-full bg-ink px-2 py-0.5 text-[11px] leading-none text-on" :class="{ hidden: !slots[i]!.wanted }">Wanted</span></label>
                  <MiscritCombobox
                    :id="`pick-${i}`" v-model="p.name" :search="search" placeholder="Name it (optional)"
                    empty-text="No miscrit by that name. It will still count as a name."
                    input-class="mt-0.5 h-11 w-full rounded-xl border border-line bg-card px-3 font-display text-base placeholder:font-body placeholder:text-fog"
                    @choose="e => { p.name = e.name }"
                  >
                    <template #option="{ item }">
                      <MiscritImg :slug="item.m.slugs[0]!" class="h-9 w-9 shrink-0 rounded-lg bg-leaf object-cover" />
                      <span class="min-w-0"><span class="block truncate font-display text-base leading-tight">{{ item.name }}</span>
                        <span class="block truncate text-xs text-fog">{{ item.m.rarity }}, {{ parts(item.m.element).join(' and ') }}</span></span>
                    </template>
                  </MiscritCombobox>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5">
                <div v-for="s in STATS" :key="s.k" class="flex items-center gap-2">
                  <BreedStatLabel :s="s" :roomy="false" />
                  <BreedSwatches v-model="p.stats[s.k]" :name="`p${i}-${s.k}`" :label="`Parent ${i + 1}, ${s.name}`" />
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between gap-2 border-t border-ink/10 pt-3">
                <p class="text-sm"><span class="sr-only">Rating: </span><span><BreedRating :s="slots[i]!.score" class="h-8 text-base" /></span> <span class="text-xs text-fog">{{ slots[i]!.score }}/12</span></p>
                <div class="-my-2 flex items-center" role="group" :aria-label="`Set every stat of parent ${i + 1}`">
                  <span class="text-xs text-fog" aria-hidden="true">All</span>
                  <!-- A 28px swatch in a 44px button: the taps land and the row doesn't grow. -->
                  <button
                    v-for="q in ([0, 1, 2] as const)" :key="q" type="button" :aria-label="`Make every stat ${COLOURS[q]}`" :title="`All ${COLOURS[q]}`"
                    class="press grid h-11 w-11 place-items-center rounded-lg"
                    @click="p.stats = allOf(q)"
                  >
                    <span class="grid h-7 w-7 place-items-center rounded-lg" :class="breedRollButton(q)"><BreedGlyph :q="q" /></span>
                  </button>
                </div>
              </div>
            </article>
          </template>
        </div>

        <div class="my-2 flex justify-center lg:my-3" aria-hidden="true">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-ink text-on">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 9h14M5 15h14" /></svg>
          </span>
        </div>

        <div class="grid overflow-hidden rounded-3xl border border-ink/10 bg-card shadow-[0_1px_2px_rgb(var(--shade)/.06)] lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
          <form class="border-b border-ink/10 p-4 sm:p-5 lg:border-b-0 lg:border-r" autocomplete="off" @submit.prevent>
            <h3 class="font-display text-xl font-bold">What you want back</h3>
            <fieldset class="mt-3">
              <legend class="text-sm font-bold">Miscrit</legend>
              <div class="mt-1 grid gap-1.5">
                <label v-for="g in wantGroups" :key="g.id" class="seg block cursor-pointer">
                  <input type="radio" name="want" :value="g.i" class="sr-only" :checked="g.checked" @change="state.want = g.i">
                  <span class="press flex min-h-11 items-center gap-2.5 rounded-xl border border-line px-2 py-1.5">
                    <BreedFace :m="slots[g.i]!.m" :name="state.parents[g.i]!.name" :slot="g.i" size="sm" />
                    <span class="min-w-0 flex-1 truncate font-display text-base">{{ label(state.parents[g.i]!, g.i) }}</span>
                    <span class="sub shrink-0 text-xs font-bold text-fog">{{ g.slots.length }} in 3</span>
                  </span>
                </label>
              </div>
            </fieldset>
            <fieldset class="mt-4" aria-describedby="stats-hint">
              <legend class="text-sm font-bold">Stats</legend>
              <p id="stats-hint" class="text-xs text-fog">Each one must come out exactly this colour. Any leaves it open.</p>
              <div class="mt-2 grid gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1">
                <div v-for="s in STATS" :key="s.k" class="flex items-center gap-2">
                  <BreedStatLabel :s="s" />
                  <BreedSwatches v-model="state.target[s.k]" :name="`t-${s.k}`" :label="`Wanted ${s.name}`" with-any />
                </div>
              </div>
            </fieldset>
            <div class="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Quick targets">
              <button type="button" class="press min-h-11 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold" @click="preset('green')">All green</button>
              <button type="button" class="press min-h-11 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold" @click="preset('redspd')">Red speed, rest green</button>
              <button type="button" class="press min-h-11 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold" @click="preset('any')">Anything</button>
            </div>
          </form>

          <div id="answer" ref="answerEl" class="min-w-0 scroll-mt-4 p-4 sm:p-5">
            <div :key="version" class="settle">
              <h3 class="sr-only">The odds</h3>
              <template v-if="r.p > 0">
                <p class="font-display text-6xl leading-none tracking-tight sm:text-7xl font-bold">{{ pct(r.p) }}</p>
                <p class="mt-2 text-fog">chance a breed gives you</p>
              </template>
              <template v-else>
                <p class="font-display text-4xl leading-none text-rust sm:text-5xl font-bold">Can't happen</p>
                <p class="mt-2 text-fog">No parent has {{ answer.blockedText }}, so no breed can hand {{ answer.them }} down. Put in a parent that has {{ answer.them }}.</p>
              </template>
              <div class="mt-2 flex flex-wrap items-center gap-3">
                <BreedFace :m="slots[state.want]!.m" :name="answer.w.name" :slot="state.want" size="sm" />
                <p class="font-display text-2xl leading-tight font-bold">{{ answer.name }} <BreedRating v-if="answer.all" :s="answer.tScore" class="ml-1 h-9 rounded-lg text-lg" /></p>
                <BreedStrip v-if="r.set.length" :stats="state.target" class="w-28" />
              </div>

              <div v-if="r.p > 0" class="mt-5 flex flex-wrap items-stretch gap-2 text-sm">
                <div class="rounded-2xl bg-leaf px-3 py-2"><p class="font-bold">{{ pct(r.pWant) }}</p><p class="text-xs text-fog">it's {{ answer.name }} <span class="whitespace-nowrap">({{ r.same }} in 3)</span></p></div>
                <span class="self-center font-bold text-fog" aria-hidden="true">×</span><span class="sr-only">times</span>
                <div class="rounded-2xl bg-leaf px-3 py-2"><p class="font-bold">{{ pct(r.pStats) }}</p><p class="text-xs text-fog">{{ r.set.length ? `the stats match (${r.statN === r.statD ? 'sure' : fracText(frac(r.statN, r.statD))})` : 'any stats will do' }}</p></div>
                <span class="flex items-stretch gap-2"><span class="self-center font-bold text-fog" aria-hidden="true">=</span><span class="sr-only">equals</span>
                  <div class="rounded-2xl bg-ink px-3 py-2 text-on"><p class="font-bold">{{ pct(r.p) }}</p><p class="text-xs text-(--count-on-ink)">{{ fracText(frac(r.same * r.statN, 3 * r.statD)) }} a breed</p></div></span>
              </div>

              <template v-if="r.set.length">
                <h4 class="mt-6 font-display text-lg">Stat by stat</h4>
                <ul class="mt-1 divide-y divide-ink/10">
                  <li v-for="h in r.hits" :key="h.s.k" class="flex items-center gap-3 py-2">
                    <BreedStatLabel :s="h.s" />
                    <span class="grid h-6 w-6 shrink-0 place-items-center rounded-md" :class="breedRollButton(h.q)" aria-hidden="true"><BreedGlyph :q="h.q" /></span>
                    <span class="min-w-0 flex-1 text-sm"><span class="sr-only">{{ h.s.name }}, {{ COLOURS[h.q] }}: </span><template v-if="h.n">{{ who3(h.from) }} {{ h.from.length === 2 ? 'have' : 'has' }} it</template><span v-else class="font-bold text-rust">No parent has {{ COLOURS[h.q] }} {{ h.s.name.toLowerCase() }}</span></span>
                    <span class="shrink-0 text-sm font-bold" :class="{ 'text-rust': !h.n }">{{ h.n === 3 ? 'Sure' : `${h.n}/3` }}</span>
                  </li>
                  <li v-if="answer.anyStats.length" class="flex items-center gap-3 py-2 text-sm text-fog"><span class="w-14 shrink-0" /><span class="q q-any h-6 w-6 shrink-0 rounded-md" aria-hidden="true" /><span class="flex-1">{{ answer.anyStats.map(s => s.ab).join(', ') }} left open</span><span class="shrink-0 font-bold">Any</span></li>
                </ul>
              </template>

              <template v-if="r.p > 0">
                <!-- sm:leading-7 keeps the line height the larger size gave these under Tailwind v3. -->
                <dl class="mt-6 grid grid-cols-3 divide-x divide-ink/10 rounded-2xl bg-leaf py-3 text-center">
                  <div class="px-2"><dt class="text-xs text-fog">On average</dt><dd class="mt-0.5 font-display text-lg leading-tight sm:text-xl sm:leading-7 font-bold">{{ r.p >= 1 ? 'Every' : `1 in ${oneIn(r.p)}` }}</dd><dd class="text-xs text-fog">{{ r.p >= 1 ? 'breed' : 'breeds' }}</dd></div>
                  <div class="px-2"><dt class="text-xs text-fog">Average cost</dt><dd class="mt-0.5 font-display text-lg leading-tight sm:text-xl sm:leading-7 font-bold">{{ Math.round(GOLD / r.p).toLocaleString('en-US') }}</dd><dd class="text-xs text-fog">gold</dd></div>
                  <div class="px-2"><dt class="text-xs text-fog">90% sure within</dt><dd class="mt-0.5 font-display text-lg leading-tight sm:text-xl sm:leading-7 font-bold">{{ answer.sure.toLocaleString('en-US') }}</dd><dd class="text-xs text-fog">breed{{ answer.sure === 1 ? '' : 's' }}, {{ (answer.sure * GOLD).toLocaleString('en-US') }} gold</dd></div>
                </dl>
                <p class="mt-2 text-xs text-fog">Each breed uses up all three parents, so each try also needs a fresh set.</p>
              </template>

              <!-- Rating spread of whatever comes back; ratings above the wanted miscrit's own are marked. -->
              <h4 class="mt-6 font-display text-lg">Rating of the result</h4>
              <p v-if="answer.wScore === 12" class="text-sm">{{ answer.name }} is already S+; nothing rates higher.</p>
              <p v-else class="text-sm"><strong>{{ pct(answer.up) }}</strong> chance {{ answer.name }} comes back rated above its <BreedRating :s="answer.wScore" class="h-6 text-xs" />.</p>
              <figure class="mt-2">
                <ol class="flex h-32 items-end gap-1 border-b border-line pt-6" aria-label="Chance of each rating, whichever miscrit comes back">
                  <li v-for="(v, n) in r.dist" :key="n" class="bar relative flex h-full flex-1 flex-col justify-end">
                    <span class="sr-only">{{ say(RATINGS[n]!) }}: {{ v ? pct(v) : 'not possible' }}{{ n > answer.wScore ? `, above ${say(RATINGS[answer.wScore]!)}` : '' }}</span>
                    <span
                      class="tip absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-bold text-on shadow-[0_6px_16px_-8px_rgb(var(--shade)/.5)]"
                      :style="{ bottom: `calc(${(v / answer.max) * 100}% + 6px)` }" aria-hidden="true"
                    >{{ RATINGS[n] }} &middot; {{ v ? pct(v) : 'not possible' }}</span>
                    <span
                      v-if="v" class="bar-fill block rounded-t-sm" aria-hidden="true"
                      :style="{ height: `${Math.max((v / answer.max) * 100, 2)}%`, background: breedTierFill(n), boxShadow: n > answer.wScore ? '0 0 0 2px var(--card), 0 0 0 4px var(--ink)' : 'inset 0 0 0 1px color-mix(in srgb, var(--color-ink-fixed) 20%, transparent)' }"
                    />
                    <span v-else class="never block h-3 rounded-t-sm" aria-hidden="true" />
                  </li>
                </ol>
                <ol class="mt-1 flex gap-1" aria-hidden="true">
                  <li v-for="(t, n) in RATINGS" :key="t" class="flex-1 text-center text-[11px] font-bold" :class="[n > answer.wScore ? 'text-ink' : 'text-fog', { 'line-through': !r.dist[n] }]">{{ t }}</li>
                </ol>
                <ul class="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
                  <li v-for="x in answer.shares" :key="x.n" class="flex items-center gap-1.5 rounded-lg py-1 pl-1 pr-2.5 text-xs font-bold" :class="x.n > answer.wScore ? 'bg-ink text-on' : 'bg-leaf'"><BreedRating :s="x.n" class="h-6 text-[11px]" /> {{ pct(x.v) }}</li>
                </ul>
                <figcaption class="mt-2 text-xs text-fog">Whichever miscrit comes back. Ringed bars rate above {{ answer.name }}'s {{ RATINGS[answer.wScore] }}; hatched ones can't happen with these parents.</figcaption>
              </figure>
            </div>
          </div>
          <p class="sr-only" aria-live="polite">{{ status }}</p>
        </div>
      </section>

      <section aria-labelledby="rules-h" class="mt-16">
        <h2 id="rules-h" class="chapter font-display text-2xl sm:text-3xl font-bold">How breeding works</h2>
        <dl class="mt-4 grid gap-x-10 gap-y-5 rounded-3xl bg-card p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <dt class="font-display text-lg">Where</dt>
            <dd class="mt-0.5 text-fog">Talk to Brash in the Miscrit Breeding building.</dd>
          </div>
          <div>
            <dt class="font-display text-lg">Cost</dt>
            <dd class="mt-0.5 text-fog"><strong class="text-ink">5,000 gold</strong> a breed.</dd>
          </div>
          <div>
            <dt class="font-display text-lg">Three in, one out</dt>
            <dd class="mt-0.5 text-fog">The result is always one of the three you put in, each with a 1 in 3 chance. Put the same miscrit in twice and it has 2 in 3.</dd>
          </div>
          <div>
            <dt class="font-display text-lg">Stats are mixed</dt>
            <dd class="mt-0.5 text-fog">Each of the six stats is copied from one of the three parents, picked at random. A colour two parents share has a 2 in 3 chance for that stat.</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="font-display text-lg">All three are used up</dt>
            <dd class="mt-0.5 max-w-2xl text-fog">You lose every miscrit you put in and get only the result back. Breed miscrits you would not use anyway: a low-rated rarity you want better, and Commons with the stats you are after.</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="why-h" class="mt-16">
        <h2 id="why-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Worth the shot</h2>
        <p class="mt-1 max-w-2xl text-fog">A 1 in {{ Math.round(1 / bred) }} chance sounds poor until you set it next to hunting. For an S+ Blighted Flowerpiller:</p>
        <div class="mt-4 space-y-4 rounded-3xl bg-card p-5 sm:p-6">
          <div>
            <div class="flex flex-wrap items-baseline justify-between gap-x-3">
              <p class="font-bold">Hunting one in the wild</p>
              <p class="text-sm"><strong>about {{ huntText(hunt.lo) }} to {{ huntText(hunt.hi) }}</strong> <span class="text-fog">an encounter</span></p>
            </div>
            <div class="mt-1.5 h-4 rounded-full bg-leaf" aria-hidden="true"><div class="odds-fill h-4 rounded-full" :style="{ width: `max(${hunt.hi * 100}%, 4px)`, background: SPLUS_FILL, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-ink-fixed) 20%, transparent)' }" /></div>
            <p class="mt-1 text-xs text-fog">Worked out from the <NuxtLink to="/catch" class="font-bold text-moss underline decoration-moss/40 underline-offset-4">catching guide</NuxtLink>: a Legendary encounter, times the share of caught Legendaries that are S+.</p>
          </div>
          <div>
            <div class="flex flex-wrap items-baseline justify-between gap-x-3">
              <p class="font-bold">Breeding the A+ one you already have</p>
              <p class="text-sm"><strong>{{ pct(bred) }}</strong> <span class="text-fog">a breed</span></p>
            </div>
            <div class="mt-1.5 h-4 rounded-full bg-leaf" aria-hidden="true"><div class="odds-fill h-4 rounded-full" :style="{ width: `${bred * 100}%`, background: SPLUS_FILL, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-ink-fixed) 20%, transparent)' }" /></div>
          </div>
          <p class="text-xs text-fog">Both bars on one scale, 0 to 100%.</p>
          <p class="max-w-2xl text-sm text-fog">An A+ Blighted Flowerpiller isn't a PvP pick anyway, so breeding it risks little. Each breed is a fresh 1 in {{ Math.round(1 / bred) }} roll, so budget for several.</p>
        </div>
      </section>

      <section aria-labelledby="ex-h" class="mt-16">
        <h2 id="ex-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Two ways to use it</h2>
        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <article v-for="(ex, n) in examples" :key="n" class="flex flex-col rounded-3xl bg-card p-5 sm:p-6" :aria-labelledby="`ex-${n}`">
            <h3 :id="`ex-${n}`" class="font-display text-xl font-bold">{{ ex.title }}</h3>
            <div class="mt-4 flex flex-wrap items-end gap-x-2 gap-y-3" aria-hidden="true">
              <div v-for="(p, i) in ex.s.parents" :key="i" class="flex items-end gap-2">
                <span v-if="i" class="pb-0.5 font-bold text-fog">+</span>
                <div class="w-24 self-end">
                  <p class="text-xs font-bold leading-tight" :class="{ 'text-fog': i }">{{ ex.labels[i] }}</p>
                  <div class="mt-1 flex items-center gap-1"><BreedRating :s="score(p.stats)" class="h-5 text-[10px]" /><BreedStrip :stats="p.stats" class="min-w-0 flex-1 shrink-0" /></div>
                </div>
              </div>
              <span class="pb-0.5 font-bold text-fog">=</span>
              <div class="w-24 self-end">
                <p class="text-xs font-bold leading-tight">Wanted</p>
                <div class="mt-1 flex items-center gap-1"><BreedRating :s="score(ex.target)" class="h-5 text-[10px]" /><BreedStrip :stats="ex.target" class="min-w-0 flex-1 shrink-0" /></div>
              </div>
            </div>
            <p class="mt-4 text-fog">{{ ex.body }}</p>
            <p class="mt-3 text-sm"><span class="text-fog">{{ ex.math }} =</span> <strong class="font-display text-xl font-bold">{{ pct(ex.p) }}</strong></p>
            <div class="mt-auto pt-4">
              <button type="button" :aria-describedby="`ex-${n}`" class="press rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-on" @click="load(n)">Load into calculator</button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <a
      href="#answer" class="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-30 items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-on shadow-[0_12px_32px_-12px_rgb(var(--shade)/.6)] lg:hidden"
      :class="peekShown ? 'flex' : 'hidden'"
    >
      <span class="font-display text-2xl leading-none font-bold" :class="{ 'text-(--warn-on-ink)': !(r.p > 0) }">{{ r.p > 0 ? pct(r.p) : "Can't happen" }}</span>
      <span class="min-w-0 flex-1 truncate text-sm text-(--count-on-ink)">{{ answer.name }}, {{ pct(r.pWant) }} × {{ pct(r.pStats) }}</span>
      <span class="shrink-0 text-sm font-bold underline decoration-on/40 underline-offset-4">Breakdown</span>
    </a>
  </div>
</template>
