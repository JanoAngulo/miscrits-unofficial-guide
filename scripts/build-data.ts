/**
 * Build the Miscrits field guide from the game's own feed.
 *
 *   npm run data           # fetch feed, fetch missing images
 *   npm run data:offline   # rebuild from data/miscrits.json only (runs before dev, build and generate)
 *
 * The feed is https://www.worldofmiscrits.com/miscrits.json - the file the
 * official Miscripedia page renders. It is kept verbatim in data/miscrits.json so
 * a rebuild never needs the network, and slimmed into server/data/miscrits.json
 * for the Nuxt app, and into data.js for the static pages until they are retired.
 *
 * Images are only downloaded when missing, so re-running is cheap. The site falls
 * back to the CDN for any image that is not on disk.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { FeedEntry, Miscrit, Move, Spot } from '../shared/types/miscrit'
import { abilityIcon, slugify } from '../shared/utils/miscrit'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FEED_URL = 'https://www.worldofmiscrits.com/miscrits.json'
const FEED = join(ROOT, 'data', 'miscrits.json')
const OUT = join(ROOT, 'server', 'data', 'miscrits.json')
const DATA_JS = join(ROOT, 'data.js')
const ASSETS = join(ROOT, 'assets')
const AVATAR_URL = (s: string) => `https://cdn.worldofmiscrits.com/avatars/${s}_avatar.png`
const ART_URL = (s: string) => `https://cdn.worldofmiscrits.com/miscrits/${s}_back.png`
// The site has no Misc element icon; the page draws a plain dot for that element.
const ELEMENT_ICONS = ['fire', 'water', 'nature', 'earth', 'wind', 'lightning', 'physical']
// Element and move icons live side by side, named by element or by what the move does.
const SITE_URL = (name: string) => `https://www.worldofmiscrits.com/${name}.png`
// The game's logo in every page's site bar, and the official Miscripedia's book icon in the footer.
const LOGO_URL = 'https://www.worldofmiscrits.com/images/d1b7b11f-e431-4c85-b851-dfa7b9407505.png'
const BOOK_URL = 'https://www.worldofmiscrits.com/images/e2f02115-cde2-4c0a-9fc6-45779d695c8d.png'

const MOVE_KEYS = ['name', 'element', 'type', 'target', 'ap', 'accuracy', 'times', 'true_dmg', 'desc', 'enchant_desc',
  'turns', 'cooldown', 'immunity', 'max_uses'] as const

async function get(url: string): Promise<Buffer> {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(60_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

async function fetchFeed(): Promise<FeedEntry[]> {
  const raw = await get(FEED_URL)
  mkdirSync(dirname(FEED), { recursive: true })
  writeFileSync(FEED, raw)
  return JSON.parse(raw.toString('utf8'))
}

function spots(entry: FeedEntry): Spot[] {
  // Innermost lists are weekdays counted from Sunday; empty means every day.
  const zones = Object.entries(entry.locations || {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return zones.flatMap(([zone, subs]) =>
    Object.entries(subs)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([spot, days]) => ({ zone, spot, days: days.filter(d => Number.isInteger(d)).sort((a, b) => a - b) })))
}

/** The twelve abilities in the order they are learned, as ability_order lists them. */
function moves(entry: FeedEntry): Move[] {
  const byId = new Map(entry.abilities.map(a => [a.id, a]))
  const ordered = (entry.ability_order || []).flatMap(id => byId.get(id) ?? [])
  ordered.push(...entry.abilities.filter(a => !ordered.includes(a)))
  return ordered.map((a) => {
    const kept = Object.fromEntries(MOVE_KEYS.filter(k => k in a).map(k => [k, a[k]]))
    return { ...kept, icon: abilityIcon(a) } as Move
  })
}

function slim(entry: FeedEntry): Miscrit {
  return {
    id: Number(entry.id),
    names: entry.names,
    slugs: entry.names.map(slugify),
    element: entry.element,
    rarity: entry.rarity,
    stats: { hp: entry.hp, spd: entry.spd, ea: entry.ea, pa: entry.pa, ed: entry.ed, pd: entry.pd },
    descriptions: 'descriptions' in entry ? entry.descriptions! : [],
    spots: spots(entry),
    moves: moves(entry),
  }
}

async function fetchImages(entries: Miscrit[]) {
  const jobs: [string, string][] = []
  for (const e of entries) {
    for (const s of e.slugs) {
      jobs.push([AVATAR_URL(s), join(ASSETS, 'avatars', `${s}.png`)])
      jobs.push([ART_URL(s), join(ASSETS, 'art', `${s}.png`)])
    }
  }
  // Mixed-element miscrits (FireWind, WaterEarth...) have their own icon, named the same way.
  const elements = [...new Set([...ELEMENT_ICONS, ...entries.map(e => e.element.toLowerCase())])].sort()
  jobs.push(...elements.map(el => [SITE_URL(el), join(ASSETS, 'elements', `${el}.png`)] as [string, string]))
  const icons = [...new Set(entries.flatMap(e => e.moves.map(m => m.icon)))].sort()
  jobs.push(...icons.map(i => [SITE_URL(i), join(ASSETS, 'abilities', `${i}.png`)] as [string, string]))
  jobs.push([LOGO_URL, join(ASSETS, 'brand', 'miscrits-logo.png')])
  jobs.push([BOOK_URL, join(ASSETS, 'brand', 'miscripedia-book.png')])
  for (const folder of ['avatars', 'art', 'elements', 'abilities', 'brand']) mkdirSync(join(ASSETS, folder), { recursive: true })

  const todo = jobs.filter(([, path]) => !existsSync(path))
  console.log(`images: ${jobs.length - todo.length} on disk, ${todo.length} to fetch`)
  const failures: string[] = []
  // Sixteen downloads at a time; a missing image is reported, not fatal.
  const queue = [...todo]
  await Promise.all(Array.from({ length: 16 }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const [url, path] = job
      try { writeFileSync(path, await get(url)) }
      catch (error) { failures.push(`${url}: ${(error as Error).message}`) }
    }
  }))
  for (const f of failures) console.log('  missing', f)
  console.log(`images: ${todo.length - failures.length} fetched, ${failures.length} failed`)
}

async function main() {
  const offline = process.argv.includes('--offline')
  const feed: FeedEntry[] = offline ? JSON.parse(readFileSync(FEED, 'utf8')) : await fetchFeed()
  const entries = feed.sort((a, b) => Number(a.id) - Number(b.id)).map(slim)
  const json = JSON.stringify(entries)
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, json)
  writeFileSync(DATA_JS, `window.MISCRITS = ${json};\n`)
  console.log(`data: ${entries.length} miscrits`)
  if (!offline) await fetchImages(entries)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
