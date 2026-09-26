<script setup lang="ts">
import type { Miscrit, Spot } from '#shared/types/miscrit'

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
const today = useToday()

const { data } = await useFetch<Miscrit>(`/api/miscrits/${slug}`)
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'No such miscrit', fatal: true })
const m = data.value

const look = rarityLook(m.rarity)
const elementName = parts(m.element).join(' and ')
const stage = ref(0)
// The art swap is for pointer picks only; keyboard picks switch instantly.
const swapped = ref(false)
const name = computed(() => m.names[stage.value]!)

useSeoMeta({
  title: `${m.names[0]} - Miscrits Field Guide`,
  description: `Where ${m.names[0]} spawns in Miscrits and on which days, with its evolutions (${m.names.slice(1).join(', ')}), stats and twelve moves.`,
  ogTitle: `${m.names[0]} - Miscrits Field Guide`,
  ogImage: `https://cdn.worldofmiscrits.com/miscrits/${m.slugs[0]}_back.png`,
})

// Opened from a link while the filters hide it, there is no place in the list to step from.
const at = computed(() => guide.shown.value.findIndex(x => x.slugs[0] === slug))
const neighbour = (dir: -1 | 1) => (at.value >= 0 ? guide.shown.value[at.value + dir] : undefined)

function pick(i: number, e: MouseEvent) {
  swapped.value = e.detail > 0
  stage.value = i
}

// The dialog's first answer: can I catch it today, and if not, when next. It sits in the heading of the places it is
// about, in its colour without a wash; a miscrit not in the wild has no places, so its answer keeps a banner.
const answer = computed(() => {
  if (!m.spots.length) return { cls: 'bg-leaf text-fog', icon: AVAIL.wild.icon, lead: 'Not in the wild.', rest: 'Usually from events, the shop, or crafting.' }
  if (today.value === null) return null
  const t = today.value
  // Short, to fit beside the heading: the strips below already say which places and days.
  const now = m.spots.filter(s => spawnsOn(s, t))
  if (now.length) {
    const rest = now.length === m.spots.length ? '' : now.length === 1 ? `at ${place(now[0]!)}` : `at ${now.length} of ${m.spots.length}`
    return { icon: CHECK_ICON, tone: 'text-moss', lead: 'Findable today', rest }
  }
  const ahead = [1, 2, 3, 4, 5, 6].map(n => (t + n) % 7).find(d => findableOn(m, d))!
  return { tone: 'text-rust', icon: AVAIL.gone.icon, lead: 'Not today.', rest: ahead === (t + 1) % 7 ? 'Back tomorrow' : `Back ${DAYS[ahead]}` }
})

// Places that share the same days share one week strip, so four every-day spots read as one list, not four identical
// rows of lit days.
const groups = computed(() => {
  const byDays = new Map<string, { days: number[], spots: Spot[] }>()
  for (const s of m.spots) {
    const key = s.days.join(',')
    if (!byDays.has(key)) byDays.set(key, { days: s.days, spots: [] })
    byDays.get(key)!.spots.push(s)
  }
  return [...byDays.values()]
})

const copied = ref(false)
async function copyLink(e: MouseEvent) {
  const btn = e.currentTarget as HTMLButtonElement
  const url = location.href
  let ok = false
  try {
    await navigator.clipboard.writeText(url)
    ok = true
  }
  catch {
    const t = Object.assign(document.createElement('textarea'), { value: url })
    btn.after(t)
    t.select()
    try { ok = document.execCommand('copy') }
    catch {}
    t.remove()
    btn.focus()
  }
  guide.announce(ok ? 'Link copied.' : 'Could not copy the link. Copy it from the address bar.')
  if (!ok) return
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}

onMounted(() => guide.shownDetail())
</script>

