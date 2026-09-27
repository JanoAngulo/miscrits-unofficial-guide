// The catching guide's published tables that other pages reuse. Names carry "catch" so the auto-imports stay clear
// of the other pages' ratings.

export type CatchRarity = 'common' | 'rare' | 'epic' | 'exotic' | 'legendary'

// Rating tiers: A to S+, B to B+, C to C+, D to D+, and the F tier.
const TIERS = [
  { min: 9, fill: '#FE5B00' },
  { min: 7, fill: '#37DA31' },
  { min: 5, fill: '#FF6BFF' },
  { min: 3, fill: '#E0D854' },
  { min: 0, fill: '#B7C0C8' },
]
/** The game's fill for a score's rating tier, 0 to 12. */
export const catchTierFill = (s: number) => TIERS.find(t => s >= t.min)!.fill

/** Chance (%) a caught miscrit is 12/12, S+. */
export const CATCH_SPLUS: Record<CatchRarity, string> = { common: '0.48', rare: '3.43', epic: '6.25', exotic: '9.89', legendary: '13.93' }

/** Chance (%) a wild encounter is each rarity. */
export const CATCH_ENCOUNTER: { label: string, r: CatchRarity, pct: number }[] = [
  { label: 'Rare', r: 'rare', pct: 6 },
  { label: 'Epic', r: 'epic', pct: 2 },
  { label: 'Exotic', r: 'exotic', pct: 1 },
  { label: 'Legendary', r: 'legendary', pct: 0.175 },
  { label: 'Legendary+', r: 'legendary', pct: 0.35 },
]
