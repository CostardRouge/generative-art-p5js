// The scripts that write into the built gallery after the build: the
// tracker (inject-umami.js), the icon set (inject-icons.js), the version
// footer (inject-version.js), the page walker they share (html-files.js)
// and the copy of site/ (copy-site.js), each on a small fake build.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readFileSync, existsSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { execFileSync } = require("node:child_process");
const umami = require("../scripts/inject-umami.js");
const icons = require("../scripts/inject-icons.js");
const version = require("../scripts/inject-version.js");
const { htmlFiles } = require("../scripts/html-files.js");

const ROOT = resolve(__dirname, "..");
const PAGE = '<html><head>\n<title>x</title>\n<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text>🌀</text></svg>">\n<link rel="stylesheet" href="a.css">\n</head><body><div id="root"></div></body></html>';

function fakeBuild() {
  const dir = mkdtempSync(join(tmpdir(), "gallery-"));
  writeFileSync(join(dir, "index.html"), PAGE);
  mkdirSync(join(dir, "assets", "html"), { recursive: true });
  writeFileSync(join(dir, "assets", "html", "index.html"), PAGE);
  const sketch = join(dir, "sketches", "group", "one");
  mkdirSync(sketch, { recursive: true });
  symlinkSync("../../../assets/html/index.html", join(sketch, "index.html"));
  symlinkSync("../../../assets", join(sketch, "assets"));
  return dir;
}

const run = (script, dir, env = {}) =>
  execFileSync(process.execPath, [join(ROOT, "scripts", script), dir], { env: { ...process.env, ...env }, encoding: "utf8", stdio: "pipe" });

test("htmlFiles yields symlinked pages but never follows a symlinked folder", () => {
  const dir = fakeBuild();
  const found = [...htmlFiles(dir)].map((f) => f.slice(dir.length + 1)).sort();
  assert.deepEqual(found, ["assets/html/index.html", "index.html", "sketches/group/one/index.html"]);
  rmSync(dir, { recursive: true });
});

test("umami: settings read the defaults, honour overrides and the kill switch", () => {
  assert.deepEqual(umami.settings({}), {
    src: umami.DEFAULT_SRC,
    website: "66bbc932-2bef-4b32-ba37-d07163f3d639",
    domains: umami.DEFAULT_DOMAINS,
  });
  assert.equal(umami.settings({ UMAMI_WEBSITE_ID: "  " }), null);
  assert.equal(umami.settings({ UMAMI_SRC: "javascript:alert(1)" }).src, umami.DEFAULT_SRC);
  assert.equal(umami.settings({ UMAMI_DOMAINS: " A.example , ,b.example" }).domains, "a.example,b.example");
});

test("umami: the tag escapes its values and goes in once, before </head>", () => {
  const tag = umami.trackerTag({ src: "https://x/insight", website: 'a"b', domains: "d" });
  assert.match(tag, /data-website-id="a&quot;b"/);
  const once = umami.inject(PAGE, tag);
  assert.ok(once.indexOf(tag) < once.indexOf("</head>"));
  assert.equal(umami.inject(once, tag), null);
  assert.equal(umami.inject("<p>no head</p>", tag), null);
});

test("umami: the script writes every page once, and nothing when switched off", () => {
  const dir = fakeBuild();
  assert.match(run("inject-umami.js", dir, { UMAMI_WEBSITE_ID: "" }), /no page gets the tracker/);
  assert.doesNotMatch(readFileSync(join(dir, "index.html"), "utf8"), /data-umami/);
  run("inject-umami.js", dir, { UMAMI_WEBSITE_ID: "id" });
  run("inject-umami.js", dir, { UMAMI_WEBSITE_ID: "id" });
  for (const page of ["index.html", "sketches/group/one/index.html"]) {
    assert.equal(readFileSync(join(dir, page), "utf8").split("data-umami=").length, 2, page);
  }
  rmSync(dir, { recursive: true });
});

test("icons: the emoji link goes, the set comes, once", () => {
  const out = icons.inject(PAGE);
  assert.doesNotMatch(out, /🌀|data:image/);
  assert.match(out, /<link rel="stylesheet" href="a.css">/, "other links stay");
  for (const tag of icons.iconTags().split("\n")) assert.ok(out.includes(tag), tag);
  assert.ok(out.indexOf(icons.MARKER) < out.indexOf("</head>"));
  assert.equal(icons.inject(out), null);
  assert.equal(icons.inject("<p>no head</p>"), null);
});

test("icons: every file the tags name is in site/", () => {
  for (const [, href] of icons.iconTags().matchAll(/href="\/([^"]+)"/g)) {
    assert.ok(existsSync(join(ROOT, "site", href)), href);
  }
});

test("version: the footer escapes the version and links the releases and the notice", () => {
  const html = version.footer('1.0.0"<');
  assert.match(html, /data-version="1\.0\.0&quot;&lt;"/);
  assert.match(html, /\/releases"/);
  assert.match(html, /href="\/legal\/"/);
  const once = version.inject(PAGE, "1.2.3");
  assert.ok(once.indexOf("v1.2.3") < once.indexOf("</body>"));
  assert.equal(version.inject(once, "1.2.3"), null);
});

test("copy-site: site/ lands at the built root, and an unbuilt folder is refused", () => {
  const dir = fakeBuild();
  run("copy-site.js", dir);
  for (const file of ["manifest.webmanifest", "apple-touch-icon.png", "legal/index.html"]) {
    assert.ok(existsSync(join(dir, file)), file);
  }
  const empty = mkdtempSync(join(tmpdir(), "empty-"));
  assert.throws(() => run("copy-site.js", empty));
  rmSync(dir, { recursive: true });
  rmSync(empty, { recursive: true });
});
