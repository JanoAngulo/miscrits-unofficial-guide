import type { FeedAbility, StatWord } from '../types/miscrit'

/** The CDN's naming, same as the site: lowercase, whitespace to underscores. */
export const slugify = (name: string) => name.toLowerCase().split(/\s+/).filter(Boolean).join('_')

export const STAT_LEVEL: Record<StatWord, number> = { Weak: 1, Moderate: 2, Strong: 3, Max: 4, Elite: 5 }

const DUAL_ELEMENTS = new Set([
  'fireearth', 'firelightning', 'firewind', 'natureearth', 'naturelightning',
  'naturewind', 'waterearth', 'waterlightning', 'waterwind',
])

/** The icon the official Miscripedia shows for a move, ported from its bundle. */
export function abilityIcon(a: FeedAbility): string {
  const { type: kind, element: el, ap } = a
  if (kind === 'Dot' && el !== 'Misc') return `${el.toLowerCase()}_poison`
  if (kind === 'Hot') return 'heal'
  if (kind === 'ForceSwitch') return 'confuse'
  if (a.true_dmg) return 'truedamage'
  if (el === 'Misc') {
    if (kind === 'Buff' && ap) {
      const direction = ap > 0 ? 'buff' : 'debuff'
      return 'accuracy' in a ? `accuracy_${direction}` : direction
    }
    if (kind === 'Heal') return 'heal'
    if (kind === 'Bot') return (ap || 0) > 0 ? 'bot_buff' : 'bot_debuff'
  }
  else if (kind === 'TimeBomb') {
    return `bomb_${el.toLowerCase()}`
  }
  else if (kind === 'Attack') {
    if (el === 'Physical') return 'physical'
    // A second, non-Misc element in `additional` makes it a dual-element attack.
    const other = (a.additional || []).find(x => x.element && x.element !== 'Misc')?.element
    if (other === 'Physical') return `${el.toLowerCase()}_physical`
    if (other) {
      for (const pair of [el + other, other + el]) {
        if (DUAL_ELEMENTS.has(pair.toLowerCase())) return pair.toLowerCase()
      }
    }
    return el.toLowerCase()
  }
  return kind.toLowerCase()
}
