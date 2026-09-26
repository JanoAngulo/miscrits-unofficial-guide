<script setup lang="ts">
import type { MiscritSummary } from '#shared/types/miscrit'

// Platinum Arena team guide: a four-slot builder that checks a team against the guide's rules, over the rules
// themselves. The team lives in the address bar (#team=...) and localStorage, both read only once mounted: the page
// is prerendered with the example team.
definePageMeta({ chapter: 'teams' })
useSeoMeta({
  title: 'Platinum Arena Teams',
  description: 'Build a four-miscrit, 12-point Platinum Arena team: roles from speed, cover links from the element cycles, and the checks a team should pass.',
})

const lines = useMiscritList()
const book = makeTeamBook(lines)
const { find } = book

const blank = () => Array<string>(TEAM_SIZE).fill('')
const normalise = (names: unknown[]) => Array.from({ length: TEAM_SIZE }, (_, i) => book.finalOf(names[i] as string)?.name || '')

const team = ref(normalise(TEAM_EXAMPLE))
// What was typed into each picker, kept while it names no final evolution, and the picker's own text.
const typed = ref(blank())
const texts = ref([...team.value])
const rollNote = ref('Random team rolls four that pass every check. Fill the gaps keeps your picks and fills the empty slots.')

const report = computed(() => teamReport(team.value, book))
const strip = computed(() => teamStrip(report.value.es))

// Nothing animates on a keyboard action: note how the last action came in.
const kbd = ref(false)
useHead({ htmlAttrs: { class: () => (kbd.value ? 'kbd' : '') } })
const onKey = () => { kbd.value = true }
const onPointer = () => { kbd.value = false }

function load() {
  // A hand-edited or truncated address must not stop the page: a name that won't decode is just empty.
  const dec = (s: string) => { try { return decodeURIComponent(s) } catch { return '' } }
  let names: unknown = location.hash.startsWith('#team=') ? location.hash.slice(6).split(',').map(dec) : null
  if (!names) { try { names = JSON.parse(localStorage.getItem(TEAM_STORE_KEY)!) } catch { names = null } }
  if (!Array.isArray(names)) names = TEAM_EXAMPLE
  team.value = normalise(names as unknown[])
}
// Replaces the entry, so building a team adds no history. The router's own state is kept on it.
function save() {
  try { localStorage.setItem(TEAM_STORE_KEY, JSON.stringify(team.value)) } catch {}
  const url = team.value.some(Boolean) ? `#team=${team.value.map(encodeURIComponent).join(',')}` : location.pathname + location.search
  try { history.replaceState(history.state, '', url) } catch {}
}
const syncInputs = () => { texts.value = team.value.map((n, i) => n || typed.value[i] || '') }

function setSlot(i: number, name: string, text = name) {
  team.value[i] = name
  typed.value[i] = text
  save()
}
function setTeam(names: unknown[]) {
  team.value = normalise(names)
  typed.value = blank()
  syncInputs()
  save()
}

function onHash() {
  if (!location.hash.startsWith('#team=')) return
  load()
  typed.value = blank()
  syncInputs()
  save()
}
onMounted(() => {
  load()
  syncInputs()
  save()
  addEventListener('hashchange', onHash)
  addEventListener('keydown', onKey, true)
  addEventListener('pointerdown', onPointer, true)
})
onBeforeUnmount(() => {
  removeEventListener('hashchange', onHash)
  removeEventListener('keydown', onKey, true)
  removeEventListener('pointerdown', onPointer, true)
})

// ---------------------------------------------------------------- Slots
const slotContext = (i: number) => teamSlotContext(team.value, i, book)
const search = (i: number, q: string) => teamOptions(q, slotContext(i), book)
const slugOf = (e: TeamEntry) => e.m.slugs[e.i] || e.m.slugs[0]!
const pointWord = (n: number) => (n === 1 ? 'point' : 'points')
// Above a picker's options once the team has others in it: what the ranking is looking for.
function slotNote(i: number) {
  const c = slotContext(i)
  const wants = [c.prev && `covers ${c.prev.name}`, c.next && `${c.next.name} can cover`].filter(Boolean)
  return `Best fit first${wants.length ? `: ${wants.join(', ')}` : ''}. ${Math.max(0, c.left)} ${pointWord(c.left)} to spend.`
}

