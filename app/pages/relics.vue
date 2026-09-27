<script setup lang="ts">
import type { StatKey } from '#shared/types/miscrit'
import type { ListedMiscrit } from '~/composables/useMiscritList'
import type { StatColumn, StatIcon } from '~/utils/field'

// The relic and bonus guide: a checker for a rebonus roll (stop lines, then the builds that fit it) over the guide's
// deprio table and its eleven numbered relic builds.
definePageMeta({ chapter: 'relics' })
useSeoMeta({
  title: 'Relic and Bonus Guide',
  description: 'Check a Miscrits rebonus roll against the stop lines, and pick the relic build that fits it.',
})

const MISCRITS = useMiscritList()

// The game's Bonus panel order: health, speed, then attack and defense in elemental/physical pairs.
const STATS: { k: StatKey, label: string, short: string, col: StatColumn, icon: StatIcon }[] = [
  { k: 'hp', label: 'Health', short: 'HP', col: 'core', icon: 'hp' },
  { k: 'spd', label: 'Speed', short: 'SP', col: 'speed', icon: 'spd' },
  { k: 'ea', label: 'Elemental attack', short: 'EA', col: 'elemental', icon: 'attack' },
  { k: 'pa', label: 'Physical attack', short: 'PA', col: 'physical', icon: 'attack' },
  { k: 'ed', label: 'Elemental defense', short: 'ED', col: 'elemental', icon: 'defense' },
  { k: 'pd', label: 'Physical defense', short: 'PD', col: 'physical', icon: 'defense' },
]
const STAT = Object.fromEntries(STATS.map(s => [s.k, s])) as Record<StatKey, typeof STATS[number]>
const SHORT = (k: StatKey) => STAT[k].short

const CROSS = '<path d="M7 7l10 10M17 7 7 17"/>'
const WARN = '<path d="M12 4 21 20H3z"/><path d="M12 10v4.5M12 17.5v.01"/>'

type Group = 'standard' | 'tank' | 'hybrid' | 'sniper'
interface Build { n: number, group: Group, lean: StatColumn, stats: StatKey[], who: string, name: string, relics: string[][], note?: string }
// Builds 1 to 11, in the guide's own order; the guide refers to them by number.
const BUILDS: Build[] = [
  { n: 1, group: 'standard', lean: 'elemental', stats: ['ea'], who: 'Standard, EA', name: 'Slow bruiser opener', relics: [['Mystic Map'], ['Flying Carpet Fragment']] },
  { n: 2, group: 'standard', lean: 'physical', stats: ['pa'], who: 'Standard, PA', name: 'Slow bruiser opener', relics: [['Palmda\'s Talon'], ['Gog\'s Cog']] },
  { n: 3, group: 'standard', lean: 'elemental', stats: ['ea'], who: 'Standard, EA', name: 'Bruiser stat check', relics: [['Temple Stone'], ['Flying Carpet Fragment']] },
  { n: 4, group: 'standard', lean: 'physical', stats: ['pa'], who: 'Standard, PA', name: 'Bruiser stat check', relics: [['Vanquished Soul'], ['Gog\'s Cog']] },
  { n: 5, group: 'tank', lean: 'core', stats: [], who: 'Standard or hybrid', name: 'Slow tank opener', relics: [['Cactus Flower'], ['Cage of Despair', 'Moon Rock']] },
  { n: 6, group: 'tank', lean: 'core', stats: [], who: 'Standard or hybrid', name: 'Tank defensive', relics: [['Shackler\'s Gem'], ['Cage of Despair', 'Moon Rock']] },
  { n: 7, group: 'hybrid', lean: 'core', stats: [], who: 'Hybrid', name: 'Slow bruiser opener', relics: [['Nox\'s Nightmare'], ['Scent of Skustunk']] },
  { n: 8, group: 'hybrid', lean: 'core', stats: [], who: 'Hybrid', name: 'Bruiser stat check', relics: [['Gold Piece Die'], ['Scent of Skustunk', 'Coin']] },
  { n: 9, group: 'sniper', lean: 'speed', stats: ['spd', 'ea'], who: 'Sniper, EA', name: 'Full speed damage', relics: [['Arrow of Love'], ['Shard of Rudolffe']] },
  { n: 10, group: 'sniper', lean: 'speed', stats: ['spd', 'ea'], who: 'Sniper, EA', name: 'Fast bruiser duelist', relics: [['Temple Stone', 'Magicite Staff'], ['Shard of Rudolffe']],
    note: 'Temple Stone for 3/5+ defenses with more than 25 bonus.' },
  { n: 11, group: 'sniper', lean: 'speed', stats: ['spd', 'pa'], who: 'Sniper, PA', name: 'Fast bruiser damage', relics: [['Vanquished Soul', 'Dark Warro Thorn'], ['Saiyam\'s Trident']],
    note: 'Vanquished Soul for 3/5+ defenses with more than 25 bonus.' },
]
const BUILD = Object.fromEntries(BUILDS.map(b => [b.n, b])) as Record<number, Build>
const GROUPS: { k: Group, title: string }[] = [
  { k: 'standard', title: 'Standard bruisers' },
  { k: 'tank', title: 'Tanks' },
  { k: 'hybrid', title: 'Hybrid bruisers' },
  { k: 'sniper', title: 'Snipers' },
]
// The colour key over the builds: each lean's stat tile and what it stands for.
const LEAN: { stat: StatKey, label: string }[] = [
  { stat: 'ea', label: 'Elemental attack' },
  { stat: 'pa', label: 'Physical attack' },
  { stat: 'hp', label: 'Health: tanks and hybrids' },
  { stat: 'spd', label: 'Speed: snipers' },
]
const tilesOf = (b: Build) => b.stats.map(k => STAT[k])

