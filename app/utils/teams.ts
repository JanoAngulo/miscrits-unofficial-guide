import type { MiscritSummary, StatKey } from '#shared/types/miscrit'
import type { TeamUtility } from '#shared/utils/teams'

// The Platinum Arena team builder's rules, read the way the guide reads a miscrit. Pure: the page (pages/teams.vue)
// owns the team and draws it.

export const TEAM_CAP = 12
export const TEAM_SIZE = 4
export const TEAM_EXAMPLE = ['Primordion', 'Progenitus', 'Gazaereal', 'Dustelle']
export const TEAM_STORE_KEY = 'miscripedia.team'
const POINTS: Record<string, number> = { Common: 1, Rare: 2, Epic: 3, Exotic: 4, Legendary: 5 }
export const teamPoints = (rarity: string) => POINTS[rarity] ?? 1

// Each element beats the next one round its cycle.
export const TEAM_BEATS: Record<string, string> = { Lightning: 'Wind', Wind: 'Earth', Earth: 'Lightning', Water: 'Fire', Fire: 'Nature', Nature: 'Water' }
export const TEAM_BEATEN_BY: Record<string, string> = Object.fromEntries(Object.entries(TEAM_BEATS).map(([a, b]) => [b, a]))
export const TEAM_CYCLES = [['Lightning', 'Wind', 'Earth'], ['Water', 'Fire', 'Nature']]
// Each element's colour, taken from its game icon. Fixed in both themes like the other game fills, and each
// clears 3:1 against the card in either theme, so an arrow drawn in it holds its edge.
export const TEAM_ELEMENT_HUE: Record<string, string> = { Lightning: '#3B6FD8', Wind: '#8A5CC8', Earth: '#D9531F', Water: '#1B93A8', Fire: '#D8343A', Nature: '#3F9A2A' }

export const TEAM_ICON = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  cross: '<path d="M7 7l10 10M17 7 7 17"/>',
  dash: '<path d="M7 12h10"/>',
  warn: '<path d="M12 4 21 20H3z"/><path d="M12 10v4.5M12 17.5v.01"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  broken: '<path d="M9.5 6.5 11 5a4 4 0 0 1 5.66 5.66L15 12.3"/><path d="M14.5 17.5 13 19a4 4 0 0 1-5.66-5.66L9 11.7"/><path d="M4 4l3 3M20 20l-3-3"/>',
  flag: '<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
  earlier: '<path d="M15 6l-6 6 6 6"/>',
  later: '<path d="M9 6l6 6-6 6"/>',
}

/** One evolution of a line, the unit a slot holds. */
export interface TeamEntry { m: MiscritSummary, i: number, name: string }
export type TeamKind = 'physical' | 'elemental'
export interface TeamCover { by: string, threat: string }

