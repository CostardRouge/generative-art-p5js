# Project memory — decisions, reasons, traps

Long-term memory of this repo, read at the start of **every** agent session (imported by `CLAUDE.md`). It holds what the code and `git log` cannot tell you: the choices made and their reasons, what was tried and rejected, the traps that cost time, how the maintainer likes to work.

This file is the **always-loaded index**. The detail lives in `docs/memory/<topic>.md`, one file per area, loaded **on demand**: read the topic file(s) matching the area you are about to touch **before** acting (table at the bottom). Do not `@import` them into `CLAUDE.md`.

The memory was opened on 2026-10-19, when the repository adopted the portfolio's common spec, and seeded from what the repository itself says (its files, its workflow, its history). Nothing below comes from a conversation with the maintainer unless it says so; correct an entry rather than adding a second one beside it.

## How to maintain (mandatory — CLAUDE.md rule 2)

- **When**: at the end of every task, before its commit, in the same commit. Writing is the **default**; only skip if there is truly nothing a future agent could use, and say so explicitly in the final message.
- **What**: a design/product decision, a non-obvious technical choice, an explicit rejection ("the maintainer did not want X because Y"), a trap and its remedy, a working preference. Not implementation detail readable in the diff, not what `git log` or the README already say.
- **Where**: the matching `docs/memory/<topic>.md`; a new file only when no topic fits (kebab-case name, add it to the table below). Cross-cutting rules, working style, decisions-at-a-glance and open items stay in this index.
- **How**: search first and **update** the existing entry rather than adding a near-duplicate; delete what became false. One entry = one short paragraph: *decision → why → how to apply*, dated `YYYY-MM-DD` on first write and on each revision. Say the same thing **once**.
- **Language**: **English**, dense, factual. No session narration. No test counts (they rot).
- Budget: keep this index under ~200 lines and each topic file under ~150; if one outgrows that, split it.

## Working with Steeve Pommier

