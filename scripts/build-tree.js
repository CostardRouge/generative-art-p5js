const { writeFileSync, statSync, promises } = require("fs");
const { resolve } = require("path");
const { readdir } = promises;

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else if (dirent.name.endsWith("index.js")) {
      yield res;
    }
  }
}

const input = process.argv[2];
const output = process.argv[3];

const ignoredSketches = [];

(async () => {
  let tree = {};

  for await (const filePath of getFiles(input)) {
    const parts = filePath.split("/");
    const name = parts[parts.length - 2];
    const folder = parts[parts.length - 3];

    if (name.startsWith("_")) {
      ignoredSketches.push(name);
    }
    else {
      const { mtime: sketchModificationTime } = statSync(filePath);

      const folderMeta = {
        _mtime: tree?.[folder]?._mtime ?? statSync(filePath.replace("/index.js", ""))?.mtime,
        name: folder,
      };
  
      tree = {
        ...tree,
        [folder]: {
          ...tree[folder],
          meta: folderMeta,
          sketches: {
            ...tree[folder]?.sketches,
            [name]: {
              meta: {
                _mtime: sketchModificationTime,
                name,
              },
              path: `${input}/${folder}/${name}`,
            },
          }
          
        },
      };
    }
  }

  // console.log(tree);
  console.log(`\nignoredSketches (${ignoredSketches.length}):`);
  console.log(`${ignoredSketches.map(ignoredSketch => ignoredSketch).join("\n")}`);

  writeFileSync(output, JSON.stringify(tree, null, 3));
})();
