# Leonida Platinum Atlas — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/aikbani/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/aikbani/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Every one of the 55 official Grand Theft Auto VI trophies on PlayStation 5 — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden — each with its own plain-language guide, a six-phase route to the Platinum, warnings for the ones you can lock yourself out of, and a checklist that keeps your progress on your own machine. No account, no network, no cost.**

## What you get

- **A tracker that remembers.** Tick a trophy off when it unlocks and the page stores it in your browser's localStorage. Add a short note to any trophy, and move your whole progress between machines with **Export / Import as JSON**. Nothing is uploaded anywhere.
- **A guide attached to each trophy.** Every card carries the official name and description, its grade, a practical how-to written for this guide, the PSN progress target where Sony publishes one, the launch-day PSN rarity snapshot (19 Nov 2026), the Xbox Gamerscore value, and a **source line naming where each fact came from**.
- **A Platinum route in six phases.** Story first, then strangers, then activities and crime, then collectibles and cleanup, then money — each phase lists its trophies and shows how far through it you are. The Platinum lands when the last trophy does.
- **Warnings before you miss something.** One trophy is flagged as possibly missable and two more need your partner at your side; a dedicated Missables page lays out exactly what the sources disagree about instead of picking a side for you.
- **Spoiler-safe by default.** Hidden trophies stay concealed — name and description masked — until you earn them or deliberately switch spoilers on.
- **Find anything fast.** Free-text search plus filters by kind (story, strangers, activities, collectibles, crime, combat, money, secret & misc, completion), by grade, and by status (earned, remaining, missable / partner-gated, hidden).
- **A detail view for each trophy.** Clicking through opens a dialog with the full guide, target, rarity and sources for that one trophy.
- **Fully offline.** Zero network requests, no fonts, no images, no analytics. Open `app/index.html` directly from disk, or serve the `app/` folder with any static server.

## The trophy list, in numbers

| | |
|---|---|
| Trophies | **55** — 1 Platinum (180 PSN points), 2 Gold (90), 6 Silver (30), 46 Bronze (15), totalling **1,230 PSN points** |
| Hidden vs visible | **28 hidden / 27 visible** |
| Xbox Gamerscore | Adds up to exactly **1,000G** across the set |
| PSN progress targets | 20 trophies publish a count (from 3 up to 500, plus $250,000) |
| Online trophies | None — the whole list is single-player |
| Difficulty trophies | None, and no mission medals either |
| Platinum estimate | Around 200 hours, difficulty 4/10 (early community estimate) |

## How the list was checked

The 55 names, descriptions and grades were matched live, one by one, against Exophase's GTA VI PS5 trophy page and against PSNProfiles, both checked 19 Nov 2026 — the two agree on every name, description and grade. The hidden/visible split and the per-trophy Gamerscore come from PlanetGTA6's trophy page (18 Nov 2026), and the Gamerscore column was summed to confirm it lands on exactly 1,000G. PSN progress targets and rarity percentages come from the PSNProfiles list of 19 Nov 2026.

The missable call is honest about its uncertainty: GTABase / PowerPyx (via EGamers, 18 Nov 2026) report one meditation spot as Chapter-1-only, while PlanetGTA6 (18 Nov 2026) says it cannot be told yet — so the trophy is flagged as *possible*, with both positions stated on its own card. Cheats are reported to disable trophies (PowerPyx; Rockstar confirmed the same rule for GTA V), so the guide advises keeping cheats off until the Platinum is yours.

## What this guide does and does not claim

- Each guide is written in this project's own words from the official description and the PSN target. Sources are cited, never copied — no text is lifted from another guide site, wiki, video or forum post.
- Where the official text leaves a place or a step unpinned (the cocktail bar, the showroom, five cryptic trophies), the guide says so outright rather than inventing a location. Five trophies carry a "trigger unconfirmed at launch" mark: Challenging Tank, Personal Best, Bad Luck I Guess, The Truth Is Out There, plus the cocktail and showroom spots.
- No Rockstar logo or official artwork appears anywhere; every visual is original CSS.

## Running it

```sh
# Straight from disk — just open the file:
open app/index.html        # or double-click it in your file manager

# Or serve it locally:
node serve.ts              # then open http://localhost:8080
```

Demo links used only for screenshots: `?demo=1` seeds 13 earned trophies, `?spoilers=1` reveals hidden names, `?view=roadmap|missables|sources` jumps to a tab, and `?trophy=28` opens one trophy's detail dialog.

## How the entry is packaged

`main.ts` is the agent-authored entrypoint for make.fun. It copies `app/` and `screenshots/` into the output directory and writes `dossier.json` there using the kit's own `buildDossier` from `vendor/makefun-frontend.ts`, under these caps: dossier text at most 163,840 bytes; at most 4 screenshots, each at most 262,144 bytes; the app at most 993 files / 48 MiB; app paths at most 1,000 bytes. `serve.ts` is a small static server for local previews only — it serves `app/` at the root and makes no network calls of its own.

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

## Verification

- **55/55 trophies** present in `app/data/trophies.json`, with the grade split, hidden count and Gamerscore total above all reconciling.
- **Zero console or page errors** on load; the file:// render and the http render are byte-identical, and the page makes no http(s) requests at all.
- **4 screenshots**, 1280×800 JPEG, 102–158 KiB each — all inside the 256 KiB cap.
- **Kit check passes**: `node cli/makefun.mjs check` reported 5 passed, 0 failed.

## License

MIT. Unofficial and not affiliated with Rockstar Games, Sony or PlayStation.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kzp9rfbw&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
