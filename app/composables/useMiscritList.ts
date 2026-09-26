import type { MiscritSummary } from '#shared/types/miscrit'
// Written by scripts/build-data.ts before every dev, build and generate. Bundled, not fetched: every page that lists
// miscrits shares one cached chunk instead of repeating the list in each prerendered page's payload.
import list from '#shared/data/list.json'

export type ListedMiscrit = MiscritSummary & { hay: string }

// Fields are kept apart with "|" so a place search stays inside one place.
const LISTED: ListedMiscrit[] = (list as MiscritSummary[]).map(m => ({
  ...m,
  hay: [...m.names, m.element, m.rarity, ...m.spots.map(place)].join('|').toLowerCase(),
}))

export const useMiscritList = () => LISTED
