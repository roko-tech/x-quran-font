# Operations runbook

- Status: Current (v1.0.1)
- Owner: @rokogan

This is a client-side userscript. There is no service, deployment, monitoring or on-call.

## Release

1. Make the change, bump `@version` in `x-quran-font.user.js`, and add a [changelog](../../CHANGELOG.md) entry.
2. Run the automated commands and the manual live check in [testing.md](../testing.md).
3. Commit, push to `main`, and confirm CI passes for that commit.
4. Install the file in Violentmonkey (**Reinstall**).

## Roll back

Check out the previous version and reinstall it:

```shell
git show <previous-commit>:x-quran-font.user.js > x-quran-font.user.js
```

Or disable the script in Violentmonkey. X then renders normally.

## Diagnose

| Symptom | Check |
| --- | --- |
| Verses look like before | Is the script enabled for x.com? Does `document.querySelector('[data-testid="tweetText"]')` still match? X may have renamed the attribute. |
| Bigger but old font | Font status (see [testing.md](../testing.md)). If it is `error`, check the console for a `font-src` violation: X may have changed its CSP or how fonts are handled. |
| Page feels slow | Profile x.com with the script disabled and then enabled; scans should be at most one per frame. |
