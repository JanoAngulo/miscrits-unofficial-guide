---
name: Miscripedia
description: A trailside guidebook to every miscrit - where it spawns and the days it doesn't.
colors:
  field-paper: "#EEF3EF"
  leaf-wash: "#E1EAE4"
  pine-ink: "#1B2E2A"
  moss: "#3E6B57"
  fog: "#4F605A"
  trail-line: "#83928C"
  rust: "#A0422A"
  rust-hatch: "#C7735D"
  white: "#FFFFFF"
  focus-sky: "#2E8BC0"
  selection-mint: "#CFE3D7"
  count-on-ink: "#B8C9C2"
  stat-health: "#58B030"
  stat-health-deep: "#2F6E16"
  stat-health-empty: "#DDEFD3"
  stat-speed: "#F2B21B"
  stat-speed-deep: "#8A5E00"
  stat-speed-empty: "#FCEDC8"
  stat-physical: "#2E6FC7"
  stat-physical-deep: "#1D4F94"
  stat-physical-empty: "#D9E5F5"
  stat-elemental: "#D8343A"
  stat-elemental-deep: "#9E1F24"
  stat-elemental-empty: "#F7DADB"
  quality-red: "#CC3B32"
  quality-red-edge: "#8F2620"
  quality-green: "#3D9A2E"
  quality-green-deep: "#2F6E16"
  hatch-light: "#F7F9F8"
  hatch-dark: "#E3E9E6"
  hatch-edge: "#C9D3CE"
  every-day-wash: "#DDEDE3"
  some-days-wash: "#E4ECF4"
  some-days-text: "#2B587A"
  not-today-wash: "#F7E4DE"
  rarity-common-ring: "#9AA5A0"
  rarity-common-text: "#4E5A56"
  rarity-common-wash: "#EEF1EF"
  rarity-rare-ring: "#2E8BC0"
  rarity-rare-text: "#1D628A"
  rarity-rare-wash: "#E3F1F9"
  rarity-epic-ring: "#3BA55C"
  rarity-epic-text: "#237140"
  rarity-epic-wash: "#E4F4E9"
  rarity-exotic-ring: "#9B4DCA"
  rarity-exotic-text: "#6E2E96"
  rarity-exotic-wash: "#F2E8F8"
  rarity-legendary-ring: "#E0A21B"
  rarity-legendary-text: "#8A5E00"
  rarity-legendary-wash: "#FCF1D6"
  tier-s: "#FE5B00"
  tier-b: "#37DA31"
  tier-c: "#FF6BFF"
  tier-d: "#E0D854"
  tier-f: "#B7C0C8"
  chapter-field: "#1C6A6E"
  chapter-relics: "#8A5E00"
  chapter-catch: "#1D628A"
  chapter-teams: "#6E2E96"
  chapter-breed: "#A12F63"
typography:
  display:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  title:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  section:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
  place:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "tnum"
  body-small:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
  day-letter:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
rounded:
  day: "6px"
  control: "12px"
  tile: "16px"
  sheet: "24px"
  pill: "9999px"
  soft: "8px"
  bar: "4px"
  segment: "2px"
spacing:
  hair: "4px"
  tight: "8px"
  snug: "12px"
  base: "16px"
  roomy: "20px"
  section: "24px"
