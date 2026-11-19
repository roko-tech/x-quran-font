# ADR-0002: Load the font from its bytes

- Date: 2026-11-19
- Status: Accepted
- Owners: @rokogan
- Related: v1.0.0 (font blocked) and v1.0.1 (fix), [architecture overview](../overview.md)

## Context

Evidence gathered live in Brave on Windows, logged in to x.com:

- Brave Shields hides user-installed fonts from x.com. Canvas measurement showed only Segoe UI, Arial, Tahoma and Times New Roman available; Scheherazade New, Amiri Quran, Noto Naskh Arabic, Sakkal Majalla and Traditional Arabic were all hidden.
- X's logged-in CSP is `font-src 'self' https://*.twimg.com https://js.intercomcdn.com https://fonts.intercomcdn.com`. The logged-out response also allows `data:`, which is why v1.0.0 passed a `curl` check and then failed for the real user.
- An `@font-face` with a `data:` URL failed with a `font-src` violation. A `FontFace` constructed from an `ArrayBuffer` loaded, and the text visibly reflowed.

## Decision drivers

- Must work in Brave with default Shields, logged in.
- No change to the user's privacy settings.
- Small, self-contained script with no runtime network access.

## Considered options

### Local font by family name

Zero bytes to ship, but Brave hides it. Rejected.

### Relax Brave fingerprinting protection for x.com

Exposes local fonts, but weakens privacy on a large tracking-heavy site. Rejected.

### `@font-face` with a CDN, `data:` or `blob:` URL

Blocked by X's logged-in CSP. Rejected; this was v1.0.0.

### `FontFace` from bytes (chosen)

The manager fetches the pinned woff2 once through `@resource`. `GM_getResourceURL(name, false)` returns it as a `data:` URL, the script decodes it to bytes, and `document.fonts.add(new FontFace(..., bytes))` registers it. Constructing from bytes loads no URL, so CSP does not apply.

## Decision

Ship Scheherazade New (Fontsource 5.3.0, Arabic subset, about 80 KB) via `@resource` and register it with `FontFace` from bytes.

## Consequences

### Positive

- Works under the logged-in CSP and default Brave Shields.
- No request at page load; the font comes from the manager's cache.

### Negative and tradeoffs

- About 106 KB of base64 is decoded on every x.com page load, which takes a few milliseconds.
- The design depends on X's CSP not covering binary `FontFace` sources, which matches current browser behaviour.
- Changing the font means editing `@resource` and reinstalling.

### Follow-up

- If X or browsers start restricting binary `FontFace`, revisit. The fallback still enlarges posts in X's normal font.

## Validation

- Unit test: the font is registered from bytes and the stylesheet contains no `@font-face` or `url(`.
- Manual live check in [testing.md](../../testing.md): `X Quran Font:loaded` on a logged-in x.com page.
