import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Supabase config
const SUPABASE_URL = "https://gldtjiofbokiqcordale.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "kit-images";

// The 7 heavyweight teams we need to scrape
const WORLD_CUP_TEAMS = [
  { teamId: "scotland",      team: "Scotland",      slug: "scotland" },
  { teamId: "norway",        team: "Norway",        slug: "norway" }
];

async function waitForBypass(page: any) {
  let isChallenged = true;
  for (let i = 0; i < 90; i++) {
    try {
      const title = await page.title();
      const content = await page.content();
      const hasCdf = content.includes("challenges.cloudflare.com") || title.includes("Just a moment");
      
      if (!hasCdf) {
        if (isChallenged) {
          console.log("🎉 Cloudflare bypassed! Proceeding...");
          isChallenged = false;
        }
        return true;
      }
    } catch (e) {}
    
    if (i % 5 === 0) {
      console.log("👀 WAITING: Please check your Google Chrome browser window and check any 'I am human' box if visible!");
    }
    await page.waitForTimeout(1000);
  }
  throw new Error("Timeout waiting for Cloudflare bypass.");
}

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error("❌ Set SUPABASE_SERVICE_ROLE_KEY before running.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log("Connecting to your already open Google Chrome (port 9222)...");
  let browser;
  try {
    browser = await chromium.connectOverCDP("http://localhost:9222");
    console.log("🔌 Connected successfully to your Google Chrome!");
  } catch (e) {
    console.error("❌ Connection failed! Make sure Chrome with remote-debugging is running.");
    process.exit(1);
  }

  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  // Load existing results if any, so we don't overwrite previously completed scraping
  let results: Record<string, string> = {};
  if (fs.existsSync("scratch/flat_lay_results.json")) {
    try {
      results = JSON.parse(fs.readFileSync("scratch/flat_lay_results.json", "utf-8"));
    } catch (e) {}
  }

  try {
    for (const team of WORLD_CUP_TEAMS) {
      console.log(`\n🌍 Processing: ${team.team} (${team.teamId})`);
      
      const url = `https://www.footballkitarchive.com/${team.slug}-kits/`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await waitForBypass(page);
      await page.waitForTimeout(1000);

      // Wait for a kit link to actually exist on the page to ensure rendering is complete
      try {
        await page.waitForSelector("a[href*='-kit-']", { timeout: 15000 });
      } catch (e) {
        console.log("  ⚠️ Timeout waiting for kit links. Continuing...");
      }

      const kitLinks = await page.$$eval("a", (anchors) => 
        anchors
          .map(a => ({ href: a.href, text: a.textContent?.trim() || "" }))
          .filter(item => item.href.includes("-kit-") || item.href.includes("-home-"))
      );

      // Find best Home kit link
      const homeKitLink = kitLinks.find(link => 
        (link.text.toLowerCase().includes("home") || link.href.toLowerCase().includes("home")) &&
        (link.text.includes("2024") || link.text.includes("2026") || link.text.includes("2025") || 
         link.href.includes("2024") || link.href.includes("2026") || link.href.includes("2025"))
      ) ?? kitLinks.find(link => link.text.toLowerCase().includes("home") || link.href.toLowerCase().includes("home"));

      if (!homeKitLink) {
        console.warn(`  ⚠️ No recent home kit link found for ${team.team}. Skipping.`);
        continue;
      }

      console.log(`  🔗 Found Home Kit Link: "${homeKitLink.text}" -> ${homeKitLink.href}`);
      
      await page.goto(homeKitLink.href, { waitUntil: "domcontentloaded", timeout: 45000 });
      await waitForBypass(page);
      await page.waitForTimeout(1000);

      try {
        await page.waitForSelector("img[src*='/cdn/']", { timeout: 15000 });
      } catch (e) {
        console.log("  ⚠️ Timeout waiting for kit image. Continuing...");
      }

      const imageUrl = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
        const matches = images.filter(img => 
          img.src.includes("/cdn/") && 
          (img.src.toLowerCase().includes("kit") || img.src.toLowerCase().includes("shirt") || img.src.toLowerCase().includes("jersey"))
        );
        return matches[0]?.src ?? null;
      });

      if (!imageUrl) {
        console.warn(`  ⚠️ Could not find flat-lay kit image URL on page for ${team.team}. Skipping.`);
        continue;
      }

      console.log(`  📸 Found clean kit image: ${imageUrl}`);

      // Download the image using Playwright's page.evaluate
      console.log("  ↓ Downloading image bytes...");
      const base64Data = await page.evaluate(async (url) => {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }, imageUrl);

      const buffer = Buffer.from(base64Data, "base64");
      const storagePath = `international/${team.teamId}/home.jpg`;

      // Upload to Supabase BUCKET
      console.log(`  ↑ Uploading to Supabase: ${storagePath}`);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

      if (error) {
        console.error(`  ❌ Supabase upload failed: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      results[team.teamId] = data.publicUrl;
      console.log(`  ✅ Stored: ${data.publicUrl}`);

      // Incremental save in case of later failures
      fs.writeFileSync("scratch/flat_lay_results.json", JSON.stringify(results, null, 2));
    }

  } catch (err) {
    console.error("❌ Scraping error:", err);
  } finally {
    await page.close();
    await browser.disconnect();
  }

  console.log("\n=== Targeted CDP Scraping Completed! ===");
  fs.writeFileSync("scratch/flat_lay_results.json", JSON.stringify(results, null, 2));
  console.log("Saved all final results to scratch/flat_lay_results.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