const DEPRIO = [
  { n: 1, wastes: 'SP', use: 'Best odds of a single-digit stat. Only if you have plats to spare.', tag: 'If rich', tone: 'bg-leaf text-fog' },
  { n: 2, wastes: 'SP, EA or PA', use: 'Fewest plats on average to hit a stop line, thanks to pity. The free-to-play pick.', tag: 'Best for F2P', tone: 'bg-wash-yes text-moss' },
  { n: 3, wastes: 'SP, EA or PA, HP', use: 'For extreme spreads like 40+. Good for snipers, but makes less use of pity.', tag: 'Extreme spreads', tone: 'bg-wash-some text-some' },
  { n: 4, wastes: '', use: 'Never worth it.', tag: 'Never', tone: 'bg-wash-no text-rust' },
  { n: 5, wastes: '', use: 'Never worth it.', tag: 'Never', tone: 'bg-wash-no text-rust' },
]

// The stop lines, each drawn over six sorted bonuses with the ones it adds up lit.
const STOPS = [
  { k: 'A', n: 3, limit: 45, text: 'Lowest three bonuses, added up' },
  { k: 'B', n: 2, limit: 28, text: 'Lowest two bonuses, added up' },
  { k: 'C', n: 1, limit: 8, text: 'Lowest single bonus' },
]
const BARS = [28, 40, 54, 68, 84, 100]
const PRIORITY = [
  { who: 'Standard', steps: ['Attack', 'ED / PD', 'HP'] },
  { who: 'Hybrid', steps: ['Attack 1', 'ED / PD', 'Attack 2', 'HP'] },
]

// Choosing between builds: each question forks two ways, and each way ends in builds or in relics. A relic carries
// the build it goes in, so it takes that build's tint; hybrid relics take health, as hybrid builds do.
// A relic tagged with a build number goes in that build, beside the other; untagged ones are alternatives.
interface Choice { when: string, then?: string, builds?: number[], relics?: [string, StatColumn, number?][] }
const CHOICES: { q: string, note?: string, opts: Choice[] }[] = [
  { q: 'True or raw damage', opts: [
    { when: 'Lots of true damage', then: 'Lean toward a defensive tank', builds: [5, 6, 7, 8] },
    { when: 'Lots of raw damage or healing', then: 'Lean toward a bruiser stat check', builds: [1, 2, 3, 4] },
  ] },
  { q: 'Snipers', note: 'Only relic a sniper you stopped on B or C.', opts: [
    { when: 'If in doubt', then: 'Fast bruiser is always safe', builds: [10] },
    { when: 'If the meta favours speed', then: 'Some snipers can run full speed', builds: [9] },
  ] },
  { q: 'Builds 10 and 11', note: 'The first relic for each.', opts: [
    { when: '3/5+ defenses and more than 25 bonus', then: 'More duel value', relics: [['Temple Stone', 'speed', 10], ['Vanquished Soul', 'speed', 11]] },
    { when: 'Otherwise', relics: [['Magicite Staff', 'speed', 10], ['Dark Warro Thorn', 'speed', 11]] },
  ] },
  { q: 'Hybrids', opts: [
    { when: 'Already heals or blocks', then: 'Usually better', relics: [['Gold Piece', 'core'], ['White Gem', 'core']] },
    { when: 'Stacks stats or has lower HP', relics: [['Bauble', 'core']] },
  ] },
]
// A build number badge, filled like the build card's own. Green and gold fills take dark ink, as there.
const badge = (n: number) => {
  const lean = BUILD[n]!.lean, hue = STAT_HUE[lean]
  return { background: hue.fill, color: lean === 'core' || lean === 'speed' ? '#1B2E2A' : '#fff', boxShadow: `inset 0 0 0 1.5px ${hue.deep}` }
}
const tint = (col: StatColumn) => ({ '--hf': STAT_HUE[col].fill, '--hw': STAT_HUE[col].empty })

