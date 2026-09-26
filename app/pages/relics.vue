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

// Form
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
        <h1 class="chapter font-display text-3xl tracking-tight sm:text-4xl" style="font-weight:700">Relic and bonus guide</h1>
        <p class="mt-2 max-w-2xl text-fog">Rebonus first, relic second: your bonuses decide the build. Check a roll below to see whether to stop, and which relics fit it.</p>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6">
      <!-- Checker -->
      <section aria-labelledby="check-h" class="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <form class="rounded-3xl border border-ink/10 bg-card p-4 shadow-[0_1px_2px_rgb(var(--shade)/.06)] sm:p-5" autocomplete="off" novalidate @submit.prevent>
          <div class="flex items-baseline justify-between gap-3">
            <h2 id="check-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Check a rebonus</h2>
            <button type="button" class="press rounded-lg px-2 py-1 text-sm font-bold text-moss underline decoration-moss/40 underline-offset-4" @click="loadExample">Load example</button>
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
            <select v-model="state.spd" class="mt-1 h-11 w-full rounded-xl border border-line bg-card px-3 text-base" aria-describedby="spd-help">
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
                <span><strong class="font-display text-2xl leading-tight" style="font-weight:700">{{ verdict.head }}</strong>
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
              <h3 class="font-display text-xl" style="font-weight:700">{{ verdict.stop ? 'Relics for this roll' : 'Relics once you stop' }}</h3>
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

      <!-- Rebonus reference -->
      <section aria-labelledby="stop-h" class="mt-14">
        <h2 id="stop-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">When to stop rebonusing</h2>
        <p class="mt-1 max-w-2xl text-fog">Stop once any one of these is true of your bonuses. Every miscrit has more than one good build, so stay open to what the roll gives you.</p>
        <ol class="mt-4 grid gap-3 sm:grid-cols-3">
          <li class="rounded-2xl bg-card p-4"><p class="text-xs font-bold text-fog">A</p><p class="font-display text-xl">Lowest three add up to under 45</p></li>
          <li class="rounded-2xl bg-card p-4"><p class="text-xs font-bold text-fog">B</p><p class="font-display text-xl">Lowest two add up to under 28</p></li>
          <li class="rounded-2xl bg-card p-4"><p class="text-xs font-bold text-fog">C</p><p class="font-display text-xl">Lowest single stat under 8</p></li>
        </ol>
        <p class="mt-3 max-w-2xl text-sm text-fog">Your highest bonus should always land on the attack you use. Priority is <strong class="text-ink">attack, then ED/PD, then HP</strong> for standard miscrits, and <strong class="text-ink">attack 1, then ED/PD, then attack 2, then HP</strong> for hybrids.</p>
      </section>

      <section aria-labelledby="deprio-h" class="mt-14">
        <h2 id="deprio-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Which deprio to use</h2>
        <p class="mt-1 max-w-2xl text-fog">With 2/6 and the deprio pity system, a good roll takes about 10 tries on average, well under 500 plats.</p>
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
        <p class="mt-3 max-w-2xl text-sm text-fog">The third stat you give up is usually HP. There are exceptions, but that is the general rule.</p>
      </section>

      <section aria-labelledby="builds-h" class="mt-14">
        <h2 id="builds-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Relic builds</h2>
        <p class="mt-1 max-w-2xl text-fog">Numbered as the guide numbers them. Only go slow on a 1/5 speed miscrit with under 7 speed bonus; otherwise a standard bruiser or tank is worth more.</p>
        <div class="mt-4 space-y-8">
          <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Build colours">
            <li v-for="l in LEAN" :key="l.stat" class="flex items-center gap-1.5">
              <StatTile :icon="STAT[l.stat].icon" :hue="STAT_HUE[STAT[l.stat].col]" class="grid h-5 w-5 shrink-0 place-items-center rounded-md" svg-class="h-[65%] w-[65%]" />
              <span>{{ l.label }}</span>
            </li>
          </ul>
          <div v-for="g in GROUPS" :key="g.k">
            <h3 class="font-display text-sm uppercase tracking-wide text-fog">{{ g.title }}</h3>
            <div class="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <RelicBuildCard v-for="b in BUILDS.filter(x => x.group === g.k)" :key="b.n" :b="b" :tiles="tilesOf(b)" anchor />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="rules-h" class="mt-14">
        <h2 id="rules-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Choosing between builds</h2>
        <ul class="mt-4 grid gap-3 md:grid-cols-2">
          <li class="rounded-2xl bg-card p-4"><p class="font-display text-xl">Lots of true damage</p><p class="mt-1 text-sm text-fog">Lean toward a defensive tank, builds 5 to 8.</p></li>
          <li class="rounded-2xl bg-card p-4"><p class="font-display text-xl">Lots of raw damage or healing</p><p class="mt-1 text-sm text-fog">Lean toward a bruiser stat check, builds 1 to 4.</p></li>
          <li class="rounded-2xl bg-card p-4"><p class="font-display text-xl">Snipers</p><p class="mt-1 text-sm text-fog">Only relic a sniper you stopped on B or C. Bruiser (build 10) is always safe. Some can run the speed build (9), depending on the meta; if in doubt, build 10.</p></li>
          <li class="rounded-2xl bg-card p-4"><p class="font-display text-xl">Temple Stone or Magicite Staff, Vanquished Soul or Dark Warro Thorn</p><p class="mt-1 text-sm text-fog">For builds 10 and 11: a miscrit with 3/5 or better defenses and more than 25 bonus gets more duel value from Temple Stone or Vanquished Soul.</p></li>
          <li class="rounded-2xl bg-card p-4 md:col-span-2"><p class="font-display text-xl">Bauble or Gold Piece / White Gem, for hybrids</p><p class="mt-1 text-sm text-fog">If the miscrit already heals or blocks, Gold Piece is usually better. If it stacks stats or has lower HP, Bauble is better.</p></li>
        </ul>
      </section>
    </main>
  </div>
</template>
