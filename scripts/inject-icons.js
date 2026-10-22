// The icon set and the web manifest in every built page's head
// (COMMON-PROJECT-SPEC C11), after the build like the tracker
// (inject-umami.js): the gallery's page comes from the sketch-gallery package
// and the sketch pages from the one template, both with an inline 🌀 emoji as
// their only icon — which iOS ignores, screenshotting the page for a
// home-screen icon instead. The files themselves are site/'s, copied to the
// built root by copy-site.js; scripts/build-icons.mjs draws them.
//
//   node scripts/inject-icons.js <dist folder>
//
// /favicon.ico is not linked: a browser asks for it at the root by itself,
// and the SVG and the two PNGs cover the rest. In each page, every <link rel="icon"> (the emoji) is removed and the set
// written before </head>. The paths are absolute: the pages sit at every depth
// and the site works only at a domain's root anyway (base `/`). Idempotent: a
// page already carrying the marker is left alone. Only the built copies
// change; the template in assets/html/ is never touched.

const { readFileSync, writeFileSync } = require("node:fs");
const { htmlFiles } = require("./html-files.js");

const MARKER = "data-icons";
const THEME = "#1e1d1d";
const SHORT_NAME = "Sketches";

function iconTags() {
  return [
    `<link rel="icon" href="/icon.svg" type="image/svg+xml" ${MARKER}>`,
    '<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">',
    '<link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/manifest.webmanifest">',
    `<meta name="theme-color" content="${THEME}">`,
    `<meta name="apple-mobile-web-app-title" content="${SHORT_NAME}">`,
  ].join("\n");
}

// Removes the page's own icon links (any <link> whose rel lists "icon",
// "shortcut icon" included) and writes the set before </head>; a page without
// a head, or already carrying the set, is left alone.
function inject(html) {
  if (html.includes(MARKER)) return null;
  if (html.search(/<\/head\s*>/i) < 0) return null;
  // Quoted values are matched whole: the emoji's data: URL holds a ">".
  const cleaned = html.replace(/[ \t]*<link\b(?:[^>"']|"[^"]*"|'[^']*')*>[ \t]*\r?\n?/gi, (tag) =>
    /\brel\s*=\s*["']?(?:shortcut\s+)?icon["'\s>]/i.test(tag) ? "" : tag,
  );
  const at = cleaned.search(/<\/head\s*>/i);
  return `${cleaned.slice(0, at)}${iconTags()}\n${cleaned.slice(at)}`;
}

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: node scripts/inject-icons.js <dist folder>");
    process.exit(1);
  }
  let written = 0;
  let skipped = 0;
  for (const file of htmlFiles(dir)) {
    const next = inject(readFileSync(file, "utf8"));
    if (next === null) skipped += 1;
    else {
      writeFileSync(file, next);
      written += 1;
    }
  }
  console.log(`inject-icons: icon set written into ${written} page(s), ${skipped} left alone.`);
}

if (require.main === module) main();

module.exports = { inject, iconTags, MARKER };