type Role = 'standard' | 'hybrid' | 'sniper'
type Atk = 'ea' | 'pa'
const ROLES: [Role, string][] = [['standard', 'Standard'], ['hybrid', 'Hybrid'], ['sniper', 'Sniper']]
const ATKS: [Atk, string][] = [['ea', 'Elemental'], ['pa', 'Physical']]

// Bonuses and relics go on the max evolution, so the picker offers only that one per line.
const maxName = (m: ListedMiscrit) => m.names[m.names.length - 1]!
const byName = new Map(MISCRITS.map(m => [maxName(m).toLowerCase(), m]))
const anyName = new Map(MISCRITS.flatMap(m => m.names.map(n => [n.toLowerCase(), m] as const)))
const ENTRIES = MISCRITS.map(m => ({ name: maxName(m), m, key: maxName(m).toLowerCase(), earlier: m.names.slice(0, -1) }))
  .sort((a, b) => a.name.localeCompare(b.name))
type Entry = typeof ENTRIES[number]

interface Check { miscrit: string, role: Role, atk: Atk, spd: string, b: Partial<Record<StatKey, number>> }
const EXAMPLE: Check = { miscrit: 'Quiver', role: 'standard', atk: 'ea', spd: '2', b: { hp: 18, spd: 11, ea: 37, pa: 8, ed: 35, pd: 27 } }
const BLANK: Check = { miscrit: '', role: 'standard', atk: 'ea', spd: '', b: {} }
const KEY = 'miscripedia.relics'

// A stored state from an older page, or one edited by hand, falls back field by field.
function clean(s: unknown): Check {
  if (!s || typeof s !== 'object') return structuredClone(EXAMPLE)
  const o = s as Record<string, unknown>
  const saved = (o.b && typeof o.b === 'object' ? o.b : {}) as Record<string, unknown>
  const b: Check['b'] = {}
  for (const { k } of STATS) {
    const v = saved[k]
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) b[k] = Math.round(v)
  }
  return {
    miscrit: typeof o.miscrit === 'string' ? o.miscrit : '',
    role: ROLES.some(([v]) => v === o.role) ? o.role as Role : 'standard',
    atk: ATKS.some(([v]) => v === o.atk) ? o.atk as Atk : 'ea',
    spd: ['1', '2', '3', '4', '5'].includes(String(o.spd)) ? String(o.spd) : '',
    b,
  }
}

// The prerendered page shows the example, which is also what a first visit gets; a saved check replaces it on mount.
const state = reactive<Check>(structuredClone(EXAMPLE))
// What each bonus field shows. It keeps the typed text while typing and takes the stored number once committed.
const bText = reactive<Record<StatKey, string>>({ hp: '', spd: '', ea: '', pa: '', ed: '', pd: '' })
const missText = ref('')
const countText = ref('')
const combo = ref<{ focus: () => void }>()

// A guess from base stats, labelled as one: attacks decide standard or hybrid, top speed says sniper.
function guessRole(m: ListedMiscrit): { role: Role, atk: Atk } {
  const ea = STAT_LEVEL[m.stats.ea], pa = STAT_LEVEL[m.stats.pa], sp = STAT_LEVEL[m.stats.spd]
  const atk = ea >= pa ? 'ea' : 'pa'
  const role = Math.abs(ea - pa) <= 1 && Math.min(ea, pa) >= 3 ? 'hybrid' : sp >= 4 ? 'sniper' : 'standard'
  return { role, atk }
}

const picked = computed(() => byName.get(state.miscrit.trim().toLowerCase()))
const slugOf = (m: ListedMiscrit, name: string) => m.slugs[Math.max(0, m.names.findIndex(n => n.toLowerCase() === name))]!

