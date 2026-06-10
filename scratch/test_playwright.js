const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.footballkitarchive.com/england-kits/');
  // Wait for the page to load, maybe bypass cloudflare
  await page.waitForTimeout(5000);
  const html = await page.content();
  console.log(html.substring(0, 500));
  await browser.close();
})();