function onType(i: number, v: string) {
  texts.value[i] = v
  const e = find(v)
  setSlot(i, book.isFinal(e) ? e!.name : '', v)
}
function choose(i: number, o: TeamOption) {
  texts.value[i] = o.e.name
  setSlot(i, o.e.name)
}
// Keep the list on screen: the last slot's picker sits near the right edge.
function placeList(i: number) {
  nextTick(() => {
    const list = document.getElementById(`pick-${i}-list`)
    if (!list) return
    list.style.left = ''
    const over = list.getBoundingClientRect().right - (document.documentElement.clientWidth - 8)
    if (over > 0) list.style.left = `${-over}px`
  })
}
// The picker shows the full name on hover, which its ellipsis may cut.
watchEffect(() => {
  if (!import.meta.client) return
  team.value.forEach((n, i) => {
    const box = document.getElementById(`pick-${i}`)
    if (box) box.title = find(n) ? find(n)!.name : ''
  })
}, { flush: 'post' })

function move(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= TEAM_SIZE) return
  const t = team.value, y = typed.value;
  [t[i], t[j]] = [t[j]!, t[i]!];
  [y[i], y[j]] = [y[j]!, y[i]!]
  syncInputs()
  save()
  // Follow the miscrit that moved; if that button is now at an end, use its partner.
  nextTick(() => {
    const next = document.querySelector<HTMLButtonElement>(`[data-i="${j}"][data-move="${dir}"]`)
    const other = document.querySelector<HTMLButtonElement>(`[data-i="${j}"][data-move="${-dir}"]`)
    ;(next && !next.disabled ? next : other)?.focus()
  })
}
function empty(i: number) {
  setSlot(i, '')
  texts.value[i] = ''
  document.getElementById(`pick-${i}`)?.focus()
}
function emptyHint(i: number) {
  const t = typed.value[i]
  const early = t ? find(t) : null
  if (early) return `${early.name} is an earlier form. Teams take final forms: pick ${early.m.names.at(-1)}.`
  if (t) return `No miscrit named “${t.trim()}”. Pick one from the list.`
  return i === 0 ? 'Your slowest miscrit usually starts.' : 'Pick the miscrit that covers the one before.'
}

// ---------------------------------------------------------------- Random builds
function applyRoll(keep: (TeamEntry | null)[]) {
  const r = teamRoll(keep, book)
  const kept = keep.filter(Boolean).length
  if (!r) { rollNote.value = 'No legal fill fits around these picks. Clear or swap one and try again.'; return }
  setTeam(r.ms.map(m => m.names.at(-1)))
  const yours = kept === 1 ? 'pick' : `${kept} picks`
  rollNote.value = !kept
    ? (r.perfect ? 'Rolled a team that passes every check. Roll again for another.' : 'Rolled the closest team found. See what\'s left below, or roll again.')
    : r.perfect ? `Kept your ${yours} and filled the rest. Every check passes.`
      : `Kept your ${yours}. No fill passes every check around them, so this is the closest. See what's left below.`
}
const fillOff = computed(() => !report.value.picked.length || report.value.picked.length === TEAM_SIZE)

function clearAll() {
  setTeam([])
  document.getElementById('pick-0')?.focus()
}
function loadTrain() {
  setTeam(TEAM_EXAMPLE)
  const instant = kbd.value || matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('builder')?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' })
  document.getElementById('build-h')?.focus({ preventScroll: true })
}

// ---------------------------------------------------------------- Guide
const RARITIES = Object.keys(RARITY)
const ROLES = [
  { bars: 5, label: 'Sniper', range: '4/5 speed and above', pair: 'Give it 2 or 3 tanks or bruisers to cover. They should be of the element that beats the sniper: a Lightning sniper protects Earth, because Lightning beats the Wind that threatens Earth.' },
  { bars: 3, label: 'Fast bruiser', range: '3/5 speed', pair: 'Usually built the same way as a sniper: fast enough to cover slower teammates.' },
  { bars: 2, label: 'Tank or bruiser', range: '2/5 speed and below', pair: 'Find a sniper of the element it beats to cover it. Then build around that sniper as above.' },
]
const moveIcon = (icon: string) => [`/assets/abilities/${icon}.png`, `https://www.worldofmiscrits.com/${icon}.png`]
const named = (names: string[]) => names.map(find).filter((e): e is TeamEntry => !!e)