components:
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.sheet}"
    padding: "16px"
  search-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.tile}"
    padding: "12px 16px 12px 44px"
  select:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  chip-selected:
    backgroundColor: "{colors.pine-ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  button-primary:
    backgroundColor: "{colors.pine-ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  day-on:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.white}"
    typography: "{typography.day-letter}"
    rounded: "{rounded.day}"
    height: "24px"
  day-off:
    backgroundColor: "{colors.hatch-dark}"
    textColor: "{colors.fog}"
    typography: "{typography.day-letter}"
    rounded: "{rounded.day}"
    height: "24px"
  pill-not-today:
    backgroundColor: "{colors.not-today-wash}"
    textColor: "{colors.rust}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  pill-some-days:
    backgroundColor: "{colors.some-days-wash}"
    textColor: "{colors.some-days-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  pill-not-in-wild:
    backgroundColor: "{colors.leaf-wash}"
    textColor: "{colors.fog}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  tag-every-day:
    backgroundColor: "{colors.every-day-wash}"
    textColor: "{colors.moss}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  place-panel:
    backgroundColor: "{colors.leaf-wash}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.control}"
    padding: "10px"
  dialog:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.sheet}"
    width: "min(100% - 2rem, 56rem)"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-ghost:
    textColor: "{colors.fog}"
    rounded: "{rounded.soft}"
    padding: "6px 10px"
  points-cell:
    backgroundColor: "{colors.hatch-light}"
    rounded: "{rounded.day}"
    height: "24px"
  points-cell-over:
    backgroundColor: "{colors.rust}"
    rounded: "{rounded.day}"
    height: "24px"
  link-badge:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    size: "32px"
  link-badge-off:
    backgroundColor: "{colors.hatch-dark}"
    textColor: "{colors.fog}"
    rounded: "{rounded.pill}"
    size: "32px"
  team-slot:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.sheet}"
    padding: "14px"
  slot-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.control}"
    height: "44px"
  summary-ready:
    backgroundColor: "{colors.every-day-wash}"
    textColor: "{colors.moss}"
    rounded: "{rounded.tile}"
    padding: "12px 16px"
  summary-legal:
    backgroundColor: "{colors.some-days-wash}"
    textColor: "{colors.some-days-text}"
    rounded: "{rounded.tile}"
    padding: "12px 16px"
  summary-over:
    backgroundColor: "{colors.not-today-wash}"
    textColor: "{colors.rust}"
    rounded: "{rounded.tile}"
    padding: "12px 16px"
  story-chip:
    backgroundColor: "{colors.leaf-wash}"
    textColor: "{colors.pine-ink}"
    rounded: "{rounded.tile}"
    padding: "4px 12px 4px 4px"
---

# Design System: Miscripedia

## Overview

**Creative North Star: "The Trailside Guidebook"**

Miscripedia is a pocket guide you keep open next to the game: rounded, tactile,
readable at a glance mid-hunt. The page is Field Paper and Pine Ink, with Moss
as the one working accent. The colour and personality come from the creatures:
game art, rarity colours and element icons. The interface is the guidebook's
binding, and the creatures are its plates.

The intended mood is **warm and collectible**. What ships today gets there
through the miscrit art, rarity-tinted card edges that sharpen on hover, rarity
badges, and the rounded Fredoka display face. The chrome around them (header,
filters, grid gaps) stays quiet on purpose, so leaning further into the
collectible feel means giving the rarity and art more room, not decorating the
chrome. Density is moderate: a four-column grid of short cards, with all depth
one click away in a dialog.

One element is allowed to be loud: the **week strip**, seven day cells in solid
Moss or hatched-and-struck, which answers "can I catch it today?" It lives only
in the detail dialog. A card just flags when the day matters.

**Key Characteristics:**
- Cool Field Paper ground, Pine Ink text, Moss as the single functional accent.
- Creature art and rarity carry the colour; the chrome stays neutral.
- Rounded, friendly silhouettes: 24px sheets, 16px tiles, pill chips.
- One strong visual element: the week strip, in the detail dialog only.
- Meaning never by colour alone: hatch, strike-through, icons and words back every colour cue.

## Colors

A cool green-grey notebook palette with one moss accent, set against saturated creature art and a five-step rarity scale.

### Primary
- **Moss** (`moss`): the working accent. Spawn days in the week strip, filled stat segments, the location pin, the caret, the search focus border and the "Every day" tag text. It always means "yes, here, now".

### Secondary
- **Rust** (`rust`): the "no" colour. Missing-day summaries ("Not on Tue, Wed") and the "Not today" pill. Used only for absence and never for decoration.
- **Rust Hatch** (`rust-hatch`): the light stripe of the Rust over-cap hatch (135°, Rust 3px then Rust Hatch 2px). It exists only inside that hatch, on points past a cap, and never as a fill or text colour on its own.
- **Trail Blue** (`some-days-text` on `some-days-wash`): the "Some days" pill. Neutral information: the day matters, but it's findable today.

### Tertiary
- **Rarity scale** (`rarity-*-ring`, `rarity-*-text`, `rarity-*-wash`): Common grey-green, Rare sky, Epic leaf, Exotic violet, Legendary amber. The ring colours make the 3px avatar frame on every card, tint the card border (40% alpha at rest, full on hover) and colour the dots on the filter chips. Text-on-wash pairs make the rarity badges. Every text/wash pair clears 4.5:1.
- **Focus Sky** (`focus-sky`): the keyboard focus ring only.

