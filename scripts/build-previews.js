const { writeFileSync, readFileSync } = require("fs");
const core = require( 'puppeteer-core' );

const treePath = process.argv[2];
const size = process.argv[3];
const type = process.argv[4];

let _page;

async function getScreenshot(html) {
  const [ width, height ] = size.split( 'x' ).map( Number );

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

async function getPage() {
  if (_page) {
    return _page;
  }

  const browser = await core.launch({
    args: [],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  _page = await browser.newPage();

  return _page;
}

async function getScreenshotWithURL(url) {
  const page = await getPage();
  const [ width, height ] = size.split( 'x' ).map( Number );

  await page.setViewport({ width, height});
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.p5Canvas');

  return await page.screenshot({ type });
}

const treeFileContent = readFileSync(treePath, 'utf8');
const tree = JSON.parse(treeFileContent);

for (const [ , sketches ] of Object.entries(tree)) {
  for (const [ sketchName, sketch ] of Object.entries(sketches)) {

    //const indexPath = `${sketch.path}/index.html`;
    //const indexFileContent = readFileSync(indexPath, 'utf8');
    const screenShootFilePath = `${sketch.path}/screenshoot.${type}`;
    const indexFileURL = `http://localhost:5500/${sketch.path}/?preview&size=${size}`;
    const screenShootFileContent = await getScreenshotWithURL(indexFileURL);

    writeFileSync(screenShootFilePath, screenShootFileContent);

    console.log("OK: ", sketchName, screenShootFilePath);
  }
}

