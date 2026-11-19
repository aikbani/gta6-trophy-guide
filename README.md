# Leonida Platinum Atlas — GTA VI Trophy Guide &amp; Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/aikbani/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/aikbani/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**All 55 official GTA VI PlayStation 5 trophies — 1 Platinum · 2 Gold · 6 Silver · 46 Bronze · 28 hidden — with a guide for each, a platinum roadmap, missable alerts and a spoiler-safe checklist. Free, open-source, and fully offline.**

## What it is

- **Checklist tracker** — tick a trophy when it pops; progress is saved in your browser (localStorage), with **export / import as JSON** and per-trophy notes.
- **A guide for every trophy, in our own words** — each card shows the official name, description and grade, a practical guide, the PSN progress target (where PSN publishes one), PSN rarity (launch-day snapshot, 19 Nov 2026) and Xbox Gamerscore, plus a **source line per trophy**.
- **Platinum roadmap** — six phases in order (story → strangers → activities → crime & money → collectibles & cleanup → Platinum), each with its trophies and your progress in that phase.
- **Missable alerts** — 1 possibly missable trophy (Positive Mental Attitude) and 2 partner-gated trophies (Hot Together, Retail Therapy), flagged on their cards and on a dedicated page that states the disagreement between sources.
- **Spoiler-safe mode** — hidden trophies stay hidden (name and description concealed) until you earn them or switch spoilers on.
- **Filters & search** — by kind (story, strangers, activities, combat, collectibles, crime, money, secret & misc), grade, status (earned / remaining / missable / hidden), and free text.
- **Offline** — zero network requests. No fonts, images, analytics or accounts. Open `app/index.html` straight from disk (file://) or serve `app/` with any static server.

## The numbers

| | |
|---|---|
| Trophies | **55** — 1 Platinum (180 PSN pts), 2 Gold (90), 6 Silver (30), 46 Bronze (15) = **1,230 PSN points** |
| Hidden | **28** hidden / 27 visible |
| PSN targets | 20 trophies carry a published count (3–500, and $250,000) |
| Online trophies | None — all single-player |
| Difficulty trophies | None · no mission medals |
| Platinum estimate | ~200 hours, difficulty 4/10 (early community estimate) |

## Run it

```sh
# From disk — just open it:
open app/index.html        # or double-click it

# Or serve it locally:
node serve.ts              # then open http://localhost:8080
```

## Sources — the official list, verified

- **Names, descriptions, grades**: Exophase, “Grand Theft Auto VI Trophies — PS5”, checked 19 Nov 2026; cross-checked name-for-name against PSNProfiles, checked 19 Nov 2026. The two agree on every name, description and grade.
- **PSN progress targets & rarity**: PSNProfiles trophy list, 19 Nov 2026.
- **Hidden split (27 visible / 28 hidden) & Xbox Gamerscore**: PlanetGTA6, “GTA 6 Trophies”, 18 Nov 2026 (Gamerscore totals 1,000G).
- **Missable flag**: GTABase / PowerPyx via EGamers (18 Nov 2026) vs PlanetGTA6 “cannot be told yet” (18 Nov 2026) — the disagreement is stated on the trophy itself.
- **Cheats disable trophies**: reported by PowerPyx; Rockstar confirmed the same rule for GTA V.

## Method — what this guide will and will not claim

- Every guide is written in this guide's own words from the official description and the PSN target. No text is copied from any other guide site, wiki, video or forum post. Citing a source is allowed; copying it is not.
- Where the official text does not pin down a place or a step (the cocktail bar, the showroom, the five cryptic trophies), the guide says so plainly instead of inventing a location.
- Five trophies have no confirmed trigger at launch (Challenging Tank, Personal Best, Bad Luck I Guess, The Truth Is Out There, plus the cocktail and showroom spots). They are marked “trigger unconfirmed at launch” on their own cards.
- No Rockstar logo or official artwork is used anywhere. All visuals are original CSS.

## Layout

```
app/
  index.html            the guide (tabs: Checklist / Roadmap / Missables / Sources)
  app.js                tracker: localStorage, filters, spoiler rule, export/import
  styles.css            Vice City sunset / neon theme, no external assets
  data/
    trophies.json       the official 55, with guides, kinds, targets, rarity, sources
    trophies.js         same data as a script, so file:// works with the network off
screenshots/            4 renders (1280×800 JPEG): checklist, roadmap, missables, guide detail
main.ts / serve.ts      make.fun harness plumbing (copies app/ + screenshots/, writes dossier.json)
```

## License

MIT. Unofficial and not affiliated with Rockstar Games, Sony or PlayStation.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kzp9rfbw&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
