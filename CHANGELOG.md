# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.4.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/jirai@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.
- Every entry has an `import` condition beside `default`.
- The README has the family's sections in the family's order (Who it is for, Features, Use it in your project, API, Theming, Limits, Browser support, Languages, Roadmap, Architecture, Where it comes from, Changes), the family list sits under "Where it comes from", and a test holds it to them.
- The development tools are the family's: Vitest 5 and Playwright 1.63, as in the other packages.

## [0.4.0] - 2026-10-05

- **Huge fields.** `hugeSettings(level, { grid, shape, size })` and `HUGE_SIZES` (32×32, 48×24 and 24×48) give each of the four levels on a field of four times the medium level's area, 1,024 to 1,152 squares, with the level's share of mines (a 32×32 has 126, 160, 211 and 256 mines at easy, medium, hard and extra-hard), on every rule set and outline. Every one is dealt and proved to need no guess in a median of 3 to 60 ms (73 ms the slowest of ten 32×32 seeds), on the square, orthogonal, hexagonal and wraparound grids and the heart, star and hexagon outlines, and `src/huge.test.ts` wins a 32×32 at easy and at extra-hard by the explained hints alone. The demo's Level menu offers them (`?level=huge-hard`).
- **A faster hint.** `deduce` compares a count only with the counts that hold its first square, and `hintFor` builds the neighbours once instead of at every step: on a 32×32 extra-hard field the explained hint took 51 ms on average and up to 400 ms late in the game, now 8 ms and at most 43 ms. The hints it finds are the same ones.
- Measured, not changed: a reveal or a flag on a 1,024-square board is 4 ms of script, 20 ms with the processor slowed fourfold, and the next frame follows (2,400 squares, the most settings accept: 36 ms), so the board stays plain buttons; the README has the numbers.

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
