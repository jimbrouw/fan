import { chromium } from "playwright";
import * as fs from "fs";

async function main() {
  console.log("Starting headful Playwright...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log("Navigating to confirmed kit page...");
  try {
    await page.goto("https://www.footballkitarchive.com/england-2002-home-kit-4789/", { waitUntil: "domcontentloaded", timeout: 30000 });
    
    console.log("Waiting for a genuine page element or kit image to verify bypass...");
    // Let's wait up to 20 seconds for the kit image or a specific main page element to load
    let success = false;
    for (let i = 0; i < 20; i++) {
      const images = await page.$$eval("img", (imgs) => imgs.map(img => img.src));
      const hasCdnImage = images.some(src => src.includes("/cdn/"));
      
      if (hasCdnImage) {
        console.log("Bypassed successfully! CDN image detected!");
        success = true;
        break;
      }
      
      const title = await page.title();
      console.log(`Title: "${title}", images on page: ${images.length}`);
      await page.waitForTimeout(1000);
    }
    
    if (!success) {
      console.log("Bypass failed or timed out. Dumping HTML for inspection...");
      const html = await page.content();
      fs.writeFileSync("scratch/debug_page.html", html);
      console.log("Saved HTML to scratch/debug_page.html");
    } else {
      // Find all images on the page
      const images = await page.$$eval("img", (imgs) => 
        imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          className: img.className,
          parentClass: img.parentElement?.className || "",
          width: img.width,
          height: img.height
        }))
      );
      
      console.log("All genuine images found:");
      console.log(JSON.stringify(images.filter(img => img.src.includes("/cdn/")), null, 2));
    }
    
  } catch (e) {
    console.error("Error occurred:", e);
  } finally {
    await browser.close();
  }
}

main();
