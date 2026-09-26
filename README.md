# Miscrits Unofficial Guide

A fan-made field guide to the browser game [Miscrits](https://www.worldofmiscrits.com/):
where every miscrit spawns, the weekdays it doesn't, and its evolutions, stats
and moves, plus guides for teams, relics, breeding and catching.

> Unofficial fan tool, not affiliated with or endorsed by the makers of
> Miscrits. Game data and art belong to their owners.

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Field guide: search all 425 miscrits by name, place, element and rarity; see which days each one is missing and open its four evolutions, stats and twelve moves. |
| `teams.html` | Platinum Arena team builder: four slots, 12-point cap, roles from speed, cover links from the element cycles, and random legal team rolls. |
| `relics.html` | Relic and bonus guide: check a rebonus roll against the stop lines and pick a relic build. |
| `breed.html` | Breeding calculator: the chance a breed gives the miscrit and stats you want, and what it costs in gold. |
| `catch.html` | Catching guide: read a wild miscrit's stats from its catch rate at full health. |

## Running it

No install needed. Open `index.html` in a browser, straight from disk.

To refresh the data (Python 3.10+, standard library only):

```bash
python build.py            # fetch the latest feed, write data.js, download missing images
python build.py --offline  # rebuild data.js from data/miscrits.json without network
python upscale.py          # make 200px HD avatars for any that are missing
```

`upscale.py` downloads Real-ESRGAN and libwebp into `tools/` on first run.

## Data

- Miscrit data comes from the game's own feed,
  `https://www.worldofmiscrits.com/miscrits.json`, kept unchanged in
  `data/miscrits.json`. `data.js` is generated from it; don't edit it by hand.
- Images come from `cdn.worldofmiscrits.com`. The repo keeps the upscaled
  avatars (`assets/avatars-hd/`), element and move icons, and the logos. The
  original 50px avatars and full art are left out; the pages load them from
  the game's CDN when they aren't on disk.

## Status

A port to Nuxt with Tailwind, deployed on Vercel, is in progress. This README
will cover that setup once it lands.
