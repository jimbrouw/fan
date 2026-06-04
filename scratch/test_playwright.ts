import { chromium } from "playwright";

async function main() {
  console.log("Starting headful Playwright...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log("Navigating to Football Kit Archive...");
  try {
    await page.goto("https://www.footballkitarchive.com/england-kits/", { waitUntil: "domcontentloaded", timeout: 30000 });
    
    console.log("Checking for Cloudflare challenge...");
    let challengePassed = false;
    for (let i = 0; i < 20; i++) {
      const title = await page.title();
      console.log(`Current Title: "${title}"`);
      if (title && !title.includes("Just a moment")) {
        console.log("Challenge passed! Bypassed successfully!");
        challengePassed = true;
        break;
      }
      await page.waitForTimeout(1000);
    }
    
    if (challengePassed) {
      console.log("Waiting 5 seconds for page navigation to stabilize...");
      await page.waitForTimeout(5000);
      
      // Get the title to verify we are on the real page
      const realTitle = await page.title();
      console.log(`Actual Page Title: ${realTitle}`);
      
      // Find all links to kits on this page
      const links = await page.$$eval("a", (anchors) => 
        anchors
          .map(a => ({ href: a.href, text: a.textContent?.trim() || "" }))
          .filter(item => item.href.includes("-kit-") || item.href.includes("-home-") || item.href.includes("-away-"))
      );
      
      console.log(`Found ${links.length} kit links:`);
      console.log(JSON.stringify(links.slice(0, 10), null, 2));
    }
    
  } catch (e) {
    console.error("Error occurred:", e);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

main();
