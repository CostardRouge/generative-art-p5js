# generative-art-p5js

The sketches of before the studio (`p5-templates`), published as a gallery on
GitHub Pages: https://costardrouge.github.io/generative-art-p5js/

Every sketch is a folder under `sketches/<group>/<name>/` with an `index.js`
and an `index.html` that is a symlink to the one template,
`assets/html/index.html`. `npm run build:tree` lists them into `tree.json`;
`.github/workflows/deploy-github-pages.yaml` builds the gallery with the
`sketch-gallery` package on every push to `main` and publishes it.

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