// Each story is checked against the cycles when it renders, so the reason line is computed, not typed. A renamed or
// retyped miscrit in a future feed drops its story instead of stopping the page.
function story(coverers: string[], covered: string[], against: string) {
  const a = find(coverers[0]), b = find(covered[0]), t = find(against)
  if (!a || !b || !t) return []
  const threat = parts(t.m.element).find(p => teamThreats(b.m).includes(p))
  const by = parts(a.m.element).find(p => TEAM_BEATS[p] === threat)
  if (!threat || !by) return []
  return [{ coverers: named(coverers), covered: named(covered), against: t, a, b, threat, by }]
}
const stories = [
  ...story(['Boltzee'], ['Beateorite', 'Sledgehog', 'Drilldent'], 'Octavio'),
  ...story(['Blighted Flowerpiller'], ['Dark Slithero'], 'Foil Waddles'),
  ...story(['Sledgehog'], ['Foil Vhisp'], 'Lithos'),
]
const dual = (() => {
  const a = find('Dorux'), b = find('Nanaslug')
  if (!a || !b) return []
  const pair = (x: TeamEntry, y: TeamEntry) => {
    const c = teamCover(x.m, y.m)[0]
    return c ? [{ x, y, c, half: parts(y.m.element).find(p => TEAM_BEATEN_BY[p] === c.threat)! }] : []
  }
  return [...pair(a, b), ...pair(b, a)]
})()

// The example train, drawn from the feed with the links worked out.
const train = TEAM_EXAMPLE.flatMap((n, i) => {
  const e = find(n)
  if (!e) return []
  const prev = i ? find(TEAM_EXAMPLE[i - 1]) : null
  const c = prev ? teamCover(e.m, prev.m) : []
  const note = i === 0
    ? `Starts: ${teamSpeed(e.m)}/5 speed, and not a Legendary.`
    : c.length ? `Covers ${prev!.name}: ${c.map(x => `${x.by} beats the ${x.threat} that threatens it`).join('; ')}.` : `Doesn't cover ${prev!.name}.`
  return [{ e, i, c, note }]
})
const roleLabel = (m: MiscritSummary) => teamRole(m).label
</script>

