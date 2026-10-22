// llms.txt (scripts/build-llms.js) on a small tree, and the committed
// tree.json against the disk it indexes.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { llmsTxt, groups, origin, encodePath, DEFAULT_ORIGIN } = require("../scripts/build-llms.js");

const ROOT = resolve(__dirname, "..");
const sketch = (group, name) => ({ meta: { name }, path: `sketches/${group}/${name}` });
const TREE = {
  old: { meta: { name: "old", _mtime: "2023-01-01T00:00:00Z" }, sketches: { a: sketch("old", "a") } },
  new: {
    meta: { name: "new", _mtime: "2025-01-01T00:00:00Z" },
    sketches: { b: sketch("new", "b"), "c-∞": sketch("new", "c-∞") },
  },
  empty: { meta: { name: "empty", _mtime: "2026-01-01T00:00:00Z" }, sketches: {} },
};

test("groups come newest first, empty ones left out", () => {
  assert.deepEqual(
    groups(TREE).map((g) => g.meta.name),
    ["new", "old"],
  );
});

test("the file follows llmstxt.org's shape and lists every sketch", () => {
  const text = llmsTxt(TREE, "https://example.org");
  const lines = text.split("\n");
  assert.match(lines[0], /^# \S/);
  assert.match(lines[2], /^> \S/);
  assert.match(text, /lists 3 sketches in 2 groups/);
  assert.match(text, /^## new \(2 sketches\)$/m);
  assert.match(text, /^## old \(1 sketch\)$/m);
  assert.ok(text.indexOf("## new") < text.indexOf("## old"));
  assert.match(text, /^- \[b\]\(https:\/\/example\.org\/sketches\/new\/b\/\): .*blob\/main\/sketches\/new\/b\/index\.js$/m);
  assert.match(text, /\(https:\/\/example\.org\/sketches\/new\/c-%E2%88%9E\/\)/);
  assert.match(text, /\(https:\/\/example\.org\/legal\/\)/);
  for (const line of lines.filter((l) => l.startsWith("- "))) {
    assert.match(line, /^- \[[^\]]+\]\(https?:\/\/[^)\s]+\): \S/, line);
  }
  assert.ok(text.endsWith("\n"));
});

test("the origin defaults, and refuses what is not http(s)", () => {
  assert.equal(origin({}), DEFAULT_ORIGIN);
  assert.equal(origin({ SITE_URL: "https://example.org/sub/" }), "https://example.org");
  assert.equal(origin({ SITE_URL: "ftp://example.org" }), DEFAULT_ORIGIN);
  assert.equal(origin({ SITE_URL: "not a url" }), DEFAULT_ORIGIN);
  assert.equal(encodePath("a b/c"), "a%20b/c");
});

test("every sketch tree.json lists is on disk (a missing one is a tile on a 404)", () => {
  const tree = require("../tree.json");
  for (const group of Object.values(tree)) {
    for (const { path } of Object.values(group.sketches)) {
      assert.ok(existsSync(join(ROOT, path, "index.js")), path);
    }
  }
});
