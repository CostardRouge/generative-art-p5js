// The icon set in site/ (COMMON-PROJECT-SPEC C11), the one check that fails
// silently elsewhere: every PNG at the size its name claims, the iOS touch
// icon without alpha (iOS composites a transparent pixel onto black), the
// .ico's images, the manifest's icons, and the SVG sources as
// scripts/build-icons.mjs draws them.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { join, resolve } = require("node:path");

const SITE = resolve(__dirname, "..", "site");

// Width, height and colour type from a PNG's IHDR chunk.
function png(file) {
  const bytes = readFileSync(join(SITE, file));
  assert.equal(bytes.subarray(1, 4).toString("latin1"), "PNG", file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), colourType: bytes[25] };
}

test("every PNG has the size it is built at; only the touch icon is opaque", async () => {
  const { RASTERS } = await import("../scripts/build-icons.mjs");
  for (const { out, size, opaque } of RASTERS) {
    const { width, height, colourType } = png(out);
    assert.deepEqual([width, height], [size, size], out);
    // Colour type 2 is RGB, 6 is RGBA.
    assert.equal(colourType, opaque ? 2 : 6, out);
  }
  assert.ok(RASTERS.some((r) => r.out === "apple-touch-icon.png" && r.size === 180 && r.opaque));
});

test("favicon.ico holds 16, 32 and 48 px PNGs", () => {
  const ico = readFileSync(join(SITE, "favicon.ico"));
  assert.equal(ico.readUInt16LE(2), 1);
  const count = ico.readUInt16LE(4);
  const sizes = [];
  for (let i = 0; i < count; i += 1) {
    const entry = 6 + 16 * i;
    sizes.push(ico[entry]);
    const offset = ico.readUInt32LE(entry + 12);
    assert.equal(ico.subarray(offset + 1, offset + 4).toString("latin1"), "PNG");
  }
  assert.deepEqual(sizes, [16, 32, 48]);
});

test("the manifest's icons exist at their declared sizes, with relative paths", () => {
  const manifest = JSON.parse(readFileSync(join(SITE, "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.display, "browser");
  assert.equal(manifest.start_url, "./");
  for (const purpose of ["any", "maskable"]) {
    assert.ok(manifest.icons.some((i) => i.purpose === purpose && i.sizes === "512x512"), purpose);
  }
  for (const icon of manifest.icons) {
    assert.doesNotMatch(icon.src, /^\//, icon.src);
    assert.ok(existsSync(join(SITE, icon.src)), icon.src);
    const { width, height } = png(icon.src);
    assert.equal(`${width}x${height}`, icon.sizes, icon.src);
  }
});

test("the SVG sources are the drawing's, not hand edits", async () => {
  const { SOURCES } = await import("../scripts/build-icons.mjs");
  for (const [name, source] of Object.entries(SOURCES)) {
    assert.equal(readFileSync(join(SITE, name), "utf8"), source, `${name}: run npm run icons`);
  }
});
