# Project setup checklist

This checklist was completed in the first commit, on 2026-11-19. Keep it as the record of setup decisions; `scripts/verify.py` requires the file.

## 1. Define the product

- [x] README: name, purpose, users, quick start.
- [x] [Product brief](docs/product/brief.md), with measures and non-goals.
- [x] Owners: @rokogan (product and technical).

## 2. Choose only the necessary technology

- [x] Stack: one plain-JavaScript userscript for Violentmonkey or Tampermonkey; no framework, database, build or deployment. See the [architecture overview](docs/architecture/overview.md).
- [x] Consequential choice recorded: [ADR-0002](docs/architecture/decisions/0002-load-the-font-from-its-bytes.md), how the font is loaded.
- [x] Minimum skeleton: `x-quran-font.user.js`.
- [x] `.editorconfig` (4-space JS) and `.env.example` (no configuration) updated. `.gitignore` already covers Node.
- [x] License: MIT, matching the owner's other userscripts. Added when the repository was made public.

## 3. Make commands truthful

- [x] Commands are in `AGENTS.md`, `CONTRIBUTING.md`, `docs/testing.md` and CI.
- [x] Dependencies: none, so there is no lockfile. The font is pinned by exact version in `@resource`.
- [x] Dependabot: the `github-actions` ecosystem only, since no other package ecosystem is used.

## 4. Design the system

- [x] Context and flow diagrams in the [architecture overview](docs/architecture/overview.md).
- [x] Boundaries and external contracts (X DOM, manager API, CDN) documented.
- [x] [Threat model](docs/security/threat-model.md).
- [x] Configuration: constants in the script. There are no secrets, logs or metrics; errors fall back to X's normal rendering.

## 5. Establish quality evidence

- [x] Vertical-slice test: `tests/x-quran-font.test.cjs` runs the real script in a sandbox, from font registration through post detection to re-checks.
- [x] Detection rules covered by unit cases, including negatives.
- [x] Live check recorded in [docs/testing.md](docs/testing.md) for Brave and Violentmonkey, logged in to x.com.
- [x] Test data rules and untested surfaces documented.

## 6. Prepare operations

- [x] Release and rollback in the [runbook](docs/operations/runbook.md).
- [x] SLOs and alerts: not applicable, no service ([slo.md](docs/operations/slo.md)).
- [x] Backups: not applicable, no state ([backup-restore.md](docs/operations/backup-restore.md)).
- [x] Template operational language replaced.

## 7. Configure GitHub

- [x] `.github/CODEOWNERS` confirmed (@rokogan).
- [x] `python scripts/github_settings.py --apply` run and read back as matching the baseline. Topics: arabic, fonts, quran, twitter, userscript, violentmonkey.
- [x] Branch ruleset imported from `.github/rulesets/main.json` after the first green CI run. Details in [docs/github-governance.md](docs/github-governance.md).
- [x] Required checks (Ubuntu and Windows) and conversation resolution come from the ruleset.
- [x] Dependabot alerts and security fixes enabled. Secret scanning, push protection and private vulnerability reporting enabled once the repository went public; private, GitHub returned HTTP 422.
- [x] Actions: read-only token, GitHub-owned actions only, pinned to full SHAs.
- [ ] AI review: not connected.

## 8. Protect users and data

- [x] Private contact in `SECURITY.md`.
- [x] Data: the script reads post text in the page and stores or sends nothing.
- [x] Authentication: not applicable, no identities or permissions.
- [x] No personal data in tests or fixtures: test text is Quran verses and invented sentences.

## 9. Prove readiness

- [x] All documented commands run from this checkout.
- [x] CI on Ubuntu and Windows passes. It was blocked by Actions billing while the repository was private.
- [x] Primary workflow exercised in Brave with Violentmonkey, logged in.
- [x] Limitations and untested surfaces listed in the [user guide](docs/user/README.md) and [testing](docs/testing.md).
- [ ] Release checklist: not applicable until a public release.