// Max names that start with the query, then ones that contain it, then lines whose earlier form matches. The query is
// read from the state: on a keystroke the combobox passes its text before the new prop has reached it.
function search() {
  const q = state.miscrit.trim().toLowerCase()
  const tiers: ((e: Entry) => boolean)[] = q
    ? [e => e.key.startsWith(q), e => e.key.includes(q), e => e.earlier.some(n => n.toLowerCase().includes(q))]
    : [() => true]
  const seen = new Set<Entry>()
  return tiers.flatMap(t => ENTRIES.filter(e => !seen.has(e) && t(e) && seen.add(e))).slice(0, 40)
}
function onList(items: Entry[]) {
  const n = items.length
  countText.value = n ? `${n}${n === 40 ? ' or more' : ''} ${n === 1 ? 'miscrit' : 'miscrits'} listed` : 'No miscrit by that name'
}
const elementWords = (el: string) => (el.match(/[A-Z][a-z]+/g) || [el]).join(' and ')

function pickMiscrit(name: string) {
  state.miscrit = name
  const m = picked.value
  if (m) Object.assign(state, guessRole(m), { spd: String(STAT_LEVEL[m.stats.spd]) })
}
function onType(v: string) {
  missText.value = ''
  pickMiscrit(v)
}
// A typed name that is not a max evolution: an earlier form resolves to its line, anything else is flagged.
function noteMiss() {
  const typed = state.miscrit.trim()
  missText.value = typed && !byName.has(typed.toLowerCase()) ? `No miscrit named “${typed}”. The check works without one.` : ''
}
function onCommit() {
  const key = state.miscrit.trim().toLowerCase(), m = anyName.get(key)
  if (m && !byName.has(key)) pickMiscrit(maxName(m))
  noteMiss()
}

function onBonus(k: StatKey, e: Event) {
  const v = (e.target as HTMLInputElement).value.trim()
  bText[k] = v
  state.b[k] = v === '' ? undefined : Math.max(0, Math.round(Number(v)))
}
// A committed field shows the number the check uses: rounded, and never below zero.
const onBonusDone = (k: StatKey) => { bText[k] = String(state.b[k] ?? '') }

function syncForm(s: Check) {
  const saved = anyName.get(s.miscrit.trim().toLowerCase())
  if (saved) s.miscrit = maxName(saved)
  Object.assign(state, s)
  for (const { k } of STATS) bText[k] = String(state.b[k] ?? '')
  noteMiss()
}
function loadExample() { syncForm(structuredClone(EXAMPLE)) }
function clear() {
  syncForm(structuredClone(BLANK))
  combo.value?.focus()
}

function picks(role: Role, atk: Atk, slow: boolean): [number, string][] {
  if (role === 'sniper') return atk === 'ea'
    ? [[10, 'Safe default'], [9, 'If the meta favours speed']]
    : [[11, 'Default']]
  if (role === 'hybrid') return slow
    ? [[7, 'Raw damage or healing'], [5, 'Lots of true damage']]
    : [[8, 'Raw damage or healing'], [6, 'Lots of true damage']]
  return slow
    ? [[atk === 'ea' ? 1 : 2, 'Raw damage or healing'], [5, 'Lots of true damage']]
    : [[atk === 'ea' ? 3 : 4, 'Raw damage or healing'], [6, 'Lots of true damage']]
}

