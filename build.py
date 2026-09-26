"""Build the Miscrits field guide from the game's own feed.

    python build.py            # fetch feed, fetch missing images
    python build.py --offline  # rebuild data.js from data/miscrits.json

The feed is https://www.worldofmiscrits.com/miscrits.json - the file the
official Miscripedia page renders. It is kept verbatim in data/miscrits.json so
a rebuild never needs the network, and slimmed into data.js, which the page
loads with a plain <script> tag: fetch() of a local JSON file is blocked when
index.html is opened straight from disk.

Images are only downloaded when missing, so re-running is cheap. The page falls
back to the CDN for any image that is not on disk.
"""

import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
FEED_URL = "https://www.worldofmiscrits.com/miscrits.json"
FEED = HERE / "data" / "miscrits.json"
DATA_JS = HERE / "data.js"
AVATAR_URL = "https://cdn.worldofmiscrits.com/avatars/{}_avatar.png"
ART_URL = "https://cdn.worldofmiscrits.com/miscrits/{}_back.png"
# The site has no Misc element icon; the page draws a plain dot for that element.
ELEMENT_ICONS = ["fire", "water", "nature", "earth", "wind", "lightning", "physical"]
ELEMENT_URL = "https://www.worldofmiscrits.com/{}.png"
# Move icons live beside the element icons, named by what the move does.
ABILITY_URL = "https://www.worldofmiscrits.com/{}.png"
# The game's logo in every page's site bar, and the official Miscripedia's book icon in the footer.
LOGO_URL = "https://www.worldofmiscrits.com/images/d1b7b11f-e431-4c85-b851-dfa7b9407505.png"
BOOK_URL = "https://www.worldofmiscrits.com/images/e2f02115-cde2-4c0a-9fc6-45779d695c8d.png"
DUAL_ELEMENTS = {
    "fireearth", "firelightning", "firewind", "natureearth", "naturelightning",
    "naturewind", "waterearth", "waterlightning", "waterwind",
}


def slug(name: str) -> str:
    """The CDN's naming, same as the site: lowercase, whitespace to underscores."""
    return "_".join(name.lower().split())


def get(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def fetch_feed() -> list[dict]:
    raw = get(FEED_URL)
    FEED.parent.mkdir(parents=True, exist_ok=True)
    FEED.write_bytes(raw)
    return json.loads(raw)


def spots(entry: dict) -> list[dict]:
    # Innermost lists are weekdays counted from Sunday; empty means every day.
    return [
        {"zone": zone, "spot": spot, "days": sorted(d for d in days if isinstance(d, int))}
        for zone, subs in sorted((entry.get("locations") or {}).items())
        for spot, days in sorted(subs.items(), key=lambda kv: int(kv[0]))
    ]


def ability_icon(a: dict) -> str:
    """The icon the official Miscripedia shows for a move, ported from its bundle."""
    kind, el, ap = a["type"], a["element"], a.get("ap")
    if kind == "Dot" and el != "Misc":
        return f"{el.lower()}_poison"
    if kind == "Hot":
        return "heal"
    if kind == "ForceSwitch":
        return "confuse"
    if a.get("true_dmg"):
        return "truedamage"
    if el == "Misc":
        if kind == "Buff" and ap:
            direction = "buff" if ap > 0 else "debuff"
            return f"accuracy_{direction}" if "accuracy" in a else direction
        if kind == "Heal":
            return "heal"
        if kind == "Bot":
            return "bot_buff" if (ap or 0) > 0 else "bot_debuff"
    elif kind == "TimeBomb":
        return f"bomb_{el.lower()}"
    elif kind == "Attack":
        if el == "Physical":
            return "physical"
        # A second, non-Misc element in `additional` makes it a dual-element attack.
        other = next((x["element"] for x in a.get("additional") or []
                      if x.get("element") and x["element"] != "Misc"), None)
        if other == "Physical":
            return f"{el.lower()}_physical"
        if other:
            for pair in (el + other, other + el):
                if pair.lower() in DUAL_ELEMENTS:
                    return pair.lower()
        return el.lower()
    return kind.lower()


MOVE_KEYS = ("name", "element", "type", "target", "ap", "accuracy", "times", "true_dmg", "desc", "enchant_desc",
             "turns", "cooldown", "immunity", "max_uses")


def moves(entry: dict) -> list[dict]:
    """The twelve abilities in the order they are learned, as ability_order lists them."""
    by_id = {a["id"]: a for a in entry["abilities"]}
    ordered = [by_id[i] for i in entry.get("ability_order", []) if i in by_id]
    ordered += [a for a in entry["abilities"] if a not in ordered]
    return [{**{k: a[k] for k in MOVE_KEYS if k in a}, "icon": ability_icon(a)} for a in ordered]


def slim(entry: dict) -> dict:
    return {
        "id": int(entry["id"]),
        "names": entry["names"],
        "slugs": [slug(n) for n in entry["names"]],
        "element": entry["element"],
        "rarity": entry["rarity"],
        "stats": {k: entry[k] for k in ("hp", "spd", "ea", "pa", "ed", "pd")},
        "descriptions": entry.get("descriptions", []),
        "spots": spots(entry),
        "moves": moves(entry),
    }


def download(job: tuple[str, Path]) -> str | None:
    url, path = job
    if path.exists():
        return None
    try:
        path.write_bytes(get(url))
        return None
    except Exception as error:  # a missing image is reported, not fatal
        return f"{url}: {error}"


def fetch_images(entries: list[dict]) -> None:
    jobs = []
    for e in entries:
        for s in e["slugs"]:
            jobs.append((AVATAR_URL.format(s), HERE / "assets" / "avatars" / f"{s}.png"))
            jobs.append((ART_URL.format(s), HERE / "assets" / "art" / f"{s}.png"))
    # Mixed-element miscrits (FireWind, WaterEarth...) have their own icon, named the same way.
    elements = sorted(set(ELEMENT_ICONS) | {e["element"].lower() for e in entries})
    jobs += [(ELEMENT_URL.format(el), HERE / "assets" / "elements" / f"{el}.png") for el in elements]
    icons = sorted({m["icon"] for e in entries for m in e["moves"]})
    jobs += [(ABILITY_URL.format(i), HERE / "assets" / "abilities" / f"{i}.png") for i in icons]
    jobs.append((LOGO_URL, HERE / "assets" / "brand" / "miscrits-logo.png"))
    jobs.append((BOOK_URL, HERE / "assets" / "brand" / "miscripedia-book.png"))
    for folder in ("avatars", "art", "elements", "abilities", "brand"):
        (HERE / "assets" / folder).mkdir(parents=True, exist_ok=True)
    todo = [j for j in jobs if not j[1].exists()]
    print(f"images: {len(jobs) - len(todo)} on disk, {len(todo)} to fetch")
    with ThreadPoolExecutor(max_workers=16) as pool:
        failures = [f for f in pool.map(download, todo) if f]
    for f in failures:
        print("  missing", f)
    print(f"images: {len(todo) - len(failures)} fetched, {len(failures)} failed")


def main() -> int:
    offline = "--offline" in sys.argv
    feed = json.loads(FEED.read_text(encoding="utf-8")) if offline else fetch_feed()
    entries = [slim(e) for e in sorted(feed, key=lambda e: int(e["id"]))]
    DATA_JS.write_text(
        "window.MISCRITS = " + json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"data.js: {len(entries)} miscrits")
    if not offline:
        fetch_images(entries)
    return 0


if __name__ == "__main__":
    sys.exit(main())
