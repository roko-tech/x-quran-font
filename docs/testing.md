# Testing

## Automated

```shell
node --check x-quran-font.user.js
node --test tests/x-quran-font.test.cjs
python scripts/verify.py
python -m unittest discover -s tests -v
git diff --check
```

CI runs all of them except `git diff --check` on Ubuntu and Windows. That check only makes sense on uncommitted changes, so run it locally before committing.

[`tests/x-quran-font.test.cjs`](../tests/x-quran-font.test.cjs) runs the real script in a Node `vm` sandbox, with stand-ins for `document`, `FontFace`, `MutationObserver`, `requestAnimationFrame` and `GM_getResourceURL`. It proves:

- the font is requested with `GM_getResourceURL('quranFont', false)` and registered from bytes, and the stylesheet contains no `@font-face` or `url(`;
- which posts are marked: Uthmani, Quranic sukun only, pause mark only and fully vocalised verses are marked; plain Arabic, light tashkeel, a short vocalised phrase and English are not;
- posts that load later are marked, and a post whose text is swapped in place is re-evaluated in both directions;
- many mutations trigger only one scan per frame.

It does not prove rendering, X's real DOM, the CSP, or the manager's resource handling.

Test text is public Quran verses and invented ordinary sentences. Do not copy real users' posts into tests.

## Manual live check (required for every release)

Run in the browser and manager you use, logged in to x.com.

1. Install the build in Violentmonkey and reload x.com.
2. Open the profile of an account that posts Uthmani verses. Do not scroll the Home timeline, which could change other scripts' state.
3. In DevTools on that tab, run:

   ```js
   [...document.fonts].filter(f => f.family === 'X Quran Font').map(f => f.status)
   ```

   Expect `["loaded"]`.

4. Check one verse post: computed `font-size` should be `22.5px` and `line-height` `42.75px`. Look at it: the marks should be clear and not touch the line above.
5. Open a post with ordinary Arabic and check that it looks unchanged.

### Results

| Date | Version | Environment | Result |
| --- | --- | --- | --- |
| 2026-11-19 | 1.0.0 | Brave (Chromium 158), Violentmonkey, Windows 10, logged in | Detection and sizing correct on 4 posts; font `error` (CSP `font-src` blocked `data:`) |
| 2026-11-19 | 1.0.1 | Same | Font `loaded`, 4 of 4 verse posts marked at 22.5px/42.75px; first verse fits 1 line versus 2 in Segoe UI |
| 2026-11-19 | 1.0.2 | Same, reinstalled from the public raw URL | One instance running (1 style, 1 font face), font `loaded`, 5 of 5 verse posts marked at 22.5px/42.75px |

Not yet checked live: the Home timeline, "Show more" expansion, Tampermonkey, and browsers other than Brave.
