# generative-art-p5js

The sketches of before the studio (`p5-templates`), published as a gallery on
GitHub Pages: https://costardrouge.github.io/generative-art-p5js/

Every sketch is a folder under `sketches/<group>/<name>/` with an `index.js`
and an `index.html` that is a symlink to the one template,
`assets/html/index.html`. `npm run build:tree` lists them into `tree.json`;
`.github/workflows/deploy-github-pages.yaml` builds the gallery with the
`sketch-gallery` package on every push to `main` and publishes it.

## Site files and icons

`site/` holds what the gallery serves beside the sketch-gallery package's
page: the icon set and the web manifest. After the build,
`scripts/copy-site.js` copies it to the root of the built folder
(`npm run site:copy`) and `scripts/inject-icons.js` writes the icon links,
the manifest and the theme colour into every built page's head, in place of
the 🌀 emoji the pages carried (`npm run icons:inject`); the template in
`assets/html/` is not touched. The drawing — a light spiral on the gallery's
dark ground — lives in `scripts/build-icons.mjs`, which writes the three SVG
sources and rasterises the PNGs and `favicon.ico` into `site/`; it runs by
hand and its output is committed:

    npm i --no-save sharp && npm run icons
    npm install --prefix ./node_modules/sketch-gallery   # the install pruned it

The manifest says `display: browser`: an installed gallery opens in a normal
browser window, so a sketch keeps its back button.

## Audience measurement

Visits are counted with [Umami](https://umami.is), self-hosted by the author
(`insight.steevepommier.com`, the same instance as his other sites): no cookie,
no cross-site identifier. The tracker tag is not in the sources: after the
gallery is built, `scripts/inject-umami.js` writes it into every page of the
built folder (`npm run umami:inject`), asking the tracker to honour Do Not
Track and to drop the query and the fragment of an address.

- The site's id in the Umami dashboard is in the script (`DEFAULT_WEBSITE_ID`);
  `UMAMI_WEBSITE_ID` overrides it, and **empty, no page gets the tag** and
  nothing is sent (`UMAMI_WEBSITE_ID= npm run umami:inject`).
- `UMAMI_SRC` (the tracker's address) and `UMAMI_DOMAINS` (hosts allowed to
  report, comma-separated: `art.steeve.website` and the GitHub Pages host by
  default) override the other defaults; a host not listed
  (localhost, a fork) loads the tracker but never counts.

## Versions

The gallery carries one version, `version` in `package.json`, shown at the
foot of its page: `scripts/inject-version.js` writes it into the built page
after the build, like the tracker (`npm run version:inject`); the sketch
pages carry nothing. `CHANGELOG.md` says what each release brought;
`.github/workflows/release.yml` tags and publishes each section once it
reaches `main`, and `node .github/release.mjs check` holds the file to the
version before a pull request is merged.

## Licence

MIT (`LICENSE`): the sketches, their runtime in `utils/` and the scripts are
Steeve Pommier's own work. The libraries vendored in `libraries/` (p5.js,
three.js, simplex-noise, webmidi, CCapture…) keep their authors' licences.

## Development

Node 24 (`.nvmrc`; 22 is the floor), npm with `package-lock.json`. `npm ci`,
then `npm install --prefix ./node_modules/sketch-gallery` (the gallery
package ships no lockfile), `npm run gallery:build`, `npm run site:copy`, `npm run umami:inject`,
`npm run icons:inject`, `npm run version:inject`: the built site is in `node_modules/sketch-gallery/dist`
— an `npm ci` deletes it. `npm run lint` runs Biome over `scripts/` (the
sketches and `utils/` are left as they were made, `biome.jsonc` says why).
`.github/workflows/ci.yml` runs the lint and that build on every pull request
and every push to `main`; Dependabot raises the dev dependencies and the
workflows' actions weekly.