### Neutral
- **Field Paper** (`field-paper`): page background and sticky header (95% alpha with blur).
- **Leaf Wash** (`leaf-wash`): recessed panels: day-limited place rows, avatar wells, evolution tiles, hover fills on icon buttons.
- **Pine Ink** (`pine-ink`): all primary text, selected chips, the primary button, the dialog backdrop (55% alpha).
- **Fog** (`fog`): secondary text such as counts, evolution lines, stat labels and move metadata. Sized to clear 4.5:1 even on Leaf Wash.
- **Trail Line** (`trail-line`): control edges for search, selects and chips. Clears 3:1 against white.
- **Hatch** (`hatch-light`, `hatch-dark`, `hatch-edge`): the 135° stripe and hairline edge on missing days.
- **Selection Mint** (`selection-mint`): text selection.
- **Count on Ink** (`count-on-ink`): the count inside a selected (Pine Ink) chip.

### Chapter colours
Each page is a chapter of the guidebook with its own colour: Field guide teal, Relics amber, Catching sky, Teams violet, Breeding rose (`--ch-*` text, `--chf-*` fills, `--chapter` for the current page). The page title and section headings (`.chapter`: the h1 and each section h2) take it; card titles and miscrit names stay Pine Ink. Every nav link carries a dot in its chapter's fill, so the set of tabs reads on every page. Text values clear 4.5:1 on paper and card in both themes. No chapter uses Moss or Rust, so the Yes/No Rule holds.

### Named Rules
**The Yes/No Rule.** Moss means present, Rust means absent. Neither is used for anything else, and neither appears without a word, icon or pattern backing it.

**The Underlined Link Exception.** One use of Moss sits outside yes/no, and it is documented rather than hidden: an in-guide text link or text action ("relic and bonus guide", "Load example") is bold Moss with a 40%-Moss underline at 4px offset. The underline is what separates it from a "yes"; Moss text without an underline always means present. It ships this way on relics.html, teams.html and breed.html. Extend it to nothing else: no Moss buttons, fills, icons or headings.

**The Hatch Means No Rule.** A hatch always marks a "no": a missing day, a score that can't roll, a broken cover link, points over the cap. Anything merely empty or unspent stays flat (Hatch Light with a Hatch Edge hairline, no stripe).

**The Contrast Floor Rule.** Fog and Trail Line are sized to their ratios (4.5:1 text on Leaf Wash, 3:1 edges on white). Never lighten them or fade them with opacity; use a different token if you need less weight.

**The Frame And Word Rule.** Rarity is shown by the avatar frame colour and the badge word together, so it never relies on colour alone. No tier pips or collectible-card ornaments: the owner rejected diamonds as reading like trading cards.

**The Creatures Bring Colour Rule.** Saturated colour on the page comes from the game art, element icons and rarity. Chrome surfaces stay in the paper, leaf and ink family.

## Themes

Two themes share every role; the page opens dark and a Light / Dark switch at the end of the site bar pins the other (`localStorage` key `miscripedia.theme`, shared across pages and open tabs, set before first paint so there is no flash). The switch is a two-button group with `aria-pressed`; the pressed one takes Pine Ink like a pressed chip. A switch repaints in one frame (no colour transitions).

Tokens are CSS variables on `:root` (light) and `:root[data-theme="dark"]`. Tailwind colours resolve through `color-mix()` on those variables, so opacity modifiers (`border-ink/10`) follow the theme. Body text colour is also set in CSS, so a page still reads if the Tailwind CDN fails.

**Night Trail (dark, default).** Near-black pine ground, pine surfaces a step up, the same roles inverted by design, not by formula:

| Role | Light | Dark |
|---|---|---|
| Ground (`--paper`) | `#EEF3EF` | `#070E0C` |
| Surface (`--card`, was white) | `#FFFFFF` | `#0F1A17` |
| Panel (`--leaf`) | `#E1EAE4` | `#172622` |
| Text / strong fill (`--ink`) | `#1B2E2A` | `#E2ECE6` |
| Text on ink, moss, rust fills (`--on`) | `#FFFFFF` | `#070E0C` |
| Moss (yes) | `#3E6B57` | `#7FC49F` |
| Rust (no) | `#A0422A` | `#F0927B` |
| Fog | `#4F605A` | `#9FB3AA` |
| Trail Line | `#83928C` | `#5F766D` |
| Focus Sky | `#2E8BC0` | `#5FB4E6` |

Washes, hatch, rarity text/wash pairs, stat value text and unfilled stat tints all have dark counterparts in the same block. Every text pair clears 4.5:1 and every control edge 3:1 in both themes (dark minimums: Trail Line 3.2:1 on Leaf, Rust 6.8:1 on Leaf).

**The Fixed Fills Rule.** The game's own colours never change with the theme: stat fills, element colours, rarity rings, tier fills, and the rolled red / white / green. Text and glyphs on them stay fixed too (`ink-fixed` `#1B2E2A` on tier fills and a white rolled stat, white on red, green and stat tiles), because theme ink would turn light on a bright fill.

