# Product brief

- Status: Accepted
- Product owner: @rokogan
- Technical owner: @rokogan
- Last reviewed: 2026-11-19

## Problem

When reading X in Brave on Windows, posts that quote the Quran are hard to read. X has no Arabic font, so the text falls back to Segoe UI at 15px with 20px lines. That font mangles Uthmani marks, and the tight lines make stacked diacritics collide. Installing a better font does not help, because Brave hides user-installed fonts from x.com.

## Users and stakeholders

| Group | Need | Current workaround | Risk if unmet |
| --- | --- | --- | --- |
| The owner, reading X in Arabic | Read verses in timelines without straining | Open the verse elsewhere, or zoom the page | Verses are skipped or misread |
| Maintainer (same person) | Change size, spacing or font without re-engineering | None | Fixes break silently when X changes |

## Proposed outcome

Posts containing Quran text show in a proper Naskh font, larger and with taller lines. All other posts look exactly as X renders them.

## Success measures

| Measure | Baseline | Target | How measured |
| --- | --- | --- | --- |
| Verse posts rendered in the bundled font on x.com | 0% (Segoe UI) | Every post with Uthmani marks on a test profile | Manual check in [testing.md](../testing.md) |
| Ordinary posts unchanged | n/a | No restyling of plain or lightly vocalised Arabic, or of English | Unit tests plus a timeline look |

## Scope

### In scope

- Post text on x.com and twitter.com, in timelines and on post pages.
- Uthmani text and fully vocalised text in ordinary spelling.

### Non-goals

- Restyling all Arabic on X.
- Direct messages, the composer, translations or profile bios.
- A settings UI. Constants are edited in the script.
- Publishing to userscript directories.

## Constraints and assumptions

- X's logged-in CSP blocks fonts loaded from any URL, `data:` and `blob:` included ([ADR-0002](../architecture/decisions/0002-load-the-font-from-its-bytes.md)).
- Brave Shields hides user-installed fonts on x.com.
- X marks post text with `data-testid="tweetText"`. If X renames it, the script stops matching and X's normal styling returns.

## Primary journey and acceptance

> Given the script is installed and the user is logged in to x.com, when they open a timeline or profile with Quran posts, then those posts render in Scheherazade New at 1.5× size and 1.9 line height, and the font reports `loaded`.

Failure case: if the font cannot load, posts are still enlarged with taller lines, but in X's normal font.

## Delivery slices

1. Done: detection, font from bytes, styling (v1.0.1). Public repository with auto-update (v1.0.2).
2. Possible next: detect short verses in ordinary spelling.
