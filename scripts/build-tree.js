const { writeFileSync, statSync, promises } = require("fs");
const { resolve } = require("path");
const { readdir } = promises;

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else if (dirent.name.endsWith("index.html")) {
      yield res;
    }
  }
}

const input = process.argv[2];
const output = process.argv[3];

(async () => {
  let tree = {};
  for await (const filePath of getFiles(input)) {
    const parts = filePath.split("/");
    const name = parts[parts.length - 2];
    const folder = parts[parts.length - 3];

    // const folderPath = filePath.replace("/index.html", "");
    // const { mtime } = statSync(folderPath);

    tree = {
      ...tree,
      [folder]: {
        // _mtime: mtime,
        ...tree[folder],
        [name]: {
          meta: {
            name,
            folder,
          },
          path: `${input}/${folder}/${name}`,
        },
      },
    };
  }
  // console.log(tree);

  writeFileSync(output, JSON.stringify(tree, null, 3));
})();
