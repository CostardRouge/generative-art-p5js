# Instructions for LLM agents (Claude Code, Codex, Cursor, etc.)

Agents read this file at the start of every session. These rules override the agent's default behaviour and apply for the whole session, not only the first turn. They are cut from `COMMON-PROJECT-SPEC.md` in the private `second-brain` repository (profile **site**: a static gallery with no server state of its own; a push to `main` is the deploy).

## Context

- **generative-art-p5js** — the owner's p5.js sketches from before the studio (`p5-templates`), published as a browsable gallery at https://art.steeve.website/ (GitHub Pages; https://costardrouge.github.io/generative-art-p5js/ answers 301 to it). 46 groups, about 460 sketches, each a folder `sketches/<group>/<name>/` holding an `index.js`, its `screenshot.jpeg` (the gallery's tile and the page's OpenGraph image) and four symlinks to the shared folders at the root: `index.html` → `../../../assets/html/index.html` (the one page template), `assets`, `libraries`, `utils`. `utils/` is the sketches' own runtime (engine, easing, colors, recorder, midi…), `libraries/` the vendored libraries (p5, p5.sound, three, simplex-noise, webmidi, CCapture, sketch-ui), `assets/` the fonts and the stylesheet. `README.md` describes the layout for people.
- **Owner**: Steeve Pommier (GitHub `CostardRouge`). He writes in **French**: answer in French. He wants results (a page, a sketch running, a green gate), not implementation walkthroughs; he decides, reviews and tests by hand. The sketches are his own hand-written work (2021–2025): treat one as an artwork, never refactor or "fix" it unasked.
- **Stack**: plain JavaScript, no bundler, no framework, no TypeScript, no test suite. A sketch loads p5 from `libraries/` and runs as it is. The gallery page is **not in this repository**: the external `sketch-gallery` package (`github:CostardRouge/sketch-gallery#0.0.15`, the owner's own, a React + Vite 4 single page, archived on GitHub) builds it from `tree.json` (the committed index of groups and sketches with their dates) and copies `assets`, `libraries`, `utils`, `sketches` and `tree.json` beside it into `node_modules/sketch-gallery/dist`. Package manager: **npm** — `package-lock.json` is the only lockfile (keep it that way). Node 24 (`.nvmrc`, what every workflow runs), 22 the floor (`engines`).
- **Commands that exist today**: `npm ci`, then `npm install --prefix ./node_modules/sketch-gallery` (the gallery package's own dependencies, which it does not lock) · `npm run gallery:build` (the gallery page with Vite, then the sources copied beside it: about 1.5 GB, a minute and a half) · `npm run site:copy` (copies `site/` — the icon set, the manifest, the gallery's own pages — to the root of the built folder, `scripts/copy-site.js`) · `npm run umami:inject` (writes the tracker tag into every page of the built folder, `scripts/inject-umami.js`) · `npm run icons:inject` (writes the icon set and the manifest into every built page's head, replacing the emoji favicon, `scripts/inject-icons.js`) · `npm run version:inject` (writes the version at the foot of the gallery's page, `scripts/inject-version.js`) · `npm run llms:build` (writes `llms.txt` at the built root from `tree.json`, `scripts/build-llms.js`) · `npm run icons` (redraws the icon set into `site/` — by hand, after `npm i --no-save sharp`, see Other rules) · `npm run build:tree` (regenerates `tree.json` — **the owner's machine only**, see Other rules) · `npm run build:previews` (the missing `screenshot.jpeg` of each sketch — **a Mac with Chrome only**, see Other rules) · `npm run gallery:deploy` (the package's own publish to `gh-pages`: never run it, the workflow deploys) · `node .github/release.mjs check` (`CHANGELOG.md` against `package.json`'s version, rule 4) · `npm run lint` (Biome's recommended rules over `scripts/` and `package.json` only — the sketches and `utils/` are the art, left out on purpose, `biome.jsonc` says why; the formatter stays off until a reformat is its own pull request) · `npm test` (Node's own runner over `tests/*.test.js`, no dependency).
- **The gate**: `npm run lint`, then what the deploy builds — `npm install --prefix ./node_modules/sketch-gallery`, `npm run gallery:build`, `npm run site:copy`, `npm run umami:inject`, `npm run icons:inject`, `npm run version:inject`, `npm run llms:build` — exactly what `ci.yml` runs; green, and the built page looked at when a change reaches it. In that order, every time: an `npm install` of anything prunes the gallery package's own dependencies, and `npm ci` deletes the built folder with `node_modules`.
- **Deploy**: `.github/workflows/deploy-github-pages.yaml` on every push to `main` — install, build, copy `site/`, inject the tracker, the icons and the version, write `llms.txt`, push `node_modules/sketch-gallery/dist` to the `gh-pages` branch (`JamesIves/github-pages-deploy-action`). GitHub Pages serves that branch at `art.steeve.website`: the custom domain is set in the repository's Pages settings and the branch carries its `CNAME` (checked 2026-10-19); nothing in the sources names it. The gallery is built with base `/`, so it works only at a domain's root.
- **CI**: `ci.yml` runs the gate on every pull request and every push to `main` (a 1.5 GB checkout each time; nothing is deployed there); `dependabot.yml` raises the npm dev dependencies and the workflows' actions weekly; `release.yml` checks `CHANGELOG.md` on every pull request and, on `main`, makes the tags and the GitHub Releases (rule 4); `registry.yml` reports the project's state (rule 3).
- **This repository is PUBLIC** (measured 2026-10-19). So rule 3's public-repo restriction applies: a Registry block carries only `Project:`, ticked boxes and one `Log:` line — never a `Last point:` nor an open box. `registry.yml` reads the visibility itself, so nothing here needs changing if the repo goes private.
- Several agent sessions may run **in parallel** on this repo. Git history must stay readable: **one commit = one task**.
- **Local sessions: never `git push`** — the developer tests locally and pushes himself. **Cloud / web sessions (ephemeral container): push the working branch and open a pull request**, it is the only way the code gets out. Never push to `main` either way. The repository weighs 1.5 GB (the sketches' media are in git, no LFS) and a cloud clone is shallow: `git fetch origin main` before any push.

## Rule 1 — Automatic commit at the end of every task (MANDATORY)

As soon as a task requested by the user is finished (feature, fix, refactor, content…), the agent MUST create a commit before handing back. No need to ask permission: it is the expected behaviour.

### Exact procedure

1. **Check the state**: `git status --porcelain` and `git diff --stat`.
2. **Select only the task's files**:
   - Stage file by file with `git add <path>` (never `git add -A`, `git add .` or `git commit -a`).
   - A modified file unrelated to the task (parallel session, tooling noise) stays **unstaged**. Do not touch it, stash it or reset it.
   - If one file holds changes from this task AND another, prefer `git add -p <file>` to stage only the relevant hunks. If inextricable, stage the whole file and say so in the commit body ("also contains …").
   - Never stage: `.env*` and any secret file, `.idea/`, `.vscode/`, `node_modules/` (the built gallery lives under it), `.DS_Store` — unless the task is explicitly about them. If one of these turns out to be *tracked*, say so: it must be untracked and gitignored, not carefully avoided at every commit.
   - Check with `git diff --cached --stat` before committing.
3. **Commit with a readable message** (format below). Always use a HEREDOC to keep title + body, and end it with the attribution trailer(s) your harness asks for:

   ```bash
   git commit -m "$(cat <<'EOF'
   Imperative title, ≤ 72 characters, no trailing period

   Why this change, what it does concretely, non-obvious decisions.
   One line per idea. Mention the files/areas touched if useful.

   Co-Authored-By: …
   EOF
   )"
   ```

4. **Push only from a cloud session** (see Context). End the reply with a recap: short hash + commit title + the list of files that were modified but deliberately **left uncommitted**, if any.
5. If a git hook changes or refuses something: read the output, fix, recommit. Never `--no-verify`. (There is no hook in this repo today.)

### Commit message format

- **Title**: English imperative, clear sentence, ≤ 72 chars, **no `feat:`-style prefix**, no trailing period. Example: `Carry the gallery's Umami id in the injection script`. Most of the history before 2026-10 is terse sketch names (`bali`, `v12`, `Update index.js`): that is the owner committing his art, not the convention for an agent.
- **Blank line**, then a **body**, mandatory whenever the title is not enough: the *why*, the *how* in 2–6 lines, the trade-offs, what remains to do.
- A commit **never** mixes two tasks. If a session handles several distinct tasks, make several successive commits.
- No empty commit, no "WIP" commit, no commit for an unfinished task. If the task is interrupted, leave the work uncommitted and say so.

### When is a task "finished"?

- The requested code is written **and** the gate is green (Context). A change to a sketch or to the template is looked at in a browser: serve the repository root with any static server and open `sketches/<group>/<name>/` — there is no dev server in the repo; a Playwright Chromium is in the cloud container (`/opt/pw-browsers`) for a headless look. A change to the built page (the injections, the workflow) is looked at in `node_modules/sketch-gallery/dist` after `npm run gallery:build`.
- A plain question, an exploration or an explanation produces **no** commit (nothing to commit).

## Rule 2 — Project memory in `MEMORY.md` + `docs/memory/` (MANDATORY)

The repo carries its own long-term memory, read locally and in the cloud alike:

- **`MEMORY.md`** at the root — the **index**, imported below and therefore loaded every session: how to maintain the memory, how the maintainer works, direction and decisions at a glance, open items, and a table of topic files.
- **`docs/memory/<topic>.md`** — one file per area, loaded **on demand**. Not imported here on purpose: the split keeps the per-session prompt small.

Obligations:

- **Read `MEMORY.md`, then the topic file(s) for the area you are about to touch, before acting** — to understand previous choices and not re-propose what was rejected. The table at the bottom of `MEMORY.md` maps areas to files.
- **Every task writes to memory by default.** At the end of each task, ask: "what should a future agent know that is neither in the code nor in `git log`?" — decisions and their reasons, rejected options, traps and remedies, working preferences. Write it in the matching topic file (update the existing entry first; delete what became false; add a short dated *decision → why → how to apply* entry otherwise), and update the index if a cross-cutting decision, an open item or a new topic file is involved. **If, exceptionally, there is nothing worth keeping, say so explicitly in the final message** ("no memory update: …") — silence is not an option.
- A user-visible change is unfinished until `README.md` says what the code does.
- The memory update is part of the task: it is staged **in the same commit** (rule 1).
- Memory is written in **English**, dense and factual; no session narration, no duplication of what the code, `git log`, the README or this file already say; each fact stated once, cross-referenced by file name elsewhere.
- The project command `/memorize` (`.claude/commands/memorize.md`) does this consolidation on demand over a whole conversation.

@MEMORY.md

## Rule 3 — Report the project's state (MANDATORY)

The register of what is open is the private `second-brain` repository: one
folder per project, filed by group and domain and found by its slug (`generative-art-p5js`
here), whose `README.md` carries a typed front matter (`state`, `point`,
`repos`) and a `## To do` list of checkboxes. `PROJECTS.md` at its root is
GENERATED from those folders. That register is the source of truth — not this
conversation, not Claude's memory, not `git log`, which records what changed
and never what state the project is in.

A session that changes code here changes this project's state, and the state
reaches the register **through this repository: never touch `second-brain`**.
Do not attach it (`add_repo`), do not clone it, do not commit to it — locally
either, even though it sits beside this checkout. On every push to `main`,
`.github/workflows/registry.yml` reads the block below from the merged pull
request's description (or, when there is none, from the pushed commits'
messages) and sends it to `second-brain`, whose own workflow updates the fiche
and regenerates `PROJECTS.md`. Only what reaches `main` is reported.

Write the block in a cloud session in this repository's pull request
description, **inside an HTML comment** so the rendered pull request stays
clean and its French does not mix with an English description. The labels are
English, what follows them is French:

    <!-- Registry
    Project: generative-art-p5js
    Last point: <the project as it now stands, in French>
    - [x] <an existing box this work closes, copied from the fiche>
    - [ ] <a new open action, in French>
    Log: <one line for the fiche's log, in French>
    -->

In a local session, write the same lines at the end of the task's commit body,
after a line `Registry:`.

Every line but the first is optional. `Last point:` REPLACES the fiche's
paragraph: write what someone back after three months needs about the whole
project, not a changelog — the commit body already carries the detail. A
`- [x]` ticks a box only when its text matches one; copy it from the fiche
when you can read it (locally `../second-brain`, or through GitHub when the
session already has it — never attach it just to read it), otherwise leave the
ticking to the maintainer. A new box is one gesture, not a plan. The date is
the merge's, and `state:` is never written by a block: it is the
maintainer's call.

**Hidden is not private.** The API hands a pull request's description and a
commit's message to anyone who can read the repository. In a **public**
repository the block carries only what is already public: the `Project:` line,
ticked boxes (`- [x]`) and one `Log:` line — never a `Last point:`, never an
open box, nothing else. The `check` job of `registry.yml` checks every pull
request before it is merged: it fails on a malformed block, on a block left
visible under a heading, and, in a public repository, on any other line; and
the report strips such a line if it is merged anyway.

A change a returning reader does not need — tooling, a typo, a refactor —
carries no block. A question, an exploration or an explanation changes no
state and writes no block.

## Rule 4 — Versions and releases (MANDATORY)

The project carries **one version**, `version` in the root `package.json`, in
[Semantic Versioning](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH`.
`CHANGELOG.md` says what each release brings to the people who use the
project, newest first, in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
shape. **It is written in English, like the code, even when the project
speaks French.** Each release has a **codename**: a drawing tool, in alphabetical order (1.0.0 Airbrush; the next starts with B or later).

- **Every pull request that changes what users get** adds its lines under
  `## [Unreleased]` (`### Added`, `### Changed`, `### Fixed`, `### Removed`,
  `### Security`), written for a user, not a developer. Tooling, a refactor or
  a test adds nothing there. It does not touch the version.
- **A release is its own pull request**, made when the owner asks for one: it
  moves the `Unreleased` lines under `## [x.y.z] - YYYY-MM-DD — Codename` and
  sets `package.json` to the same version, nothing else. PATCH for fixes only;
  MINOR for anything new; MAJOR when something users relied on stops working
  (stored data that does not carry over, a link, a protocol, a removed
  feature). Before 1.0.0, MINOR covers both. A new MINOR or MAJOR takes a new
  codename, never reused; a PATCH keeps its minor's. When a milestone ends or
  `Unreleased` holds something worth announcing, say so in the final message:
  the owner decides when to release.
- **Never tag nor publish a release by hand.** On `main`,
  `.github/workflows/release.yml` gives every section that has none its tag
  `vX.Y.Z` and its GitHub Release; on every pull request its `check` job
  refuses a `CHANGELOG.md` that disagrees with `package.json` or breaks the
  shape. Run `node .github/release.mjs check` before pushing a release.
- **A backfilled release** — a version given after the fact to a past state —
  is a section placed at its rank in the file, with
  `<!-- commit: <full sha> -->` right under its heading; the workflow tags that
  commit. It never rewrites a section that already has its release. GitHub
  refuses the workflow's own token a tag on a commit whose workflows differ
  from `main`'s, so here a backfill is skipped with a warning and the rest
  still ships; `second-brain`'s "Backfill releases" workflow, which holds the
  owner's token, publishes it (`release.mjs backfill`).
- **A repo that serves a page shows its version** where a user can find it (a
  footer, an about line, a settings screen), read from `package.json` at build
  time, so a phone in hand says which build it runs.

Here the version shows at the foot of the gallery's page only, written into
the built `index.html` by `scripts/inject-version.js` after the build, like
the tracker: the sketch pages are the artwork and carry nothing. No release
was backfilled: the history is a stream of sketches with no milestone an
agent could name, so 1.0.0 is the gallery as it stands.

## Verification — trust the disk, not the context

- A tool answering "success" is not proof. Before saying a change is done, prove it through the repo: `git status --porcelain`, `git diff`, `grep` for the expected value, `git show HEAD:<file>` compared to the file on disk.
- What you hold in context (an earlier `Read`, an old `ls`, a summarised conversation) can be **stale**. Signature: `git status` clean right after an announced change. Re-read from disk before concluding.
- Never state an absence ("this feature is missing", "that file does not exist") without a `git`/`grep` check made in the current turn.

## Other rules

- Never rewrite history (`rebase -i`, `commit --amend`, `reset --hard`, `push --force`, `filter-repo`) without an explicit request. Do not modify `.git/config`, the hooks or branch settings.
- **Never add a sketch's media to git without saying its size** in the commit body. The repository already carries 1.5 GB of screenshots, images and clips (no LFS), and every clone, every CI run and every deploy pays all of it. A new sketch's `screenshot.jpeg` (50–100 kB) is expected; a clip or a set of photographs is a decision, named with its weight.
- **`scripts/build-previews.js` runs only on a Mac with Google Chrome installed**: it drives the installed Chrome (hard-coded `/Applications/…` path, `headless: false`) against a static server at `127.0.0.1:3000` serving the repository root, and writes the missing `screenshot.jpeg` of each sketch listed in `tree.json`. Never in CI, never in a cloud session: the owner takes the previews and commits them.
- **`tree.json` is generated on the owner's machine only.** `npm run build:tree` stamps each group and each sketch with its folder's modification date, and the gallery orders its groups by those dates; a fresh clone dates everything at the checkout, so regenerating it anywhere else reorders the whole gallery. A sketch added from a cloud session is listed by the owner's next `npm run build:tree`; never hand-edit the dates.
- **One template for every sketch.** A new sketch folder gets the four symlinks of its siblings (`ln -s ../../../assets/html/index.html index.html`, and `assets`, `libraries`, `utils` the same way), never a copy of the template. The template reads the sketch's name from its path, points the OpenGraph image at `screenshot.jpeg` and hides the UI under `?preview`. A sketch whose folder name starts with `_` is left out of `tree.json`.
- **Libraries are vendored** in `libraries/` and loaded by the sketches as files; a new one is committed with its version named in the commit body, never fetched from a CDN at runtime.
- **The linter covers `scripts/` and `package.json` only** (`biome.jsonc`): the sketches and `utils/` are the owner's art, and Biome's recommended rules counted 13 501 errors in the one and 12 in the other on 2026-10-19. A new script goes in `scripts/` and is linted; widening the scope to the art is the owner's word, never a session's.
- **The icon set has one home, `scripts/build-icons.mjs`** (C11): the drawing (a light spiral on the gallery's dark ground), the three SVG sources it writes into `site/` and every PNG and the `.ico` it rasterises there are committed, because GitHub Pages rasterises nothing. A redrawn icon is `npm i --no-save sharp && npm run icons` — then `npm install --prefix ./node_modules/sketch-gallery` again, since the install pruned it — and the files committed together; never a PNG edited or added by hand. `sharp` is never a dependency.
- **The Umami website id in `scripts/inject-umami.js` is public by design** (it ends up in every page); `UMAMI_WEBSITE_ID=` empty switches measurement off. The README documents the three settings; keep it in step with the script.
- **The legal notice says what the code does** (`site/legal/index.html`, served at `/legal/`, linked from the gallery's footer): the publisher, the host, what the tracker sends, the keys kept in the browser. Change what is measured, sent or stored and change the notice in the same commit; `tests/legal.test.js` holds it to `scripts/inject-umami.js` and to every `localStorage` key the code writes. It is English, like the gallery.

## Related files

- `AGENTS.md`: a symlink to this file, for tools that do not read `CLAUDE.md`.
- `MEMORY.md` + `docs/memory/`: project long-term memory (rule 2).
- `README.md`: the layout of the sketches, the build and the deploy, the measurement settings, for people.
- `CHANGELOG.md`: what each release brings (rule 4); `.github/release.mjs` + `.github/workflows/release.yml` tag and publish it.