<template>
  <div class="teams-page">
    <div class="border-b border-ink/10">
      <div class="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6">
        <h1 class="chapter font-display text-3xl tracking-tight sm:text-4xl" style="font-weight:700">Platinum Arena team guide</h1>
        <p class="mt-2 max-w-2xl text-fog">Four miscrits, twelve points. Build around one miscrit, cover its weakness, then chain the rest so each one covers the one before it.</p>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6">
      <!-- Builder -->
      <section id="builder" aria-labelledby="build-h" class="rounded-3xl border border-ink/10 bg-card p-4 shadow-[0_1px_2px_rgb(var(--shade)/.06)] sm:p-5">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 id="build-h" tabindex="-1" class="chapter font-display text-2xl focus:outline-hidden sm:text-3xl" style="font-weight:700">Build a team</h2>
          <div class="flex gap-1">
            <button type="button" class="press ghost rounded-lg px-2.5 py-1.5 text-sm font-bold text-moss underline decoration-moss/40 underline-offset-4" @click="setTeam(TEAM_EXAMPLE)">Load example</button>
            <button type="button" class="press ghost rounded-lg px-2.5 py-1.5 text-sm font-bold text-fog" @click="clearAll">Clear all</button>
          </div>
        </div>

        <!-- Random builds -->
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" class="press inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-on" @click="applyRoll(Array(TEAM_SIZE).fill(null))">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" /></svg>
            Random team
          </button>
          <button type="button" class="press rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-bold disabled:cursor-default disabled:opacity-40" :disabled="fillOff" @click="applyRoll(team.map(find))">Fill the gaps</button>
          <p class="text-sm text-fog" aria-live="polite">{{ rollNote }}</p>
        </div>

        <!-- Points -->
        <div class="mt-4">
          <div class="flex items-baseline justify-between gap-3">
            <p class="text-sm font-bold">Rarity points</p>
            <p class="text-sm text-fog" aria-live="polite">
              <strong v-if="report.over" class="text-rust">{{ report.pts }} of {{ TEAM_CAP }}, {{ report.over }} over</strong>
              <template v-else><strong class="text-ink">{{ report.pts }} of {{ TEAM_CAP }}</strong>{{ report.pts < TEAM_CAP ? `, ${TEAM_CAP - report.pts} to spare` : '' }}</template>
            </p>
          </div>
          <div class="mt-1.5 flex gap-1" aria-hidden="true">
            <span
              v-for="(c, n) in strip" :key="n" class="cell flex-1" :class="{ 'cell-over': c.over, 'ml-1.5': c.gap }"
              :style="c.ring ? { background: c.ring, boxShadow: 'none' } : undefined"
            />
          </div>
        </div>

        <!-- Slots, in battle order -->
        <ol id="slots" class="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-10" aria-label="Team, in battle order">
          <li
            v-for="(e, i) in report.es" :key="i" class="slot relative flex min-w-0 flex-col rounded-3xl border-2 p-3.5"
            :class="{ 'border-dashed border-line bg-paper/40': !e }" :style="e ? { borderColor: `${rarityLook(e.m.rarity).ring}66` } : undefined"
          >
            <div><TeamsLinkRow :entry="e" :prev="report.es[i - 1] ?? null" :i="i" /></div>
            <div class="flex items-center justify-between gap-2">
              <p class="flex items-baseline gap-1.5"><span class="font-display text-lg leading-none" style="font-weight:700">{{ i + 1 }}</span><span class="text-xs font-bold text-fog">{{ i === 0 ? 'Starter' : '' }}</span></p>
              <div class="-mr-1.5 flex">
                <button
                  type="button" class="icon-btn press grid h-9 w-9 place-items-center rounded-full text-fog" data-move="-1" :data-i="i"
                  :aria-label="`Move ${e ? `${e.name}, slot ${i + 1}` : `slot ${i + 1}`}, earlier`" :disabled="i === 0 || (!e && !report.es[i - 1])" @click="move(i, -1)"
                ><StatusIcon :paths="TEAM_ICON.earlier" class="h-5 w-5 shrink-0" /></button>
                <button
                  type="button" class="icon-btn press grid h-9 w-9 place-items-center rounded-full text-fog" data-move="1" :data-i="i"
                  :aria-label="`Move ${e ? `${e.name}, slot ${i + 1}` : `slot ${i + 1}`}, later`" :disabled="i === TEAM_SIZE - 1 || (!e && !report.es[i + 1])" @click="move(i, 1)"
                ><StatusIcon :paths="TEAM_ICON.later" class="h-5 w-5 shrink-0" /></button>
                <button
                  type="button" class="icon-btn press grid h-9 w-9 place-items-center rounded-full text-fog"
                  :aria-label="e ? `Remove ${e.name} from slot ${i + 1}` : `Empty slot ${i + 1}`" :disabled="!e && !typed[i]" @click="empty(i)"
                ><StatusIcon :paths="TEAM_ICON.cross" class="h-5 w-5 shrink-0" /></button>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-3">
              <span>
                <TeamsFramed v-if="e" :entry="e" :size="52" />
                <span v-else class="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-2xl bg-leaf text-fog"><StatusIcon :paths="TEAM_ICON.plus" class="h-5 w-5 shrink-0" /></span>
              </span>
              <label :for="`pick-${i}`" class="sr-only">Slot {{ i + 1 }} miscrit</label>
              <MiscritCombobox
                :id="`pick-${i}`" :model-value="texts[i]" :search="(q: string) => search(i, q)" placeholder="Add a miscrit"
                empty-text="No final evolution by that name."
                input-class="h-11 w-full rounded-xl border border-line bg-card px-3 font-display text-lg placeholder:font-body placeholder:text-base placeholder:text-fog"
                @update:model-value="onType(i, $event)" @choose="choose(i, $event)" @list="placeList(i)"
              >
                <template #note="{ items }">
                  <li v-if="items.length && slotContext(i).others.length" role="none" class="px-2 pb-1.5 pt-1 text-xs text-fog">{{ slotNote(i) }}</li>
                </template>
                <template #option="{ item }">
                  <MiscritImg :slug="slugOf(item.e)" class="h-9 w-9 rounded-lg shrink-0 bg-leaf object-cover" />
                  <span class="min-w-0 flex-1"><span class="block truncate font-display text-base leading-tight">{{ item.e.name }}</span>
                    <span class="flex min-w-0 items-center gap-1 text-xs text-fog"><ElementIcon :element="item.e.m.element" class="h-3.5 w-3.5" /><span class="truncate">{{ parts(item.e.m.element).join(' and ') }}, {{ roleLabel(item.e.m).toLowerCase() }}</span></span>
                    <span v-if="item.tags.length" class="block truncate text-xs font-bold"><template v-for="([tone, words], n) in item.tags" :key="n"><span v-if="n" class="text-fog"> · </span><span :class="TEAM_TAG_TONE[tone]">{{ words }}</span></template></span></span>
                  <span class="shrink-0 text-xs font-bold" :style="{ color: rarityLook(item.e.m.rarity).text }">{{ teamPoints(item.e.m.rarity) }}<span class="sr-only"> points</span></span>
                </template>
              </MiscritCombobox>
            </div>
            <div class="flex flex-1 flex-col">
              <TeamsSlotDetail v-if="e" :entry="e" :utility="book.utilityOf(e.m)" />
              <p v-else class="mt-3 text-sm text-fog">{{ emptyHint(i) }}</p>
            </div>
          </li>
        </ol>

        <!-- Checks -->
        <div class="mt-5" aria-live="polite">
          <p class="flex items-center gap-2.5 rounded-2xl px-4 py-3" :class="report.summary.tone">
            <StatusIcon :paths="report.summary.icon" class="h-5 w-5 self-start mt-1 sm:mt-0 sm:self-center shrink-0" />
            <span class="flex flex-wrap items-baseline gap-x-3"><strong class="font-display text-2xl leading-tight" style="font-weight:700">{{ report.summary.head }}</strong>
              <span class="text-sm text-ink">{{ report.summary.sub }}</span></span>
          </p>
        </div>
        <ul class="mt-2 grid gap-x-8 lg:grid-cols-2 [&>li:last-child]:border-0 lg:[&>li:nth-last-child(2)]:border-0">
          <li v-for="c in report.checks" :key="c.title" class="flex items-start gap-2.5 border-b border-ink/10 py-2.5">
            <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" :class="TEAM_CHECK_LOOK[c.state].cls"><StatusIcon :paths="TEAM_CHECK_LOOK[c.state].icon" class="h-3.5 w-3.5 shrink-0" /></span>
            <span class="min-w-0"><span class="font-bold">{{ c.title }}</span> <span class="sr-only">{{ TEAM_CHECK_LOOK[c.state].word }}.</span>
              <span class="block text-sm text-fog"><template v-for="(l, n) in c.lines" :key="n"><br v-if="n">{{ l }}</template></span></span>
          </li>
        </ul>
        <p class="mt-3 text-xs text-fog">Roles, attacks and defenses are read from base stats. Bonuses and relics move the real numbers, so treat them as a starting point. The address bar keeps this team, so you can bookmark or share it.</p>
      </section>

      <!-- Rules -->
      <section aria-labelledby="rules-h" class="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <h2 id="rules-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">How Platinum Arena works</h2>
          <p class="mt-2 max-w-2xl">Platinum Arena is the game's main PvP format. A team is four miscrits worth <strong>12 rarity points</strong> or fewer, and potions are banned.</p>
          <p class="mt-3 max-w-2xl">The cap is there to keep the meta varied. Two Legendaries cost 10 points, which leaves room for only two Commons beside them, so no small group of miscrits can dominate for good.</p>
          <h3 class="mt-6 font-display text-xl" style="font-weight:700">Leaderboards</h3>
          <p class="mt-1 max-w-2xl">Every arena has a leaderboard. The most points go to <strong>16/16</strong> teams: four relics on every miscrit, so nobody climbs by farming weaker teams. In Platinum Arena only, the top 200 when the arena resets on Monday get extra rewards. For picking those relics, see the <NuxtLink to="/relics" class="font-bold text-moss underline decoration-moss/40 underline-offset-4">relic and bonus guide</NuxtLink>.</p>
          <h3 class="mt-6 font-display text-xl" style="font-weight:700">Accuracy</h3>
          <p class="mt-1 max-w-2xl">Accuracy is pseudo-random, not a fresh roll each turn. All accuracy is rounded to the nearest 5%, so a 40% move with a 5% accuracy debuff stays at 40%: 38% rounds back up.</p>
        </div>
        <div class="self-start rounded-3xl border border-ink/10 bg-card p-4 sm:p-5">
          <h3 class="font-display text-xl" style="font-weight:700">Points by rarity</h3>
          <ul class="mt-3 space-y-2.5">
            <li v-for="k in RARITIES" :key="k" class="flex items-center gap-3">
              <span class="w-24 shrink-0"><TeamsRarity :rarity="k" /></span>
              <span class="flex flex-1 gap-1" aria-hidden="true">
                <span
                  v-for="n in 5" :key="n" class="h-4 flex-1 rounded-sm" :class="{ 'cell h-4!': n > teamPoints(k) }"
                  :style="n <= teamPoints(k) ? { background: rarityLook(k).ring } : undefined"
                />
              </span>
              <span class="w-16 shrink-0 text-right text-sm font-bold">{{ teamPoints(k) }} {{ pointWord(teamPoints(k)) }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Roles -->
      <section aria-labelledby="roles-h" class="mt-14">
        <h2 id="roles-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Start with one miscrit</h2>
        <p class="mt-2 max-w-2xl">Pick the miscrit you want to build around, because you like it or because it is strong in the current meta. Its speed decides its role, and its role decides who goes with it.</p>
        <ul class="mt-4 divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-card">
          <li v-for="r in ROLES" :key="r.label" class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
            <div>
              <p class="flex items-center gap-2.5"><TeamsSpeedBars :n="r.bars" /><span class="font-display text-xl" style="font-weight:700">{{ r.label }}</span></p>
              <p class="mt-0.5 text-sm text-fog">{{ r.range }}</p>
            </div>
            <p class="max-w-2xl">{{ r.pair }}</p>
          </li>
          <li class="p-4 text-sm text-fog sm:p-5">It works the other way round too: a tank or bruiser can cover the team's sniper just by being strong against what threatens it.</li>
        </ul>
      </section>

      <!-- Speed -->
      <section aria-labelledby="speed-h" class="mt-14">
        <h2 id="speed-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Why speed decides the role</h2>
        <p class="mt-2 max-w-2xl">At the start of a battle the faster miscrit moves first, and a tie is picked at random. From then on, the player with the slower miscrit holds <strong>speed control</strong>.</p>
        <ul class="mt-4 divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-card">
          <li class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
            <div>
              <p class="font-display text-xl" style="font-weight:700">Sniping</p>
              <p class="mt-1 flex items-center gap-2 text-sm text-fog"><span><TeamsSpeedBars :n="5" /></span>Faster than the enemy</p>
            </div>
            <p class="max-w-2xl">While you hold speed control, swapping in a miscrit faster than the enemy's gives you a <strong>double turn</strong>: you swap, then move again before they can. Most often that is a fast elemental attacker landing a strong hit. Speed control then passes to the other player, and you can't snipe again until they use theirs.</p>
          </li>
          <li class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
            <div>
              <p class="font-display text-xl" style="font-weight:700">Slow tanks</p>
              <p class="mt-1 flex items-center gap-2 text-sm text-fog"><span><TeamsSpeedBars :n="1" /></span>Slower than the enemy</p>
            </div>
            <p class="max-w-2xl">A tank is there to take the enemy's snipe. If it is slower than the enemy, speed control comes back to you and your sniper can go next. A tank faster than the enemy can't take it back, which is why players want red (low) speed on their tanks.</p>
          </li>
          <li class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
            <div>
              <p class="font-display text-xl" style="font-weight:700">Status timing</p>
              <!-- The speed rows borrow the role bars and the game's own move icons. -->
              <p class="mt-1 flex items-center gap-2 text-sm text-fog"><span class="flex gap-1"><FallbackImg v-for="icon in ['nature_poison', 'heal']" :key="icon" :sources="moveIcon(icon)" alt="" class="h-5 w-5 shrink-0 object-contain" /></span>Poison, DoT and HoT</p>
            </div>
            <p class="max-w-2xl">DoT, HoT and Poison tick at the end of the turn of whoever holds speed control. Poison an enemy while they hold it and nothing happens until they move, so they can swap out first. A miscrit that relies on these needs speed control to get value from them.</p>
          </li>
        </ul>
        <h3 class="mt-8 font-display text-xl" style="font-weight:700">Swapping</h3>
        <div class="mt-1 grid max-w-2xl gap-3">
          <p>You can swap at any time unless you are Paralyzed. A swap costs your turn, and the miscrit you swap out moves to the end of your party.</p>
          <p>Swapping out clears most status effects. Bleed, Disease and Time-Bombs stay. Swap three times in a row without attacking and you take a damage penalty that keeps growing until you attack.</p>
        </div>
      </section>

      <!-- Cycles -->
      <section aria-labelledby="cycle-h" class="mt-14">
        <h2 id="cycle-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Covering, and the two element cycles</h2>
        <p class="mt-2 max-w-2xl">Most Platinum Arena teams play around one cycle. A miscrit <strong>covers</strong> a teammate when it beats the element that beats that teammate: if the enemy sends in a threat, the cover comes in and punishes it. An attack the target is weak to deals double damage, and one it resists deals half.</p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <TeamsCycle v-for="c in TEAM_CYCLES" :key="c[0]" :cycle="c" />
        </div>
        <h3 class="mt-8 font-display text-xl" style="font-weight:700">Covering in practice</h3>
        <ul class="mt-3 space-y-3">
          <li v-for="s in stories" :key="s.a.name" class="rounded-2xl bg-card p-4">
            <!-- A label stays on the same line as the chips it introduces when the row wraps. -->
            <p class="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span class="flex flex-wrap items-center gap-2"><TeamsChip v-for="x in s.coverers" :key="x.name" :entry="x" with-role /></span>
              <span class="flex flex-wrap items-center gap-2"><span class="text-sm font-bold text-moss">covers</span><TeamsChip v-for="x in s.covered" :key="x.name" :entry="x" with-role /></span>
              <span class="flex flex-wrap items-center gap-2"><span class="text-sm font-bold text-fog">against</span><TeamsChip :entry="s.against" with-role /></span>
            </p>
            <p class="mt-2 text-sm text-fog">{{ s.against.name }}'s <TeamsElWord :el="s.threat" /> beats <template v-for="(p, n) in parts(s.b.m.element)" :key="p"><template v-if="n"> and </template><TeamsElWord :el="p" /></template>. {{ s.a.name }} is <TeamsElWord :el="s.by" />, and <TeamsElWord :el="s.by" /> beats <TeamsElWord :el="s.threat" />, so it comes in and punishes {{ s.against.name }}.</p>
          </li>
        </ul>
      </section>

      <!-- Dual -->
      <section aria-labelledby="dual-h" class="mt-14">
        <h2 id="dual-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Dual-element miscrits</h2>
        <div class="mt-2 grid max-w-3xl gap-3">
          <p>Simpler than it looks. A <strong>dual-element sniper</strong> just needs tanks and bruisers to cover, and maybe one miscrit to cover it back. It can often skip the cover and spend all three other slots on tanks and bruisers.</p>
          <p>A <strong>dual-element tank or bruiser</strong> usually needs a dual-element sniper sharing both elements, or one half covered by the sniper while the other half covers the sniper.</p>
        </div>
        <ul class="mt-4 space-y-3">
          <li v-for="d in dual" :key="d.x.name" class="rounded-2xl bg-card p-4">
            <p class="flex flex-wrap items-center gap-x-3 gap-y-2"><TeamsChip :entry="d.x" /><span class="flex flex-wrap items-center gap-2"><span class="text-sm font-bold text-moss">covers</span><TeamsChip :entry="d.y" /></span></p>
            <p class="mt-2 text-sm text-fog">With its <TeamsElWord :el="d.c.by" /> half. {{ d.y.name }}'s <TeamsElWord :el="d.half" /> half is weak to <TeamsElWord :el="d.c.threat" />, and <TeamsElWord :el="d.c.by" /> beats <TeamsElWord :el="d.c.threat" />.</p>
          </li>
        </ul>
      </section>

      <!-- Balance -->
      <section aria-labelledby="balance-h" class="mt-14">
        <h2 id="balance-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Don't win only one kind of match</h2>
        <p class="mt-2 max-w-2xl">A team that only works in certain match-ups loses the rest. A good Platinum Arena team has:</p>
        <!-- The balance cards borrow the stat tiles, so the words match the builder. -->
        <ul class="mt-4 divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-card">
          <li class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
            <p class="flex items-center gap-2.5">
              <span class="flex gap-1"><StatTile v-for="k in (['physical', 'elemental'] as const)" :key="k" icon="attack" :hue="STAT_HUE[k]" class="grid h-6 w-6 shrink-0 place-items-center rounded-md" svg-class="h-[70%] w-[70%]" /></span>
              <span class="font-display text-xl" style="font-weight:700">Both attacks</span>
            </p>
            <p class="max-w-2xl">Physical and elemental, so one kind of defense can't wall the whole team.</p>
          </li>
          <li class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
            <p class="flex items-center gap-2.5">
              <span class="flex gap-1"><StatTile v-for="k in (['physical', 'elemental'] as const)" :key="k" icon="defense" :hue="STAT_HUE[k]" class="grid h-6 w-6 shrink-0 place-items-center rounded-md" svg-class="h-[70%] w-[70%]" /></span>
              <span class="font-display text-xl" style="font-weight:700">Both defenses</span>
            </p>
            <p class="max-w-2xl">Physical and elemental, so one kind of attack can't run through it.</p>
          </li>
          <li class="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
            <div><p class="font-display text-xl" style="font-weight:700">Some utility</p><p class="text-sm text-fog">Optional</p></div>
            <p class="max-w-2xl">Tools to play around: {{ TEAM_UTILITY.map(u => u.label.toLowerCase()).join(', ') }}.</p>
          </li>
        </ul>
      </section>

      <!-- Order -->
      <section aria-labelledby="order-h" class="mt-14">
        <h2 id="order-h" class="chapter font-display text-2xl sm:text-3xl" style="font-weight:700">Put them in order like a train</h2>
        <div class="mt-2 grid max-w-3xl gap-3">
          <p><strong>Slowest first.</strong> Leading with your slowest miscrit makes you more likely to have the second turn, so you start with <a href="#speed-h" class="font-bold text-moss underline decoration-moss/40 underline-offset-4">speed control</a>.</p>
          <p><strong>Then its cover.</strong> Second goes the miscrit that covers the first one's weakness, by element or by being strong where it is weak. Keep going the same way down the line.</p>
          <p><strong>Never a Legendary starter.</strong> If it gets countered, you lose most of the value of its 5 points.</p>
        </div>
        <div class="mt-5 rounded-3xl border border-ink/10 bg-card p-4 sm:p-5">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h3 class="font-display text-xl" style="font-weight:700">Example: an Earth, Lightning and Wind train</h3>
            <button type="button" class="press rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-on" @click="loadTrain">Load into the builder</button>
          </div>
          <ol class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <li v-for="t in train" :key="t.e.name" class="relative rounded-2xl bg-leaf p-3">
              <div class="flex items-center gap-3">
                <TeamsFramed :entry="t.e" :size="48" />
                <div class="min-w-0">
                  <p class="flex items-baseline gap-1.5"><span class="font-display text-sm text-fog" style="font-weight:700">{{ t.i + 1 }}</span><span class="truncate font-display text-lg leading-tight" style="font-weight:700">{{ t.e.name }}</span></p>
                  <p class="mt-0.5 flex flex-wrap items-center gap-1.5"><ElementIcon :element="t.e.m.element" class="h-4 w-4" /><TeamsRarity :rarity="t.e.m.rarity" /><span class="text-xs font-bold text-fog">{{ roleLabel(t.e.m) }}</span></p>
                </div>
              </div>
              <p class="mt-2 flex items-start gap-1.5 text-sm">
                <span v-if="t.i" class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" :class="t.c.length ? 'bg-moss text-on' : 'link-off text-fog'"><StatusIcon :paths="t.c.length ? TEAM_ICON.link : TEAM_ICON.broken" class="h-3 w-3 shrink-0" /></span>
                <span>{{ t.note }}</span>
              </p>
            </li>
          </ol>
        </div>
        <p class="mt-4 max-w-2xl text-sm text-fog">This is one way to think a team through. There are other valid and effective ways to build one.</p>
      </section>
    </main>
  </div>
</template>