const verdict = computed(() => {
  const { role, atk } = state
  const vals = STATS.map(s => ({ k: s.k, v: state.b[s.k] }))
  const missing = vals.filter(x => !Number.isFinite(x.v))
  if (missing.length) {
    const hint = missing.length === 6 ? 'Copy them from the Bonus panel on the miscrit\'s card, top to bottom.' : `Still missing ${missing.map(x => SHORT(x.k)).join(', ')}.`
    return { done: false as const, hint, say: `Enter all six bonuses. ${hint}` }
  }

  const all = vals as { k: StatKey, v: number }[]
  const low = [...all].sort((a, b) => a.v - b.v)
  const sum = (n: number) => low.slice(0, n).reduce((t, x) => t + x.v, 0)
  const named = (n: number) => low.slice(0, n).map(x => `${SHORT(x.k)} ${x.v}`).join(' + ')
  const A = sum(3) < 45, B = sum(2) < 28, C = low[0]!.v < 8
  const top = Math.max(...all.map(x => x.v))
  const atkVal = state.b[atk]!
  const onAttack = atkVal === top

  const lineMet = role === 'sniper' ? B || C : A || B || C
  const stop = lineMet && onAttack
  const sniperOnlyA = role === 'sniper' && A && !B && !C

  const spdLevel = Number(state.spd) || 0
  const slow = role !== 'sniper' && spdLevel === 1 && state.b.spd! < 7

  let head, sub, tone
  if (stop) {
    [head, tone] = ['Stop here and relic it', 'bg-wash-yes text-moss']
    sub = `This roll clears a stop line with your highest bonus on ${SHORT(atk)}.`
  }
  else if (lineMet && !onAttack) {
    [head, tone] = ['Rebonus again', 'bg-wash-no text-rust']
    sub = `It clears a stop line, but your highest bonus is on ${all.filter(x => x.v === top).map(x => SHORT(x.k)).join(' and ')}, not ${SHORT(atk)}.`
  }
  else {
    [head, tone] = ['Keep rebonusing', 'bg-wash-no text-rust']
    sub = sniperOnlyA ? 'A sniper needs B or C. A on its own is not enough.' : 'None of the three stop lines is met yet.'
  }

  const order = role === 'hybrid'
    ? `${SHORT(atk)}, then ED/PD, then ${SHORT(atk === 'ea' ? 'pa' : 'ea')}, then HP`
    : `${SHORT(atk)}, then ED/PD, then HP`

  const why = role === 'sniper'
    ? 'Snipers never go slow.'
    : slow ? 'Slow builds are open: 1/5 base speed and under 7 speed bonus.'
      : spdLevel === 1 ? `Base speed is 1/5, but ${state.b.spd} speed bonus is 7 or more, so skip the slow builds.`
        : spdLevel ? 'Base speed is above 1/5, so skip the slow builds.'
          : 'Set base speed to see whether a slow build is open.'

  // Each check's detail is plain text, then an optional total drawn in ink, then an optional tail.
  const rows = [
    { ok: A, title: 'A. Lowest three under 45', text: `${named(3)} = `, total: sum(3), tail: role === 'sniper' ? '. Does not count for snipers.' : '' },
    { ok: B, title: 'B. Lowest two under 28', text: `${named(2)} = `, total: sum(2), tail: '' },
    { ok: C, title: 'C. Lowest stat under 8', text: named(1), total: null, tail: '' },
    { ok: onAttack, title: `Highest bonus on ${SHORT(atk)}`, text: `${SHORT(atk)} is ${atkVal}, top is ${top}. Priority: ${order}.`, total: null, tail: '' },
  ]
  return {
    done: true as const, stop, head, sub, tone, why, rows,
    picks: picks(role, atk, slow).map(([n, when]) => ({ b: BUILD[n]!, when })),
    say: `${head}. ${sub}`,
  }
})

onMounted(() => {
  let saved: unknown = null
  try { saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') } catch { saved = null }
  syncForm(clean(saved))
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }
  save()
  watch(state, save, { deep: true })
})
</script>

