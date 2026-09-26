import type { MiscritSummary, Move, Spot, StatKey } from '#shared/types/miscrit'

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const WEEK = [0, 1, 2, 3, 4, 5, 6]

// A plain type name after the colon: auto-import's scanner reads a comma there as a second export.
type RarityLooks = Record<string, { ring: string, text: string, bg: string }>
export const RARITY: RarityLooks = {
  Common: { ring: '#9AA5A0', text: 'var(--r-common-text)', bg: 'var(--r-common-wash)' },
  Rare: { ring: '#2E8BC0', text: 'var(--r-rare-text)', bg: 'var(--r-rare-wash)' },
  Epic: { ring: '#3BA55C', text: 'var(--r-epic-text)', bg: 'var(--r-epic-wash)' },
  Exotic: { ring: '#9B4DCA', text: 'var(--r-exotic-text)', bg: 'var(--r-exotic-wash)' },
  Legendary: { ring: '#E0A21B', text: 'var(--r-legendary-text)', bg: 'var(--r-legendary-wash)' },
}
export const rarityLook = (rarity: string) => RARITY[rarity] ?? RARITY.Common!

// The site has no Misc element icon; that element is drawn as a dot in this colour.
export const MISC_COLOUR = '#B9A7C9'

export type StatColumn = 'core' | 'speed' | 'physical' | 'elemental'
export type StatIcon = 'hp' | 'spd' | 'attack' | 'defense'
// Laid out like the game's own card: health and speed, then physical and elemental columns.
export const STAT_GRID: { k: StatKey, label: string, col: StatColumn, icon: StatIcon }[] = [
  { k: 'hp', label: 'Health', col: 'core', icon: 'hp' },
  { k: 'pa', label: 'Physical attack', col: 'physical', icon: 'attack' },
  { k: 'ea', label: 'Elemental attack', col: 'elemental', icon: 'attack' },
  { k: 'spd', label: 'Speed', col: 'speed', icon: 'spd' },
  { k: 'pd', label: 'Physical defense', col: 'physical', icon: 'defense' },
  { k: 'ed', label: 'Elemental defense', col: 'elemental', icon: 'defense' },
]
// The game's stat colours; `deep` is the tile edge, `text` the value text, `empty` an unfilled segment.
export interface StatHue { fill: string, deep: string, text: string, empty: string }
export const STAT_HUE: Record<StatColumn, StatHue> = {
  core: { fill: '#58B030', deep: '#2F6E16', text: 'var(--s-core)', empty: 'var(--s-core-empty)' },
  speed: { fill: '#F2B21B', deep: '#8A5E00', text: 'var(--s-speed)', empty: 'var(--s-speed-empty)' },
  physical: { fill: '#2E6FC7', deep: '#1D4F94', text: 'var(--s-physical)', empty: 'var(--s-physical-empty)' },
  elemental: { fill: '#D8343A', deep: '#9E1F24', text: 'var(--s-elemental)', empty: 'var(--s-elemental-empty)' },
}
export const STAT_ICON: Record<StatIcon, string> = {
  hp: 'M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z',
  spd: 'M13.5 2 5 13.5h6L9.5 22 19 9.5h-6.2z',
  attack: 'm12 2 2.4 5.6L20.5 5l-2.6 6.1L23 12l-5.1 1.9 2.6 6.1-6.1-2.6L12 23l-2.4-5.6L3.5 20l2.6-6.1L1 12l5.1-1.9L3.5 4l6.1 2.6z',
  defense: 'M12 2 20 5v6.5c0 5-3.4 8.9-8 10.5-4.6-1.6-8-5.5-8-10.5V5z',
}
/** One bar segment's fill and edge: lit in the stat's colour, or its unfilled tint. */
export const segmentStyle = (lit: boolean, h: StatHue) =>
  ({ background: lit ? h.fill : h.empty, boxShadow: `inset 0 0 0 1px ${lit ? h.deep : `${h.fill}55`}` })

