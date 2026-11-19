# Threat model

- Status: Current (v1.0.1)
- Owner: @rokogan
- Last reviewed: 2026-11-19

## Scope and objectives

The userscript runs inside the user's logged-in x.com session with access to everything on the page. It must:

- never send page content or account data anywhere;
- never execute or interpret post text, only test it against fixed regular expressions;
- load only the pinned font file, through the userscript manager.

## Assets

| Asset | Sensitivity | Where |
| --- | --- | --- |
| The user's X session and page content | High | Browser; the script reads post text only |
| The installed script | High: it runs on a logged-in site | Userscript manager storage |
| Source and `main` branch | High: installed copies auto-update from it | Public GitHub repository |

There are no credentials, stored data, logs or telemetry.

## Trust boundaries

```mermaid
flowchart LR
    Posts[Post text from other X users: untrusted] -->|textContent, regex test only| Script[Userscript]
    CDN[jsDelivr font file] -->|install time, via manager| Script
    Repo[GitHub raw main] -->|updates, via manager| Script
    Script -->|data-quran-font attribute, style rule| Page[x.com DOM]
```

## Threat register

| Scenario | Path | Impact | Control | Residual risk |
| --- | --- | --- | --- | --- |
| Malicious post text | Crafted text in a post | Script misbehaves or injects markup | Text is only read via `textContent` and matched by bounded character-class regexes; nothing is written back except an attribute | Low |
| Tampered font file | Compromised CDN or package | Malformed font reaches the browser's font parser | Exact version pin (`@fontsource/scheherazade-new@5.3.0`); fetched once at install; browsers sanitize web fonts | Low; accepted |
| Tampered script update | Someone gains write access to `main`; the manager auto-installs the new version from `@updateURL` | Arbitrary code on a logged-in x.com, for every installed copy | Only the owner can write. Updates come over HTTPS from `raw.githubusercontent.com`. CI checks every push; the branch ruleset is listed in [github-governance.md](../github-governance.md). Users can untick **Allow update** | Medium: auto-update is a standing trust in this repository |
| Data exfiltration | A future edit adds network calls | Account or post data leaks | The script has no network calls, and only `GM_getResourceURL` is granted. Review rule in [AGENTS.md](../../AGENTS.md) | Low |
| Performance abuse | A huge page or flood of mutations | Page jank | At most one scan per animation frame; linear regex tests | Low |
| Dependency or CI compromise | Mutable action | Bad CI result | Actions pinned to full SHAs; read-only token | Low |

## Review triggers

Revisit when adding a `@grant`, network access, storage, a new `@match` site, a different update URL, a new font source, or a new collaborator with write access.
