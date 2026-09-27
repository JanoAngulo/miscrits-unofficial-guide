# Miscrits Unofficial Guide

A fan-made field guide to the browser game [Miscrits](https://www.worldofmiscrits.com/):
where every miscrit spawns, the weekdays it doesn't, and its evolutions, stats
and moves, plus guides for teams, relics, breeding and catching.

> Unofficial fan tool, not affiliated with or endorsed by the makers of
> Miscrits. Game data and art belong to their owners.

## Pages

| Page | What it does |
| --- | --- |
| `/` | Field guide: search all 425 miscrits by name, place, element and rarity; see which days each one is missing and open its four evolutions, stats and twelve moves. |
| `/miscrit/<name>` | One miscrit's own page, opened over the field guide: a link you can share. |
| `/teams` | Platinum Arena team builder: four slots, 12-point cap, roles from speed, cover links from the element cycles, and random legal team rolls. |
| `/relics` | Relic and bonus guide: check a rebonus roll against the stop lines and pick a relic build. |
| `/breed` | Breeding calculator: the chance a breed gives the miscrit and stats you want, and what it costs in gold. |
| `/catch` | Catching guide: read a wild miscrit's stats from its catch rate at full health. |

Links to the old static pages (`teams.html#team=...`, `index.html#flue`) still
land on the same team or miscrit.

## Running it

Built with Nuxt and Tailwind CSS. Needs Node 20+.

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm run generate   # static site in .output/public
```

Every `dev`, `build` and `generate` first rebuilds the site's data from
`data/miscrits.json`, offline. To refresh it:

```bash
npm run data       # fetch the latest feed and download missing images
python upscale.py  # make 200px HD avatars for any that are missing (Python 3.10+)
```

`upscale.py` downloads Real-ESRGAN and libwebp into `tools/` on first run.

## Data

- Miscrit data comes from the game's own feed,
  `https://www.worldofmiscrits.com/miscrits.json`, kept unchanged in
  `data/miscrits.json`. `scripts/build-data.ts` turns it into the list and
  per-miscrit data the pages use; that output is not committed.
- Images come from `cdn.worldofmiscrits.com`. The repo keeps the upscaled
  avatars (`public/assets/avatars-hd/`), element and move icons, and the logos.
  The original 50px avatars and full art are left out; the site loads them
  from the game's CDN when they aren't on disk.