## Typography

**Display Font:** Fredoka (with system-ui, sans-serif)
**Body Font:** Atkinson Hyperlegible (with system-ui, sans-serif)

**Character:** Fredoka's soft, rounded letterforms are the guidebook's friendly voice, used for anything with a name: miscrits, places and headings. Atkinson Hyperlegible does the reading, chosen for glyph distinctness at small sizes. Numerals are tabular everywhere.

### Hierarchy
- **Display** (700, 1.875rem to 2.25rem, tight tracking): the page title only.
- **Headline** (700, 1.5rem): the miscrit name in the dialog header.
- **Title** (700, 1.25rem): miscrit names on cards, truncated to one line.
- **Section** (600, 1.125rem): dialog section heads such as "Where to find", "Stats" and "Moves".
- **Place** (600, 15px): zone-and-spot names on cards and in the dialog. Places are names, so they get the display face.
- **Body** (400, 1rem, 1.625 leading, 65ch max): miscrit descriptions.
- **Body small** (400, 0.875rem): filters, counts, move descriptions, stat labels.
- **Label** (700, 0.75rem): rarity badges, availability pills, move metadata.
- **Day letter** (700, 11px): single-letter weekday cells in the strip, with the full day name for screen readers.

### Named Rules
**The Names Are Fredoka Rule.** Anything the game names (a miscrit, an evolution, a place, a move) is set in Fredoka. Everything the guide explains is set in Atkinson.

## Layout

The page is a centred column (max 1280px) with 16px gutters on phones and 24px from 640px up. Every page opens with the same site bar, its own band above the page header with a hairline under it, sticky at the top on Field Paper at 95% with a backdrop blur (the field guide's filter header sticks under it from 768px up; the page measures the bar into `--bar-h` and the stuck height into `--stick-h`, which `scroll-padding-top` uses so focus never lands under it): the game's own Miscrits logo at 36px tall linking home (from `assets/brand/`, the game site as fallback), the chapter tabs, and the theme switch. Below 768px the logo and switch share the top row and the tabs fill a second row as five equal 44px cells, each the chapter dot over a short name (Guide, Relics, Catch, Teams, Breed), the current one a 12px-radius Pine Ink cell. From 768px it is one row on a three-column grid, logo left, switch right and the tabs centred on the page, as pills with the short names, and from 1024px the full names (Field guide, Relics and bonus, Catching, Teams and PvP, Breeding). Below 1024px the switch shows its sun and moon only, the words kept for screen readers. Every page closes with the same quiet footer over a hairline: the official Miscripedia's book icon at 40px tall (from `assets/brand/`, the game site as fallback), then Fog body-small text saying Miscripedia (Fredoka 700, ink) is an unofficial fan guide, not affiliated with the Miscrits game, and crediting the data and art to worldofmiscrits.com as an underlined Moss link. It is what keeps the game's logo in the site bar from reading as the official site. The site bar is the page's one banner landmark; the page header under it is a plain block. On the field guide that header is sticky from 768px up and holds search, four selects (location, element with a Mixed group, findable day, minimum stat; from 1024px up 160px for day, 176px for location, element and stat), and the rarity chips with a live result count.

The grid runs 1, 2, 3 and 4 columns at 0 / 640 / 1024 / 1280px with a 16px gap. Cards stretch to equal row height. The location line is pinned to the card bottom, so rows align even when evolution lines differ.

The detail is a centred dialog up to 896px wide and 92vh tall, with a sticky header (name, rarity, the position in the filtered list, previous/next, copy link from 640px up, close). A full-width today answer opens the body. From 768px up the body then splits into art (with an element label) and evolutions on the left, and Lore, Where to find and Stats on the right, with Moves full width below in two columns. Below 640px the dialog becomes a full-width bottom sheet with top-only 24px corners, and the art stage drops to 4:3. The dialog's width and radius live in CSS, not Tailwind classes, so the phone sheet rule can override them.

Spacing sits on a 4px base. Tight groups use 8px, card and panel internals 12–16px, dialog padding 20px, and sections 24px apart.

## Elevation & Depth

The system is mostly tonal. Depth comes from white surfaces on Field Paper and recessed Leaf Wash wells. Shadows are faint at rest and appear on interaction. The one strong shadow belongs to the dialog, which sits above a Pine Ink scrim.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 2px rgb(27 46 42 / .06)`): barely there, separates white from paper.
- **Card lift** (`box-shadow: 0 6px 16px -8px rgb(27 46 42 / .25)`): hover only, on fine pointers, paired with the rarity-coloured border.
- **Control** (`box-shadow: 0 1px 2px rgb(0 0 0 / .05)`): the search field.
- **Dialog** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / .25)`): the only raised plane, over a `rgb(27 46 42 / .55)` backdrop.
- **Picker list** (`box-shadow: 0 12px 32px -12px rgb(27 46 42 / .35)`): the open combobox list under a miscrit picker (relics, teams, breeding). Transient; gone when the list closes.
- **Art drop** (`filter: drop-shadow(...)`, Tailwind `drop-shadow-lg`): creature art in the dialog, so it stands on its gradient stage.

