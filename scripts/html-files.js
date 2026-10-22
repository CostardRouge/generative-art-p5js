// Every HTML page of a built folder, walked recursively: shared by the
// scripts that write into the built gallery after the build
// (inject-umami.js, inject-icons.js).
//
// A symlink is never followed as a folder (a sketch's `assets`, `libraries`
// and `utils` links point back at the root, and following them would loop),
// but a symlinked page is yielded: its index.html resolves to the template,
// so writing through it writes the template — once, since every injection is
// idempotent on a marker.

const { readdirSync } = require("node:fs");
const { join } = require("node:path");

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.toLowerCase().endsWith(".html")) yield path;
  }
}

module.exports = { htmlFiles };