- 2026-10-19 — **Answers in French, short, results first**, as in every repo of the portfolio: he does not want the implementation detailed before he has something to look at. **How to apply**: end a task with what to open (a sketch's address, the built gallery) and keep the how in the commit bodies.
- 2026-10-19 — **The sketches are his own hand-written work** (2021–2025, before the agent era: 55 of the 58 visible commits are his, titled by the sketch's name). An agent's job here is the gallery around them — the build, the deploy, the measurement, the scaffold — never the art. **How to apply**: do not lint, refactor or "modernise" a sketch unasked; a change to one is his.

## Direction in five lines

- An archive gallery: the sketches of before the studio (`p5-templates`), kept as they were made, browsable at art.steeve.website.
- The gallery's chrome is an external, archived package (`sketch-gallery`): this repo holds the sketches, their index (`tree.json`) and the deploy; a change to the page itself is a change there, or a decision to vendor it.
- Plain files, no build step for a sketch: open a folder with any static server, it runs.
- The deploy is the build: every push to `main` rebuilds the site and republishes the `gh-pages` branch.
- Measured honestly: the owner's self-hosted Umami, cookie-free, Do Not Track honoured, a kill switch.

## Decisions at a glance (details in the topic files)

- The gallery page comes from `sketch-gallery` 0.0.15 (the owner's own package, archived), pinned by git tag; it is built with base `/`, so the site works only at a domain's root — `gallery-and-deploy.md`.
- `tree.json` is committed and regenerated on the owner's Mac only: its dates order the gallery, and a fresh clone has none — `gallery-and-deploy.md`.
- The tracker is injected after the build into every built page (2026-10-18, replacing Google Analytics); an empty website id is the kill switch — `gallery-and-deploy.md`.
- The icon set and the manifest (C11, 2026-10-22): a spiral drawn by `scripts/build-icons.mjs` into `site/`, committed; `site/` copied to the built root and the head tags injected into every built page after the build, like the tracker; `display: browser` — `gallery-and-deploy.md`.
- The legal notice (C17, 2026-10-22): a static page in `site/legal/`, English, linked from the version footer, with a switch on Umami's own `umami.disabled` key; `tests/legal.test.js` holds it to the tracker's settings and the browser keys — `gallery-and-deploy.md`.
- `llms.txt` (C17, 2026-10-22): generated after the build from `tree.json` by `scripts/build-llms.js`, the gallery's own order and links, written to the built root — `gallery-and-deploy.md`.
- Every sketch's page is the one template, reached by symlinks; media live in git (1.5 GB, no LFS); previews are taken on the owner's Mac — `sketches.md`.
- `.idea/` and `.vscode/` left git on 2026-10-19 (per-machine state; the settings file held a dead absolute path); `.gitignore` now covers them and `.env*` — `gallery-and-deploy.md`.
- Toolchain and gate (C14, C15, 2026-10-19): Node 24 in `.nvmrc`, read by every workflow, 22 the floor; Biome 2 lints `scripts/` and `package.json` only — the art is out of scope by decision, the formatter off until a reformat is its own pull request; `ci.yml` runs the lint and the whole build on every pull request and push to `main`; Dependabot weekly; the deploy workflow moved to the same toolchain with its Pages action and what it publishes untouched — `gallery-and-deploy.md`.
- Dependabot follows C20 (2026-10-21): monthly with a cooldown, one `minor-and-patch` group, npm + GitHub Actions; `puppeteer-core` majors held while `chrome-aws-lambda` (abandoned, peer `^10`) stays — `gallery-and-deploy.md`.
- MIT licence (2026-10-19, the portfolio's default for a public repository, as `tamalou` and `metube-extension` chose on 2026-10-17): the sketches, `utils/` and the scripts are the owner's own work, and without a licence nobody could reuse them; the vendored libraries keep their authors' licences, said in the README — `LICENSE`, `package.json`.
- Versions (C13 in `second-brain`, 2026-10-19): one SemVer version in `package.json`, `CHANGELOG.md` in English as the source, tags and GitHub Releases made by `release.yml` on `main`, a release is its own PR on the owner's word; **1.0.0 "Airbrush"** — the gallery is live and linked to — with no backfill (a stream of sketches, no milestone an agent could name); codenames are drawing tools, alphabetical; the version shows at the foot of the gallery's page only, written after the build like the tracker — CLAUDE.md rule 4, `gallery-and-deploy.md`.
- A session that changes code reports this project's state to its fiche, project `generative-art-p5js` in the private `second-brain` repo, through a Registry block hidden in its pull request's description (in a local session, after a `Registry:` line in the commit body); the repo is public, so the block carries only `Project:`, ticked boxes and one `Log:` line, checked on the pull request by `registry.yml`'s `check` job and sent on every push to `main` by its `send` job — CLAUDE.md rule 3.
- The portfolio standard, `COMMON-PROJECT-SPEC.md` in `second-brain`, adopted 2026-10-19: the agent scaffold (this file, `docs/memory/`, the canonical `/memorize`, `AGENTS.md` as a symlink), rules 1 to 4 and the trust-the-disk section in `CLAUDE.md`, the trailer the harness asks for, Node pinned, Biome in the gate over `scripts/`, Dependabot, `.gitignore` hygiene, the MIT licence and 1.0.0 with its footer; what is in force, what was left to the owner and what is n/a — `gallery-and-deploy.md`.

## Open items

- 2026-10-22 — **`tree.json`'s names are right again, its dates are not**: the owner's regeneration (`5ab67fd`, 2026-10-20) lists `censored-v15-sydney` and drops `social-media-templates-v1-basic`, but every date in it falls within two seconds of 2026-10-20 12:15 UTC, where the previous file spanned 2024-01 to 2025-01 — the folders were dated at a checkout, so the gallery's newest-first order (and `llms.txt`'s) is now the walk order. Restoring real dates is the owner's call (regenerate where the folders keep them, or take the groups' dates from `5ab67fd~1`); a session never hand-edits them (`gallery-and-deploy.md`).
- 2026-10-19 — `bin/registry-setup.sh generative-art-p5js` must be run by the owner (from his machine, in `second-brain`) so `registry.yml`'s `send` job can report; until then it says so and stays green.
- 2026-10-19 (rev. 2026-10-22) — English only, where C17 asks for English and French: the gallery's texts live in the external package, so a French twin means a change there or vendoring the page — the owner's call. (The icon set, the manifest and the legal notice, also left out of the adoption pass, shipped on 2026-10-22, `gallery-and-deploy.md`.)
- 2026-10-19 — The gallery page loads a font from Google (`sketch-gallery`'s `index.html`): one third-party request on every visit, where the sibling sites self-host their fonts. Fixing it means a change in `sketch-gallery` or vendoring the page; the owner's call.
- 2026-10-19 — The first Release, v1.0.0, is made by `release.yml` on the merge of the adoption pull request: check the repository's Releases page once, and that the deployed page shows `v1.0.0` at its foot.
- 2026-10-19 — `npm audit` reports 10 high-severity findings, all in the dev dependencies of the Mac-only preview script (`puppeteer-core` ^10, `chrome-aws-lambda`); nothing of them ships. Dependabot will propose the bumps; `puppeteer-core` 10 → current changes the script's API, so that one is the owner's call.

## Topic files

| file | read when |
| --- | --- |
| `docs/memory/gallery-and-deploy.md` | touching the gallery build, `tree.json`, `tree-meta.json`, the deploy workflow, the tracker injection, `scripts/`, how the site is published |
| `docs/memory/sketches.md` | touching a sketch, the template, `utils/`, `libraries/`, `assets/`, the previews, the media in git |