<template>
  <div class="relics-page">
    <div class="border-b border-ink/10">
      <div class="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6">
        <h1 class="chapter font-display text-3xl tracking-tight sm:text-4xl font-bold">Relic and bonus guide</h1>
        <p class="mt-2 max-w-2xl text-fog">Rebonus first, relic second: your bonuses decide the build. Check a roll below to see whether to stop, and which relics fit it.</p>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6">
      <!-- Checker -->
      <section aria-labelledby="check-h" class="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <form class="rounded-3xl border border-ink/10 bg-card p-4 shadow-[0_1px_2px_rgb(var(--shade)/.06)] sm:p-5" autocomplete="off" novalidate @submit.prevent>
          <div class="flex items-baseline justify-between gap-3">
            <h2 id="check-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Check a rebonus</h2>
            <button type="button" class="press min-h-11 rounded-xl px-2 py-1 text-sm font-bold text-moss underline decoration-moss/40 underline-offset-4" @click="loadExample">Load example</button>
          </div>

          <div class="mt-4">
            <label for="miscrit" class="text-sm font-bold">Miscrit <span class="font-normal text-fog">(optional)</span></label>
            <div class="mt-1 flex items-center gap-2">
              <span class="shrink-0" :class="{ hidden: !picked }">
                <MiscritImg v-if="picked" :slug="slugOf(picked, maxName(picked).toLowerCase())" class="h-11 w-11 shrink-0 rounded-xl bg-leaf object-cover" />
              </span>
              <MiscritCombobox
                id="miscrit" ref="combo" :model-value="state.miscrit" :search="search"
                placeholder="Max evolution, like Quiver" describedby="miscrit-help"
                @update:model-value="onType" @choose="(e: Entry) => pickMiscrit(e.name)" @list="onList" @commit="onCommit"
              >
                <template #option="{ item: e }">
                  <MiscritImg :slug="slugOf(e.m, e.key)" class="h-9 w-9 shrink-0 rounded-lg bg-leaf object-cover" />
                  <span class="min-w-0"><span class="block truncate font-display text-base leading-tight">{{ e.name }}</span> <span class="block truncate text-xs text-fog">{{ elementWords(e.m.element) }}, max evolution{{ e.earlier.length ? ` of ${e.earlier[0]}` : '' }}</span></span>
                </template>
              </MiscritCombobox>
            </div>
            <p v-show="missText" class="mt-1 text-xs font-bold text-ink">{{ missText }}</p>
            <p id="miscrit-help" class="mt-1 text-xs text-fog">Max evolutions only; an earlier form's name finds its line. Fills in base stats and guesses the role. Change either if you know better.</p>
          </div>

          <fieldset class="mt-4">
            <legend class="text-sm font-bold">Role</legend>
            <div class="mt-1 grid grid-cols-3 gap-1.5">
              <label v-for="[v, label] in ROLES" :key="v" class="seg block cursor-pointer">
                <input v-model="state.role" type="radio" name="role" :value="v" class="peer sr-only">
                <span class="press flex h-11 items-center justify-center rounded-xl border border-line text-sm font-bold">{{ label }}</span>
              </label>
            </div>
          </fieldset>

          <fieldset class="mt-3">
            <legend class="text-sm font-bold">{{ state.role === 'hybrid' ? 'Main attack (attack 1)' : 'Attack' }}</legend>
            <div class="mt-1 grid grid-cols-2 gap-1.5">
              <label v-for="[v, label] in ATKS" :key="v" class="seg block cursor-pointer">
                <input v-model="state.atk" type="radio" name="atk" :value="v" class="peer sr-only">
                <span class="press flex h-11 items-center justify-center rounded-xl border border-line text-sm font-bold">{{ label }}</span>
              </label>
            </div>
          </fieldset>

          <label class="mt-3 block">
            <span class="text-sm font-bold">Base speed</span>
            <select v-model="state.spd" class="mt-1 block min-h-11 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base leading-6" aria-describedby="spd-help">
              <option value="">Not sure</option>
              <option value="1">Weak (1/5)</option>
              <option value="2">Moderate (2/5)</option>
              <option value="3">Strong (3/5)</option>
              <option value="4">Max (4/5)</option>
              <option value="5">Elite (5/5)</option>
            </select>
            <span id="spd-help" class="mt-1 block text-xs text-fog">Only a 1/5 speed miscrit can go slow.</span>
          </label>

          <fieldset class="mt-4">
            <legend class="text-sm font-bold">Bonus</legend>
            <p class="text-xs text-fog">In the order the game's Bonus panel lists them.</p>
            <div class="mt-2 space-y-1.5">
              <label v-for="s in STATS" :key="s.k" class="flex items-center gap-2.5">
                <StatTile :icon="s.icon" :hue="STAT_HUE[s.col]" class="grid h-7 w-7 shrink-0 place-items-center rounded-md" svg-class="h-[65%] w-[65%]" />
                <span class="min-w-0 flex-1 text-sm">{{ s.label }}<span class="block text-xs text-fog">{{ picked ? `Base ${picked.stats[s.k]}` : '' }}</span></span>
                <input
                  :id="`b-${s.k}`" :value="bText[s.k]" type="number" inputmode="numeric" min="0" max="99" step="1"
                  class="bonus-input h-11 w-20 rounded-xl border border-line bg-card px-3 text-right text-base font-bold"
                  @input="onBonus(s.k, $event)" @change="onBonusDone(s.k)"
                >
              </label>
            </div>
          </fieldset>

          <button type="button" class="press mt-4 w-full rounded-xl border border-line bg-card py-2.5 text-sm font-bold" @click="clear">Clear</button>
        </form>

        <!-- The panel follows every keystroke, so only its headline is spoken, and only when it changes. -->
        <div class="min-w-0">
          <div v-if="!verdict.done" class="grid h-full min-h-40 place-items-center rounded-3xl border-2 border-dashed border-line p-6 text-center lg:min-h-64">
            <div>
              <p class="font-display text-xl">Enter all six bonuses</p>
              <p class="mt-1 text-sm text-fog">{{ verdict.hint }}</p>
            </div>
          </div>
          <template v-else>
            <div class="rounded-3xl bg-card p-4 shadow-[0_1px_2px_rgb(var(--shade)/.06)] sm:p-5">
              <p class="flex items-start gap-2.5 rounded-2xl px-4 py-3" :class="verdict.tone">
                <StatusIcon :paths="verdict.stop ? CHECK_ICON : WARN" class="mt-1 h-5 w-5 shrink-0" />
                <span><strong class="font-display text-2xl leading-tight font-bold">{{ verdict.head }}</strong>
                  <span class="mt-0.5 block text-sm text-ink">{{ verdict.sub }}</span></span>
              </p>

              <ul class="mt-3 divide-y divide-ink/10">
                <li v-for="r in verdict.rows" :key="r.title" class="flex items-start gap-2.5 py-2.5">
                  <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" :class="r.ok ? 'bg-moss text-on' : 'bg-leaf text-fog'">
                    <StatusIcon :paths="r.ok ? CHECK_ICON : CROSS" class="h-3.5 w-3.5 shrink-0" />
                  </span>
                  <span class="min-w-0"><span class="font-bold">{{ r.title }}</span> <span class="text-sm" :class="r.ok ? 'text-moss' : 'text-fog'">{{ r.ok ? 'Met' : 'Not met' }}</span>
                    <span class="block text-sm text-fog">{{ r.text }}<strong v-if="r.total !== null" class="text-ink">{{ r.total }}</strong>{{ r.tail }}</span></span>
                </li>
              </ul>
            </div>

            <div class="mt-4 rounded-3xl bg-card p-4 shadow-[0_1px_2px_rgb(var(--shade)/.06)] sm:p-5">
              <h3 class="font-display text-xl font-bold">{{ verdict.stop ? 'Relics for this roll' : 'Relics once you stop' }}</h3>
              <p class="mt-0.5 text-sm text-fog">{{ verdict.why }}</p>
              <div class="mt-3 grid gap-3 xl:grid-cols-2">
                <div v-for="p in verdict.picks" :key="p.b.n">
                  <p class="mb-1 text-xs font-bold text-fog">{{ p.when }}</p>
                  <a :href="`#build-${p.b.n}`" class="pick press block rounded-2xl ring-1 ring-ink/10"><RelicBuildCard :b="p.b" :tiles="tilesOf(p.b)" /></a>
                </div>
              </div>
            </div>
          </template>
        </div>
        <p class="sr-only" aria-live="polite">{{ verdict.say }}</p>
        <p class="sr-only" aria-live="polite">{{ countText }}</p>
      </section>

      <section aria-labelledby="stop-h" class="mt-14">
        <h2 id="stop-h" class="chapter font-display text-2xl sm:text-3xl font-bold">When to stop rebonusing</h2>
        <p class="mt-1 max-w-2xl text-fog">Stop once any one of these is true of your bonuses. Every miscrit has more than one good build, so stay open to what the roll gives you.</p>
        <ol class="mt-4 grid gap-3 sm:grid-cols-3">
          <li v-for="s in STOPS" :key="s.k" class="flex items-end justify-between gap-4 rounded-2xl bg-card p-4">
            <div class="min-w-0">
              <span class="grid h-7 w-7 place-items-center rounded-full bg-leaf font-display text-sm font-bold">{{ s.k }}</span>
              <p class="mt-3 font-display text-4xl leading-none font-bold"><span class="text-fog">&lt;</span> {{ s.limit }}</p>
              <p class="mt-1.5 text-sm text-fog">{{ s.text }}</p>
            </div>
            <div class="flex h-14 shrink-0 items-end gap-1" aria-hidden="true">
              <span v-for="(h, i) in BARS" :key="i" class="w-2 rounded-xs" :class="i < s.n ? 'bg-moss' : 'bg-leaf'" :style="{ height: `${h}%` }" />
            </div>
          </li>
        </ol>
        <div class="mt-4 rounded-2xl border border-ink/10 p-4">
          <p class="text-sm"><strong>Your highest bonus goes on the attack you use.</strong> <span class="text-fog">Then, most to least:</span></p>
          <dl class="mt-3 space-y-2">
            <div v-for="p in PRIORITY" :key="p.who" class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <dt class="w-20 shrink-0 text-xs font-bold text-fog">{{ p.who }}</dt>
              <dd>
                <ol class="flex flex-wrap items-center gap-1.5" :aria-label="`${p.who} priority`">
                  <li v-for="(step, i) in p.steps" :key="step" class="flex items-center gap-1.5">
                    <svg v-if="i" class="h-3.5 w-3.5 text-fog" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                    <span class="rounded-full border px-2.5 py-0.5 text-sm font-bold" :class="i ? 'border-line' : 'border-ink bg-ink text-on'">{{ step }}</span>
                  </li>
                </ol>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="deprio-h" class="mt-14">
        <h2 id="deprio-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Which deprio to use</h2>
        <p class="mt-1 max-w-2xl text-fog">With 2/6 and the deprio pity system, a roll that clears a stop line takes about 10 tries on average, well under 500 plats.</p>
        <div class="mt-4 overflow-hidden rounded-3xl border border-ink/10 bg-card">
          <ul class="divide-y divide-ink/10">
            <li v-for="d in DEPRIO" :key="d.n" class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 p-4 sm:grid-cols-[5.5rem_9rem_minmax(0,1fr)_auto]">
              <div>
                <p class="font-display text-xl">{{ d.n }}/6</p>
                <div class="mt-1 flex gap-0.5" aria-hidden="true">
                  <span v-for="i in 6" :key="i" class="h-2.5 w-2.5 rounded-xs" :class="i <= d.n ? 'slot-off' : 'slot-on'" />
                </div>
              </div>
              <p class="text-sm sm:order-0"><span class="text-fog">Deprio </span><strong>{{ d.wastes || 'n/a' }}</strong></p>
              <p class="col-span-2 text-sm text-fog sm:col-span-1">{{ d.use }}</p>
              <span class="col-span-2 justify-self-start rounded-full px-2.5 py-0.5 text-xs font-bold sm:col-span-1 sm:justify-self-end" :class="d.tone">{{ d.tag }}</span>
            </li>
          </ul>
        </div>
        <p class="mt-3 max-w-2xl text-sm text-fog">The third stat you give up is usually HP.</p>
      </section>

      <section aria-labelledby="builds-h" class="mt-14">
        <h2 id="builds-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Relic builds</h2>
        <p class="mt-1 max-w-2xl text-fog">Builds 1 to 11. Only go slow on a 1/5 speed miscrit with under 7 speed bonus; otherwise a standard bruiser or tank is worth more.</p>
        <div class="mt-4 space-y-8">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Build colours">
            <li v-for="l in LEAN" :key="l.stat" class="flex items-center gap-1.5">
              <StatTile :icon="STAT[l.stat].icon" :hue="STAT_HUE[STAT[l.stat].col]" class="grid h-5 w-5 shrink-0 place-items-center rounded-md" svg-class="h-[65%] w-[65%]" />
              <span>{{ l.label }}</span>
            </li>
          </ul>
          <div v-for="g in GROUPS" :key="g.k">
            <h3 class="font-display text-sm text-fog">{{ g.title }}</h3>
            <div class="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <RelicBuildCard v-for="b in BUILDS.filter(x => x.group === g.k)" :key="b.n" :b="b" :tiles="tilesOf(b)" anchor />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="rules-h" class="mt-14">
        <h2 id="rules-h" class="chapter font-display text-2xl sm:text-3xl font-bold">Choosing between builds</h2>
        <p class="mt-1 max-w-2xl text-fog">Match your miscrit to one side of each question. Build numbers jump to the build.</p>
        <div class="mt-4 overflow-hidden rounded-3xl border border-ink/10 bg-card">
          <ul class="divide-y divide-ink/10">
            <li v-for="c in CHOICES" :key="c.q" class="grid gap-x-6 gap-y-3 p-4 sm:p-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
              <div>
                <h3 class="font-display text-xl leading-tight font-bold">{{ c.q }}</h3>
                <p v-if="c.note" class="mt-1 text-sm text-fog">{{ c.note }}</p>
              </div>
              <div class="grid gap-3 md:grid-cols-2 md:gap-0 md:divide-x md:divide-ink/10">
                <div v-for="(o, i) in c.opts" :key="o.when" class="min-w-0" :class="i ? 'border-t border-ink/10 pt-3 md:border-t-0 md:pt-0 md:pl-5' : 'md:pr-5'">
                  <p class="font-display text-lg leading-snug">{{ o.when }}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-1.5">
                    <svg class="h-4 w-4 shrink-0 text-fog" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
                    <a
                      v-for="n in o.builds" :key="n" :href="`#build-${n}`" :style="badge(n)"
                      class="press grid h-8 min-w-8 place-items-center rounded-lg px-1.5 font-display text-base"
                    ><span class="sr-only">Build </span>{{ n }}</a>
                    <template v-for="([r, col, n], j) in o.relics" :key="r">
                      <span v-if="j && !n" class="text-xs text-fog">or</span>
                      <span class="inline-flex items-center gap-1">
                        <a v-if="n" :href="`#build-${n}`" :style="badge(n)" class="press grid h-6 min-w-6 place-items-center rounded-md px-1 font-display text-xs"><span class="sr-only">Build </span>{{ n }}</a>
                        <span class="relic rounded-lg px-2 py-1 text-sm font-bold" :style="tint(col)">{{ r }}</span>
                      </span>
                    </template>
                    <span v-if="o.then" class="text-sm text-fog">{{ o.then }}</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>
