import type { Move } from '../types/miscrit'

// The tools the teams guide counts as utility, read from a line's moves. Shared so build-data can work them out once
// into the list, and the page never has to ship every move.
export interface TeamUtility { k: string, label: string, types: string[], re?: RegExp }
export const TEAM_UTILITY: TeamUtility[] = [
  { k: 'cc', label: 'Crowd control', types: ['Confuse', 'Sleep', 'Paralyze'] },
  { k: 'antiheal', label: 'Antiheal', types: ['Antiheal'], re: /anti-?heal/i },
  { k: 'switch', label: 'Switch curse', types: ['SwitchCurse'], re: /switch curse/i },
  { k: 'bleed', label: 'Bleed', types: ['Bleed'], re: /\bbleed/i },
  { k: 'dot', label: 'Damage over time', types: ['Dot', 'TimeBomb'] },
  { k: 'poison', label: 'Poison', types: ['Poison'] },
  { k: 'negate', label: 'Negate', types: ['Negate'] },
]

/** The utility keys a set of moves brings, in TEAM_UTILITY's order. */
export const teamUtilityKeys = (moves: Pick<Move, 'type' | 'desc'>[]) =>
  TEAM_UTILITY.filter(u => moves.some(mv => u.types.includes(mv.type) || (u.re && u.re.test(mv.desc || '')))).map(u => u.k)
