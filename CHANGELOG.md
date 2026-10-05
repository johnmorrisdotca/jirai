# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
