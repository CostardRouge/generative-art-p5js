const { writeFileSync, readFileSync } = require("fs");
const core = require( 'puppeteer-core' );

const treePath = process.argv[2];
const size = process.argv[3];
const type = process.argv[4];

let _page;

async function getScreenshot(html) {
  const [ width, height ] = size.split( 'x' ).map( Number );

  if (_page) {
    return _page;
  }

  const browser = await core.launch({
    args: [],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height});
  await page.setContent(html);
  return await page.screenshot({ type });
}

getScreenshot("<html><body><h1>Hello World</h1></body></html>")
  .then(function(screenShootFileContent) {
    writeFileSync(`./file.${type}`, screenShootFileContent)
  });

  const treeFileContent = readFileSync(treePath, 'utf8');
const tree = JSON.parse(treeFileContent);

for (const [ , sketches ] of Object.entries(tree)) {
  for (const [ sketchName, sketch ] of Object.entries(sketches)) {
    const indexPath = `${sketch.path}/index.html`;
    const indexFileContent = readFileSync(indexPath, 'utf8');

    console.log(sketchName, indexFileContent);
  }
}