### Named Rules
**The Lift-On-Touch Rule.** Cards rest nearly flat and only lift when a pointer hovers. Nothing floats at rest except the dialog.

## Shapes

The shapes are soft and rounded throughout, like a laminated field card. They step down with scale: 24px for sheets (cards, dialog, art stage), 16px for tiles (search field, avatars, evolution tiles, move rows), 12px for controls and panels (selects, place rows, buttons), 6px for day cells, and full pills for chips, badges and availability flags. Cards carry a 2px border tinted by rarity. Everything else uses a 1px edge or none.

Three minor radii sit below the main scale and are used consistently for small parts: 8px (`soft`) for ghost text buttons and 36px picker avatars, 4px (`bar`) for points-by-rarity cost cells and stat-odds bars, and 2px (`segment`) for the tiny 8x12px speed segments and legend swatches. Don't use them on sheets, tiles or controls.

## Components

### Cards
Plates in the guidebook: a creature, its rarity and where to look.
- **Corner Style:** 24px.
- **Background:** white on Field Paper, 16px padding.
- **Border:** 2px in the rarity ring colour at 40% alpha. On hover it goes to full rarity colour with Card lift.
- **Rarity frame:** the 58px avatar sits in a 3px frame of the rarity ring colour (16px outer corners, 13px inner). This is the card's main rarity signal, read before the name.
- **Content:** the framed avatar, then the element icons (the game's, 20px, with the name for screen readers and on hover) ahead of the name (Title), the rarity badge below them, the evolution line (Fog, one line), then a hairline divider and the location line: a pin and the **zone names only** ("Mansion, Monks Mountain") on one truncated line, with the full spot list on hover, plus an availability pill. Exact spots and days live in the dialog.
- **Press:** scale 0.98 over 160ms ease-out. The whole card is one button.

### Availability Pills
Flags that appear only when the day matters.
- **Not today** (Rust on rust wash, crossed-calendar icon), **Some days** (Trail Blue, calendar icon), **Not in the wild** (Fog on Leaf Wash, slashed-circle icon).
- Every-day spawns get no pill on cards. In the dialog they get an "Every day" tag in Moss.

### Rarity Badge
A pill with the rarity word in its text colour on its wash, and no icon. It's used on cards and in the dialog header. The card's accessible name includes the rarity.

### Chips
- **Style:** white pill with a Trail Line edge, a 10px dot in the rarity ring colour, the name, and the count in Fog.
- **Selected:** Pine Ink fill with white text, and the count lightened for contrast. Toggles use `aria-pressed`.

### Inputs / Fields
- **Search:** card surface, 16px radius, Trail Line edge, 44px left inset for the search icon, placeholder in full Fog.
- **Selects:** card surface, 12px radius, Trail Line edge, body-small, a drawn Fog chevron (`--chevron`, one per theme). Where the browser supports `appearance: base-select`, the open list is a 16px-radius card sheet with a Trail Line edge and the Picker list shadow; options are 12px-radius rows, Leaf Wash on hover, the Focus Sky ring inset on keyboard focus, the checked one bold with an ink checkmark. Other browsers keep the native list.
- **Rich options:** in those browsers the location, element, day and stat lists draw what they filter by, and the closed field shows the pick through `<selectedcontent>`. Zone rows lead with the cards' Moss location pin. Element rows lead with the element icon (Mixed ones with the combined icon, Misc a dot). Day rows are the day name after a lit 20px week-strip cell, with today's ink ring and a Trail Line "Today" pill; there is no "Findable" prefix, the field's label says it. Stat groups head with the stat tile and the name in the stat's text colour; each row is the dialog's five-segment bar filled to the level, then the level in ink and "or better" in Fog. Closed, a stat pick reads tile, short name ("Phys. atk") and a small bar. "Any" rows are words only, right after the checkmark. Every drawn part carries no text of its own (letters and short names come from `data-*` through `::before`), so a plain-text list still reads "Monday (today)" or "Speed: Strong or better".
- **Focus:** text fields, number fields and selects take a 2px Focus Sky outline flush on their own edge (offset -1px), with no gap. Every other control takes a 3px Focus Sky outline at 2px offset.

### Buttons
- **Primary:** Pine Ink fill, white text, 12px radius, 10px/16px padding (the Clear filters button in the empty state).
- **Icon buttons:** 40px circles, transparent, Leaf Wash on hover, 30% opacity when disabled (previous, next, close).

### Week Strip (signature)
Seven equal cells, 24px tall with 6px corners, in a 4px-gap grid, one per weekday from Sunday.
- **Spawns:** solid Moss with a white letter.
- **Missing:** a 135° hatch of hatch-light and hatch-dark with a hatch-edge hairline, the letter in Fog and struck through. It reads without colour.
- **Today:** a 1.5px gap in the panel colour, then a thin Pine Ink ring (to 3px), which works on either state.
- It appears only in the dialog, one per distinct schedule: places that share the same days share one Leaf Wash panel, headed by those place names (each with a pin) and a Rust "Not on ..." summary or a Moss "Every day" tag.

### Stat Grid
Borrowed from the game's own card. A 3×2 grid on a Leaf Wash panel: Health and Speed in the first column, then Physical and Elemental columns (headed above), with Attack on top and Defense below. Each cell has a 24px icon tile (a white glyph on the stat colour with a deep-tone edge: cross, bolt, burst, shield), five 12px segments (filled in the stat colour, or unfilled in its pale tint), then the label in Fog and the word value in the deep tone. The column header supplies "Physical" and "Elemental" visually; a screen-reader-only prefix carries it in the label. The feed's words map to 1–5 (Weak, Moderate, Strong, Max, Elite). The stat colours (`stat-*`) are the game's and appear nowhere else. The rolled-stat colours (`quality-*`) on the catching guide are a separate set and never stand in for them.

### Today Answer
The dialog's first line, answering "can I catch it today?" before anything else. Moss on the every-day wash with a check ("Findable today at Forest 1"), Rust on the not-today wash with the crossed calendar ("Not today. Next on Sunday (tomorrow) at Forest 1"), or Fog on Leaf Wash with the slashed circle ("Not in the wild"), which then replaces Where to find. It's a quiet 12px-radius row, so it doesn't compete with the week strip.

### Move Rows
The learn-order number, the move icon, the name (Fredoka) and its kind ("Fire attack", "Debuff"), the description, then fact tags: the power first as a white tag with a Trail Line edge (AP, or a signed amount for buffs), then Leaf Wash tags in Fog for fixed damage, accuracy, hits, turns, cooldown or uses, immunity and "On self". A tag appears only when the feed gives the value; a cooldown of -1 is the feed's single use. The enchanted effect sits below with a small spark.

### Move Icons
The game's own 32px round icons, chosen per move by what it does (buff, debuff, confuse, heal, dual-element attack…). They come from `assets/abilities/` with the game site as fallback. The element dot is only a fallback when a move has no icon.

### Evolution Tiles
A four-up grid of 16px Leaf Wash tiles with an avatar and name. The selected tile turns white with a 2px Pine Ink border. Picking one with a pointer swaps the art with a 200ms blur-and-scale fade. A keyboard pick switches instantly and keeps focus on the tile.

### Rolled Stat Cells (catching guide)
A caught miscrit's six stats each roll red, white or green (0, 1 or 2 points). A cell is 22px tall with 6px corners: `quality-green` with a `quality-green-deep` edge, white with a Trail Line edge, or `quality-red` with a `quality-red-edge` edge. Six cells make a strip, always ordered green, white, red, and always next to the words ("4 green, 2 white") and the odds. The same three fills make the stacked bars in the stat odds list, with a words legend under each. "All green" and a perfect score are set in `quality-green-deep`, not Moss.

### Rating Tags (catching guide)
Ratings are colour-coded by tier, the owner's choice: A to S+ `tier-s`, B to B+ `tier-b`, C to C+ `tier-c`, D to D+ `tier-d`, F- to F+ `tier-f` (a cool grey, since F has no tier colour). A tag is the rating letter in Pine Ink on its tier fill, 6px corners, with a faint ink edge so the pale fills hold on white. Letters are never set in a tier colour: white or tier-coloured text fails contrast. Tags appear on the rate keys, in the table's Rating column and beside split rows.

### Rate Keys (catching guide)
The reader is three radio groups on one white sheet: rarity (pills with the ring dot), health (full or 1%; a health the rarity has no rates for is disabled with a dashed edge and a help line), and the catch rate. Each rate key is a 56px tile with the rate on top and the rating it means below in Fog, so the answer can be read straight off the key. The checked key takes Pine Ink.

### Verdict Tile (catching guide)
The rating in Fredoka 700, Pine Ink on its tier fill, as a 96px tile with 20px corners and the faint ink edge (a range that crosses tiers falls back to Pine Ink with on-ink text). It has no rarity frame: the rarity badge beside it already names the rarity. It sits beside the rarity badge, the rate and "Score n of 12". A reading that covers several ratings shows the range ("A–S+") and a Leaf Wash panel that says how to narrow it, with a primary button that switches health.

### Rating Chart (catching guide)
Thirteen bars, F- to S+, for one rarity, computed from the stat odds and captioned as computed. Bars take their rating's tier fill with a faint ink edge; the bars for the current reading get a 2px white gap and 2px Pine Ink ring and carry a direct % label. The caption names the rarity. A score the rarity cannot roll is a short hatched stub, and its axis letter is struck through. Hover (fine pointer) shows an ink tooltip; each bar has a screen-reader line.

### Points Strip (team builder)
The 12-point budget, one cell per point, in a single row with 4px gaps. Cells are 24px tall with 6px corners.
- **Spent:** filled in the rarity ring colour of the miscrit spending it, with no edge. Each miscrit's run of cells starts with an extra 6px gap, so the groups read in slot order.
- **Unspent:** flat Hatch Light with a Hatch Edge hairline and no stripe. Unspent points aren't a fault, so they don't get the hatch (see The Hatch Means No Rule).
- **Over the cap:** the Rust hatch (Rust and Rust Hatch at 135°), no edge, running on past the twelfth cell.
- **Words:** the count sits above, right-aligned, in a polite live region: "9 of 12, 3 to spare" with the figure in bold Pine Ink, or "14 of 12, 2 over" in bold Rust. The strip itself is hidden from screen readers.
- **Cost list:** the points-by-rarity key uses the same fills as 16px cells with 4px corners, five per rarity, beside the rarity badge and "n points".

### Team Slots (team builder)
Four ordered slots in one row: an ordered list in battle order, 1 / 2 / 4 columns at 0 / 768 / 1024px, with a 40px column gap from 1024px to hold the link badges.
- **Card:** white, 24px corners, 14px padding, and a 2px border in the rarity ring colour at 40% alpha. The border colour changes over 200ms (never on keyboard actions).
- **Empty:** a dashed Trail Line border on Field Paper at 40%, a 58px Leaf Wash well with a plus icon where the framed avatar goes, and a Fog hint ("Your slowest miscrit usually starts").
- **Head:** the slot number in Fredoka 700, "Starter" in Fog on slot 1, and three 36px icon buttons (move earlier, move later, empty).
- **Picker:** a 44px input with 12px corners and a Trail Line edge, typed in Fredoka 600 with the placeholder in Atkinson Fog; focus turns the edge Moss. Its list is a 16px-radius white panel with the Picker list shadow; each option is a 36px avatar (8px corners), the name in Fredoka, the element and stage in Fog, and the point cost in the rarity text colour. The active option takes Leaf Wash.
- **Meta rows:** element icons and name, the rarity badge with "n points", then a two-column list with Fog terms: Role (five speed segments in the speed stat colours, then the role word, with "speed n of 5" for screen readers), Hits and Tanks (the stat icon tiles, then "Physical", "Elemental" or "Both"), and Weak to (element icons with names, or "Nothing in either cycle"). Utility tags close the card: 6px Leaf Wash tags in bold Fog.

### Cover Links (team builder)
Every slot after the first opens with its link to the one before, in words and in the game's element icons.
- **Row:** a 28px round icon, a bold small title and an extra-small Fog detail line, over a hairline. "Covers Primordion" in Moss beside a Moss circle with a white link icon, detail "Lightning beats Wind" with 14px element icons. When it doesn't hold: "Doesn't cover Primordion" in Pine Ink beside a hatched circle with a broken-link icon, detail "Doesn't beat Fire or Earth". Slot 1 reads "Starts the train" (flag on Leaf Wash), and a link waiting on an empty slot reads "Fill slot n to link" (dash on Leaf Wash).
- **Gap badge:** from 1024px the row's icon hides and a 32px badge sits in the gap between the two slots it joins: solid Moss with a white link icon when it holds, and a Fog broken-link icon on the missing-day hatch with a 1.5px Trail Line edge when it doesn't. The badge is decorative; the row's words carry the meaning.
- The same pair, at 20px, marks each step of the worked train example (Leaf Wash tiles with a 48px framed avatar).

### Checks List (team builder)
- **Summary line:** full width above the checks, a 16px-radius row with an icon, a Fredoka 700 heading and a small Pine Ink sentence, in a polite live region. It reuses the Today Answer washes: "Ready for Platinum Arena" in Moss on the every-day wash (check), "Over the points cap" in Rust on the not-today wash (warning), and "Legal team" in Trail Blue on the some-days wash (warning), because a legal team with misses is neutral information, not a no.
- **Rows:** two columns from 1024px, each a 24px state dot, a bold title, a screen-reader state word and a Fog detail line, over hairlines. The dots are Moss with a check ("Yes"), Leaf Wash with a Fog cross (a rule-of-thumb miss, "No"), solid Rust with a white cross (a hard no), and Leaf Wash with a Fog dash ("Waiting", "Optional").

### Random Team Controls (team builder)
- **Random team:** the primary button (Pine Ink, 12px corners, 10px/16px padding, bold small text) with a drawn 16px dice icon: a 4px-radius square outline and five pips.
- **Fill the gaps:** the secondary button, the same shape in white with a Trail Line edge and Pine Ink text. It is disabled at 40% opacity when no slot or every slot is filled.
- A Fog note beside them, in a polite live region, explains both and reports what a roll did.
- **Ghost text buttons** ("Clear all") sit in the builder head: Fog text, 8px corners, Leaf Wash on hover with a fine pointer.

### Element Cycle Diagram
A white 24px sheet per cycle, two side by side from 640px. Three 56px white circles (a faint ink ring and faint shadow) hold 40px element icons at the corners of a triangle, each named below in Fredoka 600, with 2.5px Pine Ink arrows pointing at the element each one beats. The drawing is hidden from screen readers; the caption says it in words ("Lightning beats Wind, Wind beats Earth, Earth beats Lightning").

### Cover-Story Chips
Worked examples in white 16px cards on Field Paper. A chip names a miscrit: Leaf Wash, 16px corners, a 34px framed avatar, the name in Fredoka 600 and the element (and role) in Fog with 14px element icons. Chips are joined by bold relation words: "covers" in Moss, "against" in Fog. A Fog sentence under them explains the element logic.

### Motion
- **Easing:** ease-out `cubic-bezier(0.23, 1, 0.32, 1)` and drawer `cubic-bezier(0.32, 0.72, 0, 1)`.
- **Dialog:** rises 8px and scales from 0.98 over 240ms. On phones the sheet slides up over 320ms with the drawer ease. A pointer close leaves faster than it arrived (160ms, or the sheet slides down over 200ms). Escape and keyboard closes are instant, and focus returns to the card of the miscrit last shown.
- **Keyboard actions never animate.** Reduced motion keeps only 150ms fades.

## Do's and Don'ts

### Do:
- **Do** keep the week strip in the dialog only. Cards say whether the day matters with a pill, and only when it does.
- **Do** back every colour cue with a pattern, icon or word: hatch plus strike-through for missing days, and icons in the availability pills.
- **Do** show rarity with the frame colour and the badge word together.
- **Do** let creature art and rarity carry the colour and warmth. Give them room before adding colour to the chrome.
- **Do** set every name the game uses in Fredoka, and everything the guide explains in Atkinson Hyperlegible.
- **Do** use Trail Line (3:1) for control edges and Fog (4.5:1 on Leaf Wash) for secondary text.
- **Do** keep unspent or empty cells flat, and save the hatch for a "no" (missing day, broken link, over the cap).
- **Do** state every chain link and budget in words first; icons, badges and strips back the words up.

### Don't:
- **Don't** fade Fog or Trail Line with opacity, or swap in a lighter grey. Both sit at their contrast floors.
- **Don't** use Moss or Rust for anything other than present and absent.
- **Don't** put a week strip, or any second strong visual element, on a card.
- **Don't** add tier pips, stars or trading-card ornaments to rarity.
- **Don't** list every spot on a card. Zones only, on one line.
- **Don't** animate a keyboard action, or use anything but fades under reduced motion.
- **Don't** show a value the feed doesn't give. A missing field shows nothing, never an assumed default.
- **Don't** extend Moss beyond yes/no and the underlined text link: no Moss buttons, fills, icons or headings.
- **Don't** use Rust Hatch outside the over-cap hatch.