<template>
  <div>
    <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ink/10 bg-card/95 py-2.5 pr-3 pl-5 backdrop-blur">
      <div class="flex min-w-0 items-center gap-2">
        <span class="inline-flex shrink-0 items-center"><ElementIcon :element="m.element" class="h-7 w-7" /><span class="sr-only">{{ elementName }}</span></span>
        <h2 id="detail-name" tabindex="-1" class="truncate font-display text-xl sm:text-2xl" style="font-weight:700">{{ name }}</h2>
        <RarityBadge :rarity="m.rarity" />
      </div>
      <div class="flex shrink-0 items-center">
        <span v-if="at >= 0" class="mr-1 hidden text-xs text-fog sm:inline">{{ at + 1 }} of {{ guide.shown.value.length }}</span>
        <button
          v-for="[dir, label, path] in ([[-1, 'Previous miscrit', 'M15 6l-6 6 6 6'], [1, 'Next miscrit', 'M9 6l6 6-6 6']] as const)" :key="dir"
          type="button" :data-step="dir" :disabled="!neighbour(dir)"
          :aria-label="neighbour(dir) ? `${label}: ${neighbour(dir)!.names[0]}` : label"
          class="icon-btn press grid h-10 w-10 place-items-center rounded-full disabled:opacity-30"
          @click="guide.step(dir, true)"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path :d="path" /></svg>
        </button>
        <button type="button" class="icon-btn press hidden h-10 w-10 place-items-center rounded-full sm:grid" :aria-label="`Copy link to ${m.names[0]}`" title="Copy link" @click="copyLink">
          <StatusIcon v-if="copied" :paths="CHECK_ICON" class="h-5 w-5 text-moss" />
          <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></svg>
        </button>
        <!-- A pointer close plays a short exit; a keyboard close (detail 0) is instant. -->
        <button type="button" class="icon-btn press ml-1 grid h-10 w-10 place-items-center rounded-full" aria-label="Close" @click="guide.close($event.detail > 0)">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
    </div>

    <div v-if="answer && !m.spots.length" class="px-5 pt-4">
      <p class="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm" :class="answer.cls">
        <StatusIcon :paths="answer.icon" class="mt-0.5 h-4 w-4 shrink-0" />
        <span><strong class="font-bold">{{ answer.lead }}</strong><span v-if="answer.rest" class="text-ink">{{ ` ${answer.rest}` }}</span></span>
      </p>
    </div>

    <div class="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div>
        <div class="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl p-6 md:aspect-square" :style="{ background: `radial-gradient(circle at 50% 60%, ${look.bg}, var(--leaf) 70%)` }">
          <MiscritImg :key="stage" kind="art" :slug="m.slugs[stage]!" :alt="`${name} artwork`" class="max-h-full max-w-full object-contain drop-shadow-lg" :class="{ 'art-swap': swapped }" />
          <span class="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 py-1 pr-2.5 pl-1.5 text-sm font-bold shadow-[0_1px_2px_rgb(var(--shade)/.08)]"><ElementIcon :element="m.element" class="h-5 w-5" />{{ parts(m.element).join(' + ') }}</span>
        </div>
        <div class="mt-4 mb-2 flex items-baseline justify-between gap-3">
          <h3 id="evo-head" class="font-display text-lg">Evolutions</h3>
          <span class="text-sm text-fog">{{ stage + 1 }} of {{ m.names.length }}</span>
        </div>
        <div class="grid grid-cols-4 gap-2" role="group" aria-labelledby="evo-head">
          <button
            v-for="(n, i) in m.names" :key="n" type="button" :aria-pressed="i === stage" :aria-label="`${n}, evolution ${i + 1}`"
            class="stage press rounded-2xl border-2 border-transparent bg-leaf/60 p-1.5 text-center" @click="pick(i, $event)"
          >
            <MiscritImg :slug="m.slugs[i]!" class="mx-auto aspect-square w-full rounded-xl object-cover" />
            <span class="mt-1 block truncate font-display text-xs">{{ n }}</span>
          </button>
        </div>
      </div>

      <div class="min-w-0 space-y-6">
        <section v-if="m.descriptions[stage]">
          <h3 class="mb-2 font-display text-lg">Lore</h3>
          <p class="max-w-prose leading-relaxed">{{ m.descriptions[stage] }}</p>
        </section>
        <section v-if="m.spots.length">
          <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 class="font-display text-lg">Where to find</h3>
            <p v-if="answer" class="flex items-start gap-1.5 text-sm" :class="answer.tone">
              <StatusIcon :paths="answer.icon" class="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong class="font-bold">{{ answer.lead }}</strong><span v-if="answer.rest" class="text-ink">{{ ` ${answer.rest}` }}</span></span>
            </p>
          </div>
          <div class="space-y-2">
            <div v-for="g in groups" :key="g.days.join()" class="rounded-xl bg-leaf/70 p-2.5">
              <div class="mb-1.5 flex items-start justify-between gap-2">
                <ul class="flex min-w-0 flex-wrap gap-x-3 gap-y-0.5 font-display text-[15px]">
                  <li v-for="s in g.spots" :key="place(s)" class="flex items-center gap-1"><PinIcon class="h-3.5 w-3.5" />{{ place(s) }}</li>
                </ul>
                <!-- Whichever list is shorter: "Only Wed, Sat" beats five days it is not on. -->
                <span v-if="g.days.length && g.days.length < 4" class="shrink-0 text-right text-xs font-bold text-some">Only {{ WEEK.filter(d => g.days.includes(d)).map(d => DAYS[d]!.slice(0, 3)).join(', ') }}</span>
                <span v-else-if="g.days.length" class="shrink-0 text-right text-xs font-bold text-rust">Not on {{ missingDays(g.days).map(d => DAYS[d]!.slice(0, 3)).join(', ') }}</span>
                <span v-else class="shrink-0 rounded-full bg-wash-yes px-2 py-0.5 text-xs font-bold text-moss">Every day</span>
              </div>
              <WeekStrip :days="g.days.length ? g.days : WEEK" />
            </div>
          </div>
        </section>
        <section>
          <h3 class="mb-2 font-display text-lg">Stats</h3>
          <StatBars :stats="m.stats" />
        </section>
      </div>
    </div>

    <section class="border-t border-ink/10 px-5 pt-5 pb-6">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 class="font-display text-lg">Moves</h3>
        <p class="text-sm text-fog">In the order {{ m.names[0] }}'s line learns them</p>
      </div>
      <ol class="moves grid md:grid-cols-2 md:gap-x-8">
        <MoveRow v-for="(move, i) in m.moves" :key="i" :move="move" :n="i + 1" />
      </ol>
    </section>
  </div>
</template>
