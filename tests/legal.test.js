// The legal notice (site/legal/index.html) held to the code it describes
// (COMMON-PROJECT-SPEC C17): the tracker's host, domains and settings as
// scripts/inject-umami.js writes them, the keys the site keeps in the
// browser, and the absence of any event sent. A change to what is measured
// or stored fails here until the notice says the same.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, readdirSync } = require("node:fs");
const { join } = require("node:path");
const { DEFAULT_SRC, DEFAULT_DOMAINS, settings, trackerTag } = require("../scripts/inject-umami.js");
const { footer } = require("../scripts/inject-version.js");

const ROOT = join(__dirname, "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const page = read("site/legal/index.html");
// The visible text, the switch's own script and the comments left out.
const text = page
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");
const switchScript = page.match(/<script>([\s\S]*?)<\/script>/)[1];
const domains = DEFAULT_DOMAINS.split(",");

// Our own code and the art, never the vendored libraries but the sketches'
// control drawer, which is the owner's own (sketch-ui).
function* sources(dir) {
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sources(path);
    else if (/\.(js|mjs|html)$/.test(entry.name)) yield path;
  }
}
const ownCode = [
  ...sources("scripts"),
  ...sources("site"),
  ...sources("utils"),
  ...sources("sketches"),
  "assets/html/index.html",
  "libraries/sketch-ui.es.js",
];

test("names the publisher and the host", () => {
  assert.match(text, /Steeve Pommier/);
  assert.match(text, /GitHub Pages/);
  assert.match(text, /art\.steeve\.website/);
});

test("names the tracker's host and the domains that count", () => {
  assert.ok(text.includes(new URL(DEFAULT_SRC).host), "the tracker's host");
  for (const domain of domains) assert.ok(text.includes(domain), domain);
  const listed = switchScript.match(/const DOMAINS = \[([^\]]*)\]/)[1].match(/"([^"]+)"/g).map((d) => d.slice(1, -1));
  assert.deepEqual(listed, domains, "the switch checks the hosts the tag lists");
});

test("says what the tag asks of the tracker", () => {
  const tag = trackerTag(settings({}));
  assert.match(tag, /data-do-not-track="true"/);
  assert.match(text, /Do Not Track/);
  assert.match(tag, /data-exclude-search="true"/);
  assert.match(tag, /data-exclude-hash="true"/);
  assert.match(text, /without query string or fragment/);
  assert.match(text, /No cookie is set/);
});

test("the switch uses the tracker's own opt-out key, and the notice names it", () => {
  assert.match(switchScript, /const KEY = "umami\.disabled"/);
  assert.ok(text.includes("umami.disabled"));
});

test("every key kept in the browser is named", () => {
  const keys = new Set();
  for (const file of ownCode) {
    const code = read(file);
    for (const m of code.matchAll(/localStorage\.setItem\(\s*["']([^"']+)["']/g)) keys.add(m[1]);
    for (const m of code.matchAll(/useLocalStorage\(\{\s*key:\s*["']([^"']+)["']/g)) keys.add(m[1]);
    for (const m of code.matchAll(/const KEY = "([^"]+)"/g)) keys.add(m[1]);
  }
  assert.ok(keys.has("sketch-ui-settings"), "the control drawer's key is still found");
  for (const key of keys) assert.ok(text.includes(key), `the notice names ${key}`);
});

test("no event is sent, as the notice says", () => {
  assert.match(text, /No event is sent/);
  for (const file of ownCode) {
    const code = read(file);
    assert.doesNotMatch(code, /umami\.track\s*\(|data-umami-event/, file);
  }
  assert.doesNotMatch(trackerTag(settings({})), /data-auto-track="false"/);
});

test("the gallery's footer links to the notice", () => {
  assert.match(footer("1.2.3"), /href="\/legal\/"[^>]*>Legal notice</);
});
