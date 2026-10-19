# The gallery, its build and its deploy

Read before touching `package.json`'s scripts, `scripts/`, `tree.json`, `tree-meta.json`, `.github/workflows/`, or anything about how the site is built, measured and published.

## The gallery page is an external package (2026-10-19, read off the repository)

- `sketch-gallery` (`github:CostardRouge/sketch-gallery#0.0.15`, the owner's own package, archived on GitHub) is a React 18 + Vite 4 single page: it fetches `tree.json`, sorts the groups by `meta._mtime` (newest first, the date shown on the group's heading), draws a tile per sketch from `<path>/screenshot.jpeg` linking to the sketch and to its source on GitHub, and a fixed bar of social links at the bottom. Its `bin` (`src/cli.js`) runs `vite build` in its own folder, then `cp -r` of the sources named on the command line (`tree.json assets libraries utils sketches`) into its `dist`. **How to apply**: the page's chrome, texts, title, social links, font (loaded from Google) and layout cannot be changed from this repository — a change there is a new tag of `sketch-gallery` and a bump of the dependency, or a decision to vendor the page here. The package ships no lockfile, hence the second install step (`npm install --prefix ./node_modules/sketch-gallery`) the workflow runs; `tree-meta.json` (title, links) is not read by 0.0.15 — the title and the links are hard-coded in the package — and is kept for a later version.
- The build takes `baseUrl` `/` (`sketch-gallery build / …`): the page's asset paths are absolute (`/assets/index-*.js`), so the site works only at a domain's root — `art.steeve.website`, never at `costardrouge.github.io/generative-art-p5js/`, which answers 301 to the domain. Measured 2026-10-19: the `gh-pages` branch holds `CNAME` (`art.steeve.website`), the deploy action keeps it across deploys, and the custom domain lives in the repository's Pages settings, nowhere in the sources.
- `npm run gallery:deploy` is the package's own `gh-pages` publish from a developer machine; the workflow deploys with `JamesIves/github-pages-deploy-action` instead. Never run the script by hand: two writers on `gh-pages` would race.
- The built folder weighs what the sources weigh (1.5 GB, the `cp -r`): a build is about 85 s in a cloud container, almost all of it the copy. A deploy pays a 1.5 GB checkout and a 1.5 GB push of the branch.

## `tree.json` and its dates (2026-10-19)

- `scripts/build-tree.js` walks `sketches/` for `index.js` files and writes, per group and per sketch, `meta.name`, `meta._mtime` (the folder's, then the file's `mtime`) and `path`; a sketch whose folder name starts with `_` is skipped and listed on the console. **Trap**: a fresh clone (CI, a cloud session) dates every folder at the checkout — regenerating there rewrote 1 016 lines on 2026-10-19 and would reorder the whole gallery, since the page sorts by those dates. The file is regenerated on the owner's Mac only, where the folders keep their real dates; a session never regenerates it and never commits a regenerated copy.
- Measured 2026-10-19: the committed `tree.json` lacks `censored-v15-sydney` (the sketch was added without a regeneration), so the gallery does not show it — the owner's `npm run build:tree`, nothing else, fixes it (open item in `MEMORY.md`).

## Audience measurement (2026-10-18, PR #3)

- Umami replaced Google Analytics on 2026-10-18. The tag is in no source: `scripts/inject-umami.js` writes it before `</head>` of every HTML page of the built folder, after the build and before the deploy — the sketch pages are copied as they are, so the built folder is the one place where every page can be reached. Idempotent (a `data-umami="audience"` marker), a page without a `<head>` is left alone.
- Settings: `UMAMI_WEBSITE_ID` (default the gallery's id in the script, public by design since it ends up in every page; **empty = no tag, nothing sent**), `UMAMI_SRC` (default `https://insight.steevepommier.com/insight` — the tracker is served under `/insight`, not `/script.js`, because filter lists block the latter), `UMAMI_DOMAINS` (default `art.steeve.website,costardrouge.github.io`; a host outside it — localhost, a fork — loads the tracker but never counts). The tag asks for Do Not Track, no query string, no fragment. The README documents the three; keep both in step.

## Hygiene (2026-10-19)

- `.idea/` and `.vscode/settings.json` were tracked until 2026-10-19 (the settings file held one machine's absolute path to a sketch folder that no longer exists); untracked, kept on disk, and `.gitignore` now covers `.idea/`, `.vscode/` and `.env*` (COMMON-PROJECT-SPEC C16). Nothing tracked ever held a secret (checked 2026-10-19: no env, key or credential file in `git ls-files`).
