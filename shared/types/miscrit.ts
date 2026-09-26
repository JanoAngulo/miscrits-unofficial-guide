// The game's feed, https://www.worldofmiscrits.com/miscrits.json, as far as the site reads it.

export type StatWord = 'Weak' | 'Moderate' | 'Strong' | 'Max' | 'Elite'
export type StatKey = 'hp' | 'spd' | 'ea' | 'pa' | 'ed' | 'pd'

export interface FeedAbility {
  id: number
  name: string
  element: string
  type: string
  target?: string
  ap?: number
  accuracy?: number
  times?: number
  true_dmg?: boolean
  desc?: string
  enchant_desc?: string
  turns?: number
  cooldown?: number
  immunity?: string
  max_uses?: number
  additional?: { element?: string }[]
  [key: string]: unknown
}

export interface FeedEntry extends Record<StatKey, StatWord> {
  id: number | string
  names: string[]
  element: string
  rarity: string
  abilities: FeedAbility[]
  ability_order?: number[]
  descriptions?: string[]
  // {zone: {spot: [weekdays]}}, weekdays from 0 for Sunday. An empty list means every day.
  locations?: Record<string, Record<string, number[]>> | null
}

// What the site keeps of an entry: the shape build-data writes.
export interface Spot {
  zone: string
  spot: string
  days: number[]
}

export type Move = Pick<FeedAbility,
  'name' | 'element' | 'type' | 'target' | 'ap' | 'accuracy' | 'times' | 'true_dmg' | 'desc' | 'enchant_desc'
  | 'turns' | 'cooldown' | 'immunity' | 'max_uses'> & { icon: string }

export interface Miscrit {
  id: number
  names: string[]
  slugs: string[]
  element: string
  rarity: string
  stats: Record<StatKey, StatWord>
  descriptions: string[]
  spots: Spot[]
  moves: Move[]
}

// A list card's share of an entry: everything but the moves and lore, which only the detail shows.
export type MiscritSummary = Pick<Miscrit, 'id' | 'names' | 'slugs' | 'element' | 'rarity' | 'stats' | 'spots'>
