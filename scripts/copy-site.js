// The gallery's own site files, copied to the root of the built gallery after
// the build: everything under site/ — the icon set and its sources, the web
// manifest (COMMON-PROJECT-SPEC C11) and the pages that are this repository's
// rather than the sketch-gallery package's — lands at the same path under the
// built folder (site/icon.svg → /icon.svg, site/legal/index.html → /legal/).
//
//   node scripts/copy-site.js <dist folder>
//
// Runs right after `npm run gallery:build` and before the injections, so the
// pages it copies get the tracker, the icons and the rest like every other
// page. A file already in the built folder under the same path is replaced:
// site/ wins, and the gallery package ships nothing at those paths.

const { cpSync, existsSync } = require("node:fs");
const { join, resolve } = require("node:path");

const SITE = resolve(__dirname, "..", "site");

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: node scripts/copy-site.js <dist folder>");
    process.exit(1);
  }
  if (!existsSync(join(dir, "index.html"))) {
    console.error(`copy-site: ${dir} holds no built gallery (run npm run gallery:build first).`);
    process.exit(1);
  }
  cpSync(SITE, dir, { recursive: true });
  console.log(`copy-site: ${SITE} copied into ${dir}.`);
}

if (require.main === module) main();

module.exports = { SITE };
