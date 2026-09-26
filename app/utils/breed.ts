import type { StatKey } from '#shared/types/miscrit'
import type { StatColumn, StatIcon } from '~/utils/field'

// The breeding guide's marks, shared by the page and its components in components/breed/. Names carry "breed" so
// the auto-imports stay clear of the other pages' ratings and stats.

/** A rolled stat: 0 red, 1 white, 2 green. A wanted stat can also be left open. */
export type BreedRoll = 0 | 1 | 2
export type BreedWant = BreedRoll | 'any'

export const BREED_RATINGS = ['F-', 'F', 'F+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+']
// Rating tiers: A to S+, B to B+, C to C+, D to D+, and the F tier.
const TIERS = [
  { min: 9, fill: '#FE5B00' },
  { min: 7, fill: '#37DA31' },
  { min: 5, fill: '#FF6BFF' },
  { min: 3, fill: '#E0D854' },
  { min: 0, fill: '#B7C0C8' },
]
export const breedTierFill = (s: number) => TIERS.find(t => s >= t.min)!.fill

export interface BreedStat { k: StatKey, ab: string, name: string, col: StatColumn, icon: StatIcon }
// Laid out as the game's card: HP and speed, then attacks, then defences.
export const BREED_STATS: BreedStat[] = [
  { k: 'hp', ab: 'HP', name: 'Health', col: 'core', icon: 'hp' },
  { k: 'spd', ab: 'SPD', name: 'Speed', col: 'speed', icon: 'spd' },
  { k: 'ea', ab: 'EA', name: 'Elemental attack', col: 'elemental', icon: 'attack' },
  { k: 'pa', ab: 'PA', name: 'Physical attack', col: 'physical', icon: 'attack' },
  { k: 'ed', ab: 'ED', name: 'Elemental defense', col: 'elemental', icon: 'defense' },
  { k: 'pd', ab: 'PD', name: 'Physical defense', col: 'physical', icon: 'defense' },
]

export const BREED_COLOURS = ['red', 'white', 'green'] as const
// A rolled stat's own button: the game's fill, with the white one on a line edge.
export const breedRollButton = (q: BreedRoll) =>
  q === 2 ? 'bg-[#3D9A2E] text-[#fff]' : q === 0 ? 'bg-[#CC3B32] text-[#fff]' : 'bg-[#fff] text-ink-fixed ring-1 ring-inset ring-line'
