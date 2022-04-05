const { writeFileSync, readFileSync, existsSync } = require("fs");
const core = require( 'puppeteer-core' );
const chrome = require( 'chrome-aws-lambda' );

const treePath = process.argv[2];
const size = process.argv[3];
const type = process.argv[4];

let _page;

async function getScreenshot(html) {
  const [ width, height ] = size.split( 'x' ).map( Number );

  const browser = await core.launch({
    args: [],
    // args: chrome.args,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // executablePath: await chrome.executablePath,
    headless: false
    // headless: true
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
    // args: chrome.args,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // executablePath: await chrome.executablePath,
    headless: false
    // headless: true
  });

  _page = await browser.newPage();
  // _page
  //   .on('console', msg => console.log('PAGE LOG:', msg.text, msg))
  //   .on('pageerror', ({ message }) => console.log(message))
  //   .on('response', response => console.log(`${response.status()} ${response.url()}`))
  //   .on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))

  return _page;
}

async function getScreenshotWithURL(url, size) {
  const page = await getPage();
  const [ width, height ] = size.split( 'x' ).map( Number );

  await page.setViewport({ width, height});
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.p5Canvas');
  await page.waitForTimeout(1000);

  return await page.screenshot({ type });
}

async function buildPreviews() {
  const treeFileContent = readFileSync(treePath, 'utf8');
  const tree = JSON.parse(treeFileContent);

  for (const [ , sketches ] of Object.entries(tree)) {
    for (const [ sketchName, sketch ] of Object.entries(sketches)) {
      // if ( sketchName !== 'midi-v1-output') {
      //   break;
      // }

      //const indexPath = `${sketch.path}/index.html`;
      //const indexFileContent = readFileSync(indexPath, 'utf8');
      console.log(">>: ", sketchName);

      const screenShootFilePath = `${sketch.path}/screenshot.${type}`;
      const indexFileURL = `http://localhost:5500/${sketch.path}/?preview&size=${size}`;
      const screenShootFileContent = await getScreenshotWithURL(indexFileURL, size);

      if (!existsSync(screenShootFilePath)) {
        writeFileSync(screenShootFilePath, screenShootFileContent);
        console.log("OK: ", sketchName, screenShootFilePath);
      }
    }
  }

  process.exit(0);
}

buildPreviews();