const MOVE_TYPE: Record<string, string> = {
  Dot: 'Damage over time', Hot: 'Heal over time', Bot: 'Buff over time', TimeBomb: 'Time bomb', SwitchCurse: 'Switch curse', LifeSteal: 'Life steal',
  SI: 'Sleep immune', CI: 'Confuse immune', PI: 'Paralyze immune', Antiheal: 'Anti-heal',
}

/** "FireWind" -> ["Fire", "Wind"]. */
export const parts = (el: string) => el.match(/[A-Z][a-z]+/g) ?? [el]

// An empty day list is no limit, never a miscrit that spawns on no day.
export const spawnsOn = (s: Spot, day: number) => !s.days.length || s.days.includes(day)
export const findableOn = (m: Pick<MiscritSummary, 'spots'>, day: number) => m.spots.some(s => spawnsOn(s, day))
export const missingDays = (days: number[]) => WEEK.filter(d => !days.includes(d))
export const place = (s: Spot) => `${s.zone} ${s.spot}`
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export const CHECK_ICON = '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
export type Avail = 'wild' | 'some' | 'gone'
export const AVAIL: Record<Avail, { label: string, cls: string, icon: string }> = {
  wild: { label: 'Not in the wild', cls: 'bg-leaf text-fog', icon: '<circle cx="12" cy="12" r="8"/><path d="M6.5 17.5l11-11"/>' },
  some: { label: 'Some days', cls: 'bg-wash-some text-some', icon: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>' },
  gone: { label: 'Not today', cls: 'bg-wash-no text-rust', icon: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M10 13.5l4 4M14 13.5l-4 4"/>' },
}
/**
 * The card only flags when the day matters; the week strips live in the detail. Before the browser has said what
 * day it is (the prerendered page), a miscrit missing today still reads "Some days", which is true on any day.
 */
export function availability(m: Pick<MiscritSummary, 'spots'>, today: number | null): Avail | null {
  if (!m.spots.length) return 'wild'
  if (today !== null && !findableOn(m, today)) return 'gone'
  return m.spots.some(s => s.days.length) ? 'some' : null
}

export function moveKind(a: Move) {
  if (a.type === 'Attack') return `${parts(a.element).join('/')} attack`
  if (a.type === 'Buff' && (a.ap ?? 0) < 0) return 'Debuff'
  if (a.type === 'Bot' && (a.ap ?? 0) < 0) return 'Debuff over time'
  return MOVE_TYPE[a.type] ?? a.type
}

/** Only the facts the feed gives; a move without accuracy shows none. `key` marks the power, drawn as a raised tag. */
export function moveFacts(a: Move): { text: string, key?: boolean }[] {
  const facts: { text: string, key?: boolean }[] = []
  // Buffs raise or lower a stat by their amount; everything else deals or heals that much.
  const signed = a.type === 'Buff' || a.type === 'Bot'
  if (a.ap !== undefined) facts.push({ text: signed ? (a.ap > 0 ? `+${a.ap}` : `−${-a.ap}`) : `${a.ap} AP`, key: true })
  if (a.true_dmg) facts.push({ text: 'Fixed damage' })
  if (a.accuracy !== undefined) facts.push({ text: `${a.accuracy}% accuracy` })
  if ((a.times ?? 0) > 1) facts.push({ text: `Hits ${a.times} times` })
  // Block moves carry turns -1, which is no turn count to show.
  if ((a.turns ?? 0) > 0) facts.push({ text: plural(a.turns!, 'turn') })
  // A cooldown of -1 is the feed's way of saying the move has a single use.
  if (a.cooldown === -1) facts.push({ text: '1 use' })
  else if ((a.cooldown ?? 0) > 0) facts.push({ text: `${a.cooldown}-turn cooldown` })
  if (a.max_uses) facts.push({ text: plural(a.max_uses, 'use') })
  if (a.immunity) facts.push({ text: `${a.immunity}-turn immunity` })
  if (a.target === 'Self') facts.push({ text: 'On self' })
  return facts
}