export const teamSpeed = (m: MiscritSummary) => STAT_LEVEL[m.stats.spd] || 0
export function teamRole(m: MiscritSummary) {
  const s = teamSpeed(m)
  return s >= 4 ? { k: 'sniper', label: 'Sniper' } : s === 3 ? { k: 'fast', label: 'Fast bruiser' } : { k: 'tank', label: 'Tank or bruiser' }
}
/** Which kind of attack or defense leans higher; level ties count as both. */
export function teamLean(m: MiscritSummary, p: StatKey, e: StatKey): TeamKind[] {
  const a = STAT_LEVEL[m.stats[p]], b = STAT_LEVEL[m.stats[e]]
  return a > b ? ['physical'] : b > a ? ['elemental'] : ['physical', 'elemental']
}
export const teamThreats = (m: MiscritSummary) => [...new Set(parts(m.element).map(p => TEAM_BEATEN_BY[p]).filter((t): t is string => !!t))]
/** How `a` covers `b`: each half of `a` that beats something that beats `b`. */
export function teamCover(a: MiscritSummary, b: MiscritSummary): TeamCover[] {
  const t = teamThreats(b)
  return parts(a.element).filter(p => t.includes(TEAM_BEATS[p]!)).map(p => ({ by: p, threat: TEAM_BEATS[p]! }))
}
/** "a", "a and b", "a, b and c". */
export const teamList = (xs: string[]) => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`
export const teamKindWord = (k: TeamKind) => k === 'physical' ? 'Physical' : 'Elemental'

/** Every evolution name, with the line's utility. Built once per page from the list. */
export interface TeamBook {
  lines: MiscritSummary[]
  find: (name: string | null | undefined) => TeamEntry | null
  // A team takes final evolutions only. An earlier name from an old link or save resolves to its line's final form.
  finalOf: (name: string | null | undefined) => TeamEntry | null
  isFinal: (e: TeamEntry | null) => boolean
  finals: TeamEntry[]
  utilityOf: (m: MiscritSummary) => TeamUtility[]
}
export function makeTeamBook(lines: MiscritSummary[]): TeamBook {
  const byName = new Map<string, TeamEntry>()
  for (const m of lines) m.names.forEach((n, i) => byName.set(n.toLowerCase(), { m, i, name: n }))
  const find = (name: string | null | undefined) => byName.get(String(name || '').trim().toLowerCase()) || null
  const util = new Map(lines.map(m => [m.id, TEAM_UTILITY.filter(u => m.util.includes(u.k))]))
  return {
    lines,
    find,
    finalOf: (name) => { const e = find(name); return e && find(e.m.names.at(-1)) },
    isFinal: e => !!e && e.i === e.m.names.length - 1,
    finals: lines.map(m => find(m.names.at(-1))!).sort((a, b) => a.name.localeCompare(b.name)),
    utilityOf: m => util.get(m.id) ?? [],
  }
}

// Slot pickers
/** What the rest of the team asks of slot i: its neighbours, the points left, the kinds already covered. */
export interface TeamSlotContext {
  i: number
  others: { e: TeamEntry, k: number }[]
  prev: TeamEntry | null
  next: TeamEntry | null
  first: TeamEntry | null
  left: number
  atk: Set<TeamKind>
  def: Set<TeamKind>
  slowest: number
}
export function teamSlotContext(team: string[], i: number, book: TeamBook): TeamSlotContext {
  const es = team.map(book.find)
  const others = es.flatMap((e, k) => k !== i && e ? [{ e, k }] : [])
  const kinds = (p: StatKey, x: StatKey) => new Set(others.flatMap(o => teamLean(o.e.m, p, x)))
  return {
    i, others, prev: es[i - 1] ?? null, next: es[i + 1] ?? null, first: i ? es[0] ?? null : null,
    left: TEAM_CAP - others.reduce((t, o) => t + teamPoints(o.e.m.rarity), 0) - (TEAM_SIZE - 1 - others.length),
    atk: kinds('pa', 'ea'), def: kinds('pd', 'ed'),
    slowest: others.length ? Math.min(...others.map(o => teamSpeed(o.e.m))) : 0,
  }
}

export type TeamTagTone = 'ok' | 'bad' | 'no'
export const TEAM_TAG_TONE: Record<TeamTagTone, string> = { ok: 'text-moss', bad: 'text-rust', no: 'text-fog' }
export interface TeamFit { s: number, tags: [TeamTagTone, string][] }
/** Scores a line for the slot on the builder's own checks, with the reasons worth showing. */
export function teamFit(m: MiscritSummary, c: TeamSlotContext, book: TeamBook): TeamFit {
  const tags: [TeamTagTone, string][] = []
  let s = 0
  const dup = c.others.find(o => o.e.m.id === m.id)
  const over = teamPoints(m.rarity) - c.left
  if (dup) s -= 100, tags.push(['bad', `In slot ${dup.k + 1}`])
  if (over > 0) s -= 50, tags.push(['bad', `${over} ${over === 1 ? 'point' : 'points'} over`])
  if (c.prev && teamCover(m, c.prev.m).length) s += 4, tags.push(['ok', `Covers ${c.prev.name}`])
  if (c.next && teamCover(c.next.m, m).length) s += 3, tags.push(['ok', `${c.next.name} covers it`])
  if (!c.i) {
    if (m.rarity === 'Legendary') s -= 3, tags.push(['no', 'Legendary starter'])
    if (c.others.length && teamSpeed(m) <= c.slowest) s += 1, tags.push(['ok', 'Slowest, starts well'])
  }
  else if (c.first && teamSpeed(m) < teamSpeed(c.first.m)) s -= 0.5
  if (c.others.length) {
    // The kinds of attack and defense it brings that the team lacks, in the builder's Hits and Tanks words.
    const wants: [StatKey, StatKey, Set<TeamKind>, string][] = [['pa', 'ea', c.atk, 'hits'], ['pd', 'ed', c.def, 'tanks']]
    const adds = wants.flatMap(([p, x, have, word]) =>
      have.size < 2 ? teamLean(m, p, x).filter(k => !have.has(k)).map(k => ({ k, word })) : [])
    s += adds.length
    const same = adds.length === 2 && adds[0]!.k === adds[1]!.k
    if (adds.length) tags.push(['ok', same ? `Adds ${adds[0]!.k} hits and tanks` : `Adds ${adds.map(a => `${a.k} ${a.word}`).join(', ')}`])
  }
  // The last open slot leans toward spending what is left, as the rolls do.
  const spends = c.others.length === TEAM_SIZE - 1 && over <= 0 ? 0.3 * teamPoints(m.rarity) / Math.max(1, c.left) : 0
  return { s: s + spends + 0.1 * Number(book.utilityOf(m).length > 0), tags }
}

export type TeamOption = TeamFit & { e: TeamEntry }
/** A slot picker's list: names that start with the query first, then names that contain it; best fit first within each. */
export function teamOptions(q: string, c: TeamSlotContext, book: TeamBook): TeamOption[] {
  q = q.trim().toLowerCase()
  const scored = book.finals.filter(e => !q || e.name.toLowerCase().includes(q)).map(e => ({ e, ...teamFit(e.m, c, book) }))
  const later = (x: TeamOption) => Number(!!q && !x.e.name.toLowerCase().startsWith(q))
  scored.sort((a, b) => later(a) - later(b) || b.s - a.s || a.e.name.localeCompare(b.e.name))
  return scored.slice(0, 50)
}

// Random builds
// Scored on the same checks the builder shows: slowest starter, no Legendary starter,
// three cover links, both attacks, both defenses. Seven is a team that passes them all.
const PERFECT = 7
const pointsOf = (ms: MiscritSummary[]) => ms.reduce((t, m) => t + teamPoints(m.rarity), 0)
export function teamScore(ms: MiscritSummary[], book: TeamBook) {
  if (pointsOf(ms) > TEAM_CAP) return -1
  const sp = ms.map(teamSpeed)
  let s = Number(sp[0] === Math.min(...sp)) + Number(ms[0]!.rarity !== 'Legendary')
  for (let k = 1; k < ms.length; k++) s += Number(teamCover(ms[k]!, ms[k - 1]!).length > 0)
  for (const [p, e] of [['pa', 'ea'], ['pd', 'ed']] as [StatKey, StatKey][]) {
    const ks = new Set(ms.flatMap(m => teamLean(m, p, e)))
    s += Number(ks.size === 2)
  }
  // Tie-breaks toward the guide's shape: a sniper to cover, some utility, the budget spent.
  return s + 0.1 * Number(ms.some(m => teamSpeed(m) >= 4)) + 0.1 * Number(ms.some(m => book.utilityOf(m).length))
    + 0.05 * Number(pointsOf(ms) === TEAM_CAP)
}
const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]!
// Rarity first, then a miscrit of it, so rolls don't drown in Commons (the feed has 145).
function pickSpread(pool: MiscritSummary[]) {
  const tier = pick([...new Set(pool.map(m => m.rarity))])
  return pick(pool.filter(m => m.rarity === tier))
}
// Lets the page paint and run its timers between batches of tries. A message task: scheduler.yield() resumes ahead
// of queued timers, so the busy look never showed, and setTimeout's 4ms nesting clamp halved the roll's speed.
function yieldToMain() {
  return new Promise<void>((r) => {
    const ch = new MessageChannel()
    ch.port1.onmessage = () => r()
    ch.port2.postMessage(null)
  })
}
/**
 * Fills every empty slot left to right, preferring miscrits that link to both neighbours, and keeps the best of many
 * tries. Kept slots are never changed. Random, so only ever run from a click, never while rendering. The tries take
 * a second or more on a slow phone, so they run in slices of a frame; an aborted roll resolves to null.
 */
export async function teamRoll(keep: (TeamEntry | null)[], book: TeamBook, signal?: AbortSignal) {
  const fixed = keep.filter((e): e is TeamEntry => !!e)
  let best: MiscritSummary[] | null = null, bestS = -Infinity
  // Whether a covers b depends only on their elements, and the feed has a couple of dozen, so ask each pair once.
  const coverMemo = new Map<string, boolean>()
  const covers = (a: MiscritSummary, b: MiscritSummary) => {
    const k = `${a.element}|${b.element}`
    let v = coverMemo.get(k)
    if (v === undefined) coverMemo.set(k, v = teamCover(a, b).length > 0)
    return v
  }
  let slice = performance.now()
  for (let t = 0; t < 3000 && bestS < PERFECT + 0.25; t++) {
    if (performance.now() - slice > 12) {
      await yieldToMain()
      if (signal?.aborted) return null
      slice = performance.now()
    }
    const ms: (MiscritSummary | null)[] = keep.map(e => e && e.m)
    const used = new Set(fixed.map(e => e.m.id))
    let pts = fixed.reduce((n, e) => n + teamPoints(e.m.rarity), 0)
    let left = ms.filter(m => !m).length, dead = false
    for (let i = 0; i < TEAM_SIZE && !dead; i++) {
      if (ms[i]) continue
      left--
      const budget = TEAM_CAP - pts - left
      let pool = book.lines.filter(m => !used.has(m.id) && teamPoints(m.rarity) <= budget && (i || m.rarity !== 'Legendary'))
      const prev = ms[i - 1], next = ms[i + 1]
      const linked = pool.filter(m => (!prev || covers(m, prev)) && (!next || covers(next, m)))
      pool = linked.length ? linked : pool
      if (!pool.length) { dead = true; break }
      const m = pickSpread(pool)
      ms[i] = m
      used.add(m.id)
      pts += teamPoints(m.rarity)
    }
    if (dead) continue
    const s = teamScore(ms as MiscritSummary[], book)
    if (s > bestS) [best, bestS] = [ms as MiscritSummary[], s]
  }
  return best && { ms: best, perfect: bestS >= PERFECT }
}

// Checks
export type TeamCheckState = 'ok' | 'no' | 'bad' | 'wait' | 'info'
export interface TeamCheck { state: TeamCheckState, title: string, lines: string[] }
interface CheckLook { cls: string, icon: string, word: string }
export const TEAM_CHECK_LOOK: Record<TeamCheckState, CheckLook> = {
  ok: { cls: 'bg-moss text-on', icon: TEAM_ICON.check, word: 'Yes' },
  no: { cls: 'bg-leaf text-fog', icon: TEAM_ICON.cross, word: 'No' },
  bad: { cls: 'bg-rust text-on', icon: TEAM_ICON.cross, word: 'No' },
  wait: { cls: 'bg-leaf text-fog', icon: TEAM_ICON.dash, word: 'Waiting' },
  info: { cls: 'bg-leaf text-fog', icon: TEAM_ICON.dash, word: 'Optional' },
}
export interface TeamSummary { head: string, sub: string, tone: string, icon: string }

/** The builder's checks and the summary over them: legal first, then how closely it follows the guide. */
export function teamReport(team: string[], book: TeamBook) {
  const es = team.map(book.find)
  const picked = es.filter((e): e is TeamEntry => !!e)
  const pts = picked.reduce((t, e) => t + teamPoints(e.m.rarity), 0)
  const over = Math.max(0, pts - TEAM_CAP)
  const full = picked.length === TEAM_SIZE
  const checks: TeamCheck[] = []
  let misses = 0
  const row = (state: TeamCheckState, title: string, ...lines: string[]) => {
    if (state === 'no' || state === 'bad') misses++
    checks.push({ state, title, lines })
  }

  row(over ? 'bad' : 'ok', `${TEAM_CAP} points or fewer`,
    over ? `${pts} points is ${over} over. Swap a higher rarity for a lower one.` : `${pts} used${pts < TEAM_CAP ? `, ${TEAM_CAP - pts} left` : ''}.`)
  row(full ? 'ok' : 'wait', 'Four miscrits', full ? 'Every slot is filled.' : `${TEAM_SIZE - picked.length} ${TEAM_SIZE - picked.length === 1 ? 'slot' : 'slots'} still empty.`)

  const first = es[0]
  if (first && picked.length > 1) {
    const slowest = Math.min(...picked.map(e => teamSpeed(e.m)))
    const ok = teamSpeed(first.m) === slowest
    const slow = picked.filter(e => teamSpeed(e.m) === slowest).map(e => e.name)
    row(ok ? 'ok' : 'no', 'Slowest miscrit starts',
      ok ? `${first.name} has ${teamSpeed(first.m)}/5 speed, the team's slowest.` : `${first.name} has ${teamSpeed(first.m)}/5 speed. ${teamList(slow)} ${slow.length > 1 ? 'are' : 'is'} slower at ${slowest}/5.`)
  }
  else row('wait', 'Slowest miscrit starts', 'Fill the first slot and one more to compare speed.')

  if (first) {
    row(first.m.rarity === 'Legendary' ? 'no' : 'ok', 'No Legendary starter',
      first.m.rarity === 'Legendary' ? `${first.name} is Legendary. If it gets countered first, its 5 points go to waste.` : `${first.name} is ${first.m.rarity}.`)
  }
  else row('wait', 'No Legendary starter', 'The first slot is empty.')

  const links = es.slice(1).flatMap((e, k) => e && es[k] ? [{ a: e, b: es[k]!, c: teamCover(e.m, es[k]!.m) }] : [])
  const held = links.filter(l => l.c.length)
  if (links.length) {
    row(held.length === links.length ? 'ok' : 'no', 'Each miscrit covers the one before',
      ...links.map(l => l.c.length ? `${l.a.name} covers ${l.b.name}: ${l.c.map(x => `${x.by} beats ${x.threat}`).join(', ')}.`
        : `${l.a.name} doesn't cover ${l.b.name}, which is weak to ${teamThreats(l.b.m).join(' and ') || 'nothing in either cycle'}.`))
  }
  else row('wait', 'Each miscrit covers the one before', 'Fill two slots side by side to see the link.')

  const balance: [StatKey, StatKey, string][] = [['pa', 'ea', 'Both kinds of attack'], ['pd', 'ed', 'Both kinds of defense']]
  for (const [p, e, title] of balance) {
    if (!picked.length) { row('wait', title, 'Add miscrits to compare.'); continue }
    const who = (k: TeamKind) => picked.filter(x => teamLean(x.m, p, e).includes(k))
    const names = (xs: TeamEntry[]) => xs.length ? teamList(xs.map(x => x.name)) : 'nobody'
    const phys = who('physical'), elem = who('elemental')
    row(phys.length && elem.length ? 'ok' : 'no', title, `Physical: ${names(phys)}. Elemental: ${names(elem)}.`)
  }

  const util = TEAM_UTILITY.filter(u => picked.some(e => book.utilityOf(e.m).includes(u)))
  row('info', 'Utility (optional)', util.length ? `${util.map(u => u.label).join(', ')}.` : 'None yet.')

  let summary: TeamSummary
  if (over) summary = { head: 'Over the points cap', sub: `${over} ${over === 1 ? 'point' : 'points'} too many for Platinum Arena.`, tone: 'bg-wash-no text-rust', icon: TEAM_ICON.warn }
  else if (!full) {
    const n = TEAM_SIZE - picked.length
    summary = picked.length
      ? { head: `${n} to go`, sub: `${TEAM_CAP - pts} points left for ${n} ${n === 1 ? 'slot' : 'slots'}.`, tone: 'bg-leaf text-fog', icon: TEAM_ICON.dash }
      : { head: 'Start with one miscrit', sub: 'Pick the miscrit you want to build around, then cover it.', tone: 'bg-leaf text-fog', icon: TEAM_ICON.dash }
  }
  else if (!misses) summary = { head: 'Ready for Platinum Arena', sub: 'Legal, and it follows every rule of thumb below.', tone: 'bg-wash-yes text-moss', icon: TEAM_ICON.check }
  else summary = { head: 'Legal team', sub: `${misses} ${misses === 1 ? 'thing' : 'things'} to look at below. A legal team can still skip them.`, tone: 'bg-wash-some text-some', icon: TEAM_ICON.warn }

  return { es, picked, pts, over, checks, summary }
}

/** The points strip: one cell per point in slot order, in the rarity colour of the miscrit spending it; overflow runs on hatched. */
export function teamStrip(es: (TeamEntry | null)[]) {
  const cells: { ring: string | null, over: boolean, gap: boolean }[] = []
  let used = 0
  for (const e of es) {
    if (!e) continue
    const ring = rarityLook(e.m.rarity).ring
    for (let k = 0; k < teamPoints(e.m.rarity); k++, used++) {
      cells.push(used < TEAM_CAP ? { ring, over: false, gap: k === 0 && used > 0 } : { ring: null, over: true, gap: k === 0 })
    }
  }
  for (; used < TEAM_CAP; used++) cells.push({ ring: null, over: false, gap: false })
  return cells
}
