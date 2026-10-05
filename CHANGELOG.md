# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.0] - 2026-10-05

- An extra-hard level, 40×24 with 240 mines (25%), joins easy, medium and hard on every rule and outline, and every field is still proved to need no guess. `beginner`, `intermediate` and `expert` stay as names for easy, medium and hard, and `PRESETS` keeps them. New: `LEVELS`, `LEVEL_SIZES`, `LEVEL_ALIASES`, `levelNamed`, `levelSettings` (shaped boards keep a level's size and share of mines) and `measureBoard`, which scores density, multi-step share and depth of deduction so the levels can be shown to step up.
- No-guess dealing is much faster and no longer fails on dense fields: a one-pass solver that agrees with the hint engine replaces the repeated scans (a 30×16 expert square field took over half a second, now about 2 ms), and when no random layout can be finished the closest is repaired by moving single mines next to where the solver stopped. Orthogonal expert fields, which failed five times in six, are now dealt every time. New options `repairs` and `repair: false` (the 0.2 behaviour of giving up after the random layouts).
- Every field 0.2.1 dealt is dealt again, identically, for the same seed and settings (pinned by tests), and saved games from 0.2.1 replay unchanged. Only settings that used to throw `GenerationError` deal differently, because they now succeed.
- Narrowed: a cell with no neighbours under the rules (a tip of an orthogonal or hexagonal star) cannot be opened from without a guess, so an opening there now throws `GenerationError` with code `"opening"`, and unreachable cells are made mines. Nothing else is narrowed: extra-hard is offered on square, orthogonal, hexagonal and wraparound grids and on rectangle, heart, star and hexagon outlines.
- The demo's Size menu is now Level (easy, medium, hard, extra-hard, wide, tall), in English and Japanese, follows the grid and outline, and reads `?level=` (old names too). The Playwright port can be set with `TEST_PORT`.

## [0.2.1] - 2026-10-05

- The package no longer ships its unit tests (`src/*.test.ts`) in the npm tarball.
- Each of the demo's settings now has a real line of help under it when the Help switch is on, in English and Japanese.
- The demo, its README family list and its tests are the family's own: the shared header, footer and list of twenty-two, written from one template.
- The package check runs on Windows too, where npm is a .cmd file.
- CI runs on a push to main and on a pull request, not twice per pull request, and the release's notes are the changelog's section.
- Complete package presentation: desktop and phone screenshots, badges, demo/API links, targeted keywords and linked MIT licence.
- Source-derived API reference and public API comments, contribution/security files, and a package presentation gate.

## [0.2.0] - 2026-10-05

- Orthogonal fields: four-neighbour clues, independent hints, proof-backed generation, drawing, saved progress and bilingual controls. Existing square, hexagonal and wraparound modes remain available.

## [0.1.0] - 2026-10-04

- Square, hexagonal and wraparound fields, seeded and configurable.
- Safe and clear openings, verified no-guess generation and explained deductions.
- Immutable rules, versioned saved games, daily seeds and separate browser worker.
- Configurable materials and markers, English/Japanese controls, keyboard and touch play.
- Plain-DOM mounting, optional React component and custom element.
