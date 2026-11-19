# Changelog

All notable changes are documented here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions match the userscript's `@version`.

## [1.0.2] - 2026-11-19

### Added

- Auto-update from the public repository (`@updateURL`/`@downloadURL`), plus `@homepageURL`, `@supportURL`, `@author` and `@license`. Copies installed before 1.0.2 need one reinstall from the raw link to pick these up.
- MIT license.

## [1.0.1] - 2026-11-19

### Fixed

- The font now loads when you are logged in to x.com. X's logged-in CSP blocks `data:` fonts, so the font is registered with `FontFace` from its bytes instead of `@font-face` ([ADR-0002](docs/architecture/decisions/0002-load-the-font-from-its-bytes.md)).

## [1.0.0] - 2026-11-19

### Added

- Posts containing Quran text, either Uthmani marks or full vocalisation, are shown in Scheherazade New at 1.5× size with 1.9 line height. Other posts are unchanged.
- The font is bundled through `@resource`, because Brave hides installed fonts from x.com.
