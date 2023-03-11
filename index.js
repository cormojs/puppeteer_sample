const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// いわゆるmain関数
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://google.com');

  await emulateAndroid(page);
  await saveJsResourcesInDir(page, "./")

  await browser.close();
})();

async function saveJsResourcesInDir(page, dir) {
  const resources = await page.$$eval('script', scripts => scripts.map(script => script.src));
  const jsResources = resources.filter(resource => resource.endsWith('.js'));
  for (let i = 0; i < jsResources.length; i++) {
    const resource = jsResources[i];
    const response = await page.goto(resource);
    const buffer = await response.buffer();
    const fileName = resource;
    const filePath = `${dir}/${fileName}`;
    console.log(`Saving ${resource} to ${filePath}`);
    fs.writeFile(filePath, buffer, (err) => {
      if (err) throw err;
    });
  }
}

async function emulateAndroid(page) {
  const userAgent = 'Mozilla/5.0 (Linux; Android 4.4; Nexus 5 Build/KRT16M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36';
  await page.setUserAgent(userAgent);
  await page.setViewport({
    width: 360,
    height: 640,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
}

