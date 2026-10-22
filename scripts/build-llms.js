// The gallery's llms.txt (COMMON-PROJECT-SPEC C17, https://llmstxt.org):
// generated after the build from tree.json — the same index the gallery's
// page draws its groups and tiles from — so it lists exactly what the gallery
// shows, and written to the root of the built folder. Nothing links to it;
// crawlers look for /llms.txt by themselves.
//
//   node scripts/build-llms.js <dist folder>
//
//   SITE_URL  the site's origin (default https://art.steeve.website); the
//             gallery is built with base `/`, so it lives at a domain's root
//
// The groups come in the gallery's own order (newest first, by the dates
// tree.json carries), the sketches in tree.json's order, each with its live
// page and its source file, as the gallery's tiles link them.

const { readFileSync, writeFileSync } = require("node:fs");
const { join, resolve } = require("node:path");

const DEFAULT_ORIGIN = "https://art.steeve.website";
const REPOSITORY = "https://github.com/CostardRouge/generative-art-p5js";

function origin(env) {
  try {
    const url = new URL((env.SITE_URL || "").trim() || DEFAULT_ORIGIN);
    if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
  } catch {
    // an unusable address keeps the default origin
  }
  return DEFAULT_ORIGIN;
}

// A path of tree.json as a URL path: each segment encoded (one group's name
// holds "∞"), never the slashes.
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

// The groups as the gallery orders them: newest `meta._mtime` first, a
// missing date last, then by name so the output never depends on the
// engine's sort.
function groups(tree) {
  const time = (group) => Date.parse(group?.meta?._mtime) || 0;
  return Object.values(tree)
    .filter((group) => group?.sketches && Object.keys(group.sketches).length)
    .sort((a, b) => time(b) - time(a) || a.meta.name.localeCompare(b.meta.name));
}

function llmsTxt(tree, site = DEFAULT_ORIGIN) {
  const list = groups(tree);
  const count = list.reduce((sum, group) => sum + Object.keys(group.sketches).length, 0);
  const lines = [
    "# My sketches using p5js — CostardRouge",
    "",
    "> Steeve Pommier's generative-art sketches written with p5.js between 2021 and 2025, published as a gallery where each sketch runs live in the browser.",
    "",
    `The gallery lists ${count} sketches in ${list.length} groups, newest groups first. Each sketch page runs its code full screen in the browser — some react to sound, a camera or a MIDI instrument — and its source code is on GitHub under the MIT licence.`,
    "",
    "## The site",
    "",
    `- [Gallery](${site}/): every group and sketch, a tile per sketch`,
    `- [Source code](${REPOSITORY}): the sketches, their runtime in utils/ and the gallery's build`,
    `- [Legal notice](${site}/legal/): publisher, host, what is measured and kept`,
  ];
  for (const group of list) {
    const sketches = Object.values(group.sketches);
    lines.push("", `## ${group.meta.name} (${sketches.length} ${sketches.length === 1 ? "sketch" : "sketches"})`, "");
    for (const { meta, path } of sketches) {
      const url = `${site}/${encodePath(path)}/`;
      const source = `${REPOSITORY}/blob/main/${encodePath(path)}/index.js`;
      lines.push(`- [${meta.name}](${url}): the sketch running live; source: ${source}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: node scripts/build-llms.js <dist folder>");
    process.exit(1);
  }
  const tree = JSON.parse(readFileSync(resolve(__dirname, "../tree.json"), "utf8"));
  const text = llmsTxt(tree, origin(process.env));
  writeFileSync(join(dir, "llms.txt"), text);
  console.log(`build-llms: ${join(dir, "llms.txt")} written, ${text.split("\n").length} lines.`);
}

if (require.main === module) main();

module.exports = { llmsTxt, groups, origin, encodePath, DEFAULT_ORIGIN };
