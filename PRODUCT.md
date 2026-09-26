# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is the owner, a Miscrits player using it for their own hunting:
looking up where a miscrit spawns and whether it can be caught today. Other
players may use it if it is hosted, but the owner's hunting is the target.

## Product Purpose

A field guide to every miscrit in the browser game Miscrits: where each one
spawns, the weekdays it does not, and on demand its four evolutions, stats and
twelve moves. Success is answering "where do I find this, and can I catch it
today?" in seconds.

## Positioning

What the official Miscripedia does not do well:

- **Day-off visibility.** Which weekdays a miscrit is missing, read at a glance
  against today.
- **Search by place.** Everything in a zone or spot, filterable by findable day,
  element and rarity.
- **Faster lookup.** Quicker, cleaner browsing than the official page.

## Operating Context

Used alongside the game while hunting. Opened straight from disk today; may be
hosted later (for example GitHub Pages). Unofficial fan tool, not affiliated
with the game.

## Capabilities and Constraints

- One static page (`index.html`), no server, no bundler; works from `file://`,
  so data loads via a `<script>` tag (`data.js`), not `fetch()`.
- Data is the game's own feed (`worldofmiscrits.com/miscrits.json`) kept
  verbatim in `data/miscrits.json`; `build.py` (stdlib Python) regenerates
  `data.js` and downloads art. Images fall back to the game's CDN.
- Feed rules: an empty weekday list means every day; 17 miscrits are not in the
  wild; stats are words (Weak < Moderate < Strong < Max < Elite).
- Never show a value the feed does not give (no assumed accuracy).
- Terminology follows the game: miscrit, evolution, zone and spot, element,
  rarity (Common, Rare, Epic, Exotic, Legendary).

## Brand Commitments

Name: Miscripedia / "Miscrits field guide". Must not present itself as the
official Miscripedia; credit data and art to worldofmiscrits.com.

## Evidence on Hand

- Full feed for 425 miscrits in `data/miscrits.json`.
- Game art and element icons via `assets/` (gitignored) or the game's CDN.
- No users, testimonials or usage data; none to be invented.

## Product Principles

1. Spawn questions first: where, and which days, before stats and moves.
2. Trust the feed; show only what it says.
3. Fast to scan: the grid stays quiet, detail lives one click away.
4. Zero infrastructure: it must keep working opened from disk.

## Accessibility & Inclusion

Owner works to WCAG practice: meaning never by colour alone (missing days are
hatched and struck), text contrast at least 4.5:1, full keyboard use, reduced
motion respected.
