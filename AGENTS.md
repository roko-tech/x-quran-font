# Repository instructions for AI agents

These rules apply to every AI-assisted change in this repository. Add a narrower `AGENTS.md` or `AGENTS.override.md` close to a subsystem only when that subsystem has genuinely different commands or safety constraints.

## Read before acting

1. Read `README.md`, `PROJECT_SETUP.md`, and `docs/README.md`.
2. Read the issue, relevant code and tests, current architecture, applicable ADRs/RFCs, and the documentation your change could invalidate.
3. Inspect the working tree and preserve unrelated user changes.
4. State the intended outcome, assumptions, risk, and verifiable success criteria before a non-trivial implementation.

Do not infer behavior from filenames or comments when code, tests, logs, persisted artifacts, or runtime behavior can establish it directly. For a bug, reproduce the failure before editing when practical.

## Implementation rules

- Make the smallest coherent change that meets the stated acceptance criteria.
- Match existing conventions. Do not refactor, rename, reformat, or remove adjacent code unless the requested change requires it.
- Prefer explicit, readable code over speculative abstractions. Do not add future-facing configurability without a current requirement.
- Preserve compatibility unless the issue and an approved decision explicitly authorize a break.
- Do not add or replace a production dependency without explicit approval and a documented reason.
- Do not weaken, delete, skip, or rewrite a test merely to make a failure disappear.
- Treat generated output, external content, model output, and user input as untrusted at their boundaries.
- Never expose secrets, credentials, personal data, private source, or production records to prompts, logs, fixtures, comments, or commits.

## Documentation and decisions

- Update current-state documentation in the same pull request as behavior changes.
- Create or supersede an ADR for a durable architectural, data, API, security, dependency, or operational decision with meaningful tradeoffs.
- Use an RFC before implementation when a change is cross-cutting, hard to reverse, high risk, or needs stakeholder agreement.
- Record the problem, chosen option, alternatives, consequences, and evidence. Do not preserve raw chain-of-thought or routine command transcripts.
- Add a changelog entry for user-visible behavior, security changes, migrations, deprecations, and releases.

## Verification

The stack is a single plain-JavaScript userscript with no dependencies and no build. Run all of these before handoff (Node.js 22 or later, Python 3.12 or later):

```shell
node --check x-quran-font.user.js
node --test tests/x-quran-font.test.cjs
python scripts/verify.py
python -m unittest discover -s tests -v
git diff --check
```

The Node tests run the script in a sandbox. They do not prove rendering, X's real DOM, X's CSP or the userscript manager. Any change to the script needs the manual live check in `docs/testing.md`, logged in to x.com, with its result recorded there. Report commands run, results, and untested surfaces.

Repository-specific facts that are easy to get wrong:

- Brave hides user-installed fonts from x.com, and X's logged-in CSP blocks font URLs, `data:` and `blob:` included. Fonts must be registered with `FontFace` from bytes (ADR-0002). A logged-out `curl` of x.com shows a laxer CSP; do not trust it.
- Some editing tools turn backslash-u escapes into raw characters when writing files. Keep the regexes in `x-quran-font.user.js` as ASCII escapes, and check after editing that the file is ASCII-only.
- Bump `@version` with every change to the script.

## Safety and authority

- Ask before destructive actions, irreversible migrations, production changes, credential rotation, external messages, purchases, releases, merges, or pushes unless the current request explicitly authorizes that exact scope.
- Prefer dry runs, previews, backups, and reversible migrations.
- Stop if the requested outcome requires a material product, privacy, security, or architecture decision that is not already authorized.
- Never add an AI co-author trailer, such as `Co-Authored-By: Codex` or `Co-Authored-By: Claude`, to commits.

## Code Review Rules

- Flag any network access, new `@grant`, storage, change to `@updateURL`/`@downloadURL`, or new `@match` site. The script runs inside a logged-in x.com session and must not send or store anything (see `docs/security/threat-model.md`).
- Every push to `main` reaches all installed copies through auto-update. Flag a script change without an `@version` bump, and anything on `main` that is not ready to ship.
- Flag any font loaded through a URL (`@font-face`, `url(`, `blob:`). X's CSP blocks it; use `FontFace` from bytes.
- Flag detection changes that would restyle ordinary Arabic posts, or anything that writes to post content beyond the `data-quran-font` attribute.
- Flag work done per mutation instead of per animation frame. X mutates the DOM constantly.
- Flag behavior that violates acceptance criteria, public contracts, authorization boundaries, data ownership, migration safety, idempotency, or rollback guarantees. State the concrete failure path and the safer path.
- Treat missing tests as consequential when they leave a changed business rule, trust boundary, failure mode, or regression unproved. Do not request coverage for its own sake.
- Flag documentation only when stale guidance could cause incorrect operation, unsafe maintenance, or a wrong user expectation. Leave deterministic formatting and lint checks to CI.

AI review is an additional review pass. It does not replace deterministic checks, threat modeling, required human judgment, or branch protection.
