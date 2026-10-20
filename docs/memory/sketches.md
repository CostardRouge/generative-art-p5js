# The sketches: layout, template, previews, media

Read before touching `sketches/`, `assets/html/index.html`, `utils/`, `libraries/`, `assets/` or `scripts/build-previews.js`.

## Layout (2026-10-19, read off the repository)

- 46 groups, 462 sketch folders (`sketches/<group>/<name>/`). 460 reach the one template through a symlink (`index.html` → `../../../assets/html/index.html`) and carry three more (`assets`, `libraries`, `utils` → the root folders), which is how the template's relative paths (`libraries/CCapture.all.min.js`, `assets/stylesheets/common.css`) resolve from inside a sketch. Two sketches, `sketches/tests/grid-36daysoftype-10` and `sketches/tests/grid-2023`, carry a regular `index.html` of their own: left as they are, each is its own page. Nine folders start with `_` (`demo-festival-2025/_classic-worm`, `_gridy`, `_shell`, `_zoom`, `motion-capture/_motion-capture-with-*` ×3, `rainbow-flame/_rainbow-flowers`, `_rainbow-flowers-blur`): `build-tree.js` skips them, so they are reachable by address but absent from the gallery. One folder name holds a non-ASCII character (`36days-of-type-2023-∞`), which git quotes in its listings; nothing else is special about it.
- A sketch is an `index.js` loaded as an ES module (`<script defer type="module">` in the template), over the owner's runtime in `utils/` (`index.js` re-exports `engine/` for p5 and three, `sketch.js`, `easing.js`, `colors.js`, `animation.js`, `grid.js`, `recorder.js`, `midi.js`, `audio.js`, `options.js`…) and the vendored `libraries/` (p5 and p5.sound, three and OrbitControls, simplex-noise, webmidi, js-combinatorics, CCapture with its gif worker, and `sketch-ui.es.js`, the owner's own control drawer, imported by `utils/options.js` into `#sketch-ui-drawer`). The fonts under `assets/fonts/` are loaded by the sketches that use them.
- The template is one file served 460 times. At load it sets the document title from the last path segment, fills `og:title`, `og:image` and `twitter:image` with the sketch's name and `<host><path>screenshot.jpeg` (a crawler that runs no script sees the static `./screenshot.jpeg`), rewrites the stylesheet link, loads CCapture, and adds `class="preview"` to the body when the address carries `?preview` — what the previews script asks for, hiding the UI. It disables pinch zoom (`maximum-scale=1.0, user-scalable=no`): an accessibility trap, kept as is because the canvas handles the touch gestures itself; changing it changes every sketch at once.
- Media live in git: 487 jpeg, 242 webp, 122 png, 45 mp4 under `sketches/` — 1.5 GB in the working tree, no LFS. A sketch's own media (a photograph it reads, a clip) sits in its folder beside `index.js`; the weight rule is in `CLAUDE.md` (Other rules).

## Previews (2026-10-19)

- `scripts/build-previews.js` (`npm run build:previews`, preceded by `build:tree` through `prebuild:previews`) opens, with `puppeteer-core` driving the Mac's installed Google Chrome (hard-coded `/Applications/Google Chrome.app/…` path, `headless: false`, so a window shows), `http://127.0.0.1:3000/<path>/?preview&size=512x512` for every sketch of `tree.json` that has no `screenshot.jpeg` yet, waits for `.p5Canvas` plus a timeout (fifth argument, default 1 000 ms), and writes a 512×512 JPEG into the sketch's folder. It expects a static server at `:3000` serving the repository root — not in the repository; any static server does. The commented `chrome-aws-lambda` lines are an unfinished headless alternative, left as the owner's notes. **How to apply**: never run it in CI or a cloud session; a sketch without a screenshot shows an empty tile until the owner runs it and commits the file.
- A screenshot doubles as the sketch page's OpenGraph image (the template points there), so a missing one also means a bare link preview.

## Out of the linter on purpose (2026-10-19)

- Biome's recommended rules reported 13 501 errors and 12 943 warnings in `sketches/`, and 12 errors and 72 warnings in `utils/` (the errors: `noAssignInExpressions` ×7, `noUnreachable` ×4, `noDuplicateObjectKeys` ×1 — real smells in the runtime, reported here and not fixed, since a change to the art is the owner's). `biome.jsonc` lints `scripts/` and `package.json` only; the reasoning is in `gallery-and-deploy.md`.

## Looking at a sketch from a cloud session (2026-10-19)

- There is no dev server in the repository: serve the root with any static server and open `sketches/<group>/<name>/`; `?preview` hides the drawer. A Playwright Chromium is in the cloud container (`/opt/pw-browsers`) for a headless look; it is not a dependency of the project.
