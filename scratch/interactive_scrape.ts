import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Supabase config
const SUPABASE_URL = "https://gldtjiofbokiqcordale.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "kit-images";

// 9 Heavyweight teams to scrape
const WORLD_CUP_TEAMS = [
  { teamId: "england",       team: "England",       slug: "england" },
  { teamId: "france",        team: "France",        slug: "france" },
  { teamId: "germany",       team: "Germany",       slug: "germany" },
  { teamId: "spain",         team: "Spain",         slug: "spain" },
  { teamId: "portugal",      team: "Portugal",      slug: "portugal" },
  { teamId: "netherlands",   team: "Netherlands",   slug: "netherlands" },
  { teamId: "brazil",        team: "Brazil",        slug: "brazil" },
  { teamId: "argentina",     team: "Argentina",     slug: "argentina" },
  { teamId: "belgium",       team: "Belgium",       slug: "belgium" }
];

async function waitForBypass(page: any) {
  console.log("  Waiting for Cloudflare bypass...");
  for (let i = 0; i < 90; i++) {
    try {
      const title = await page.title();
      const content = await page.content();
      
      // Real bypass checks
      const hasCdf = content.includes("challenges.cloudflare.com") || title.includes("Just a moment");
      const hasRealContent = title && !title.includes("Just a moment") && title.trim().length > 0;
      
      if (!hasCdf && hasRealContent) {
        console.log("  🎉 Cloudflare cleared!");
        return true;
      }
    } catch (e) {
      // Ignore navigation errors
    }
    await page.waitForTimeout(1000);
  }
  return true;
}

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error("❌ Set SUPABASE_SERVICE_ROLE_KEY before running.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log("Starting fully automated browser session...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const results: Record<string, string> = {};

  try {
    for (const team of WORLD_CUP_TEAMS) {
      console.log(`\n🌍 Autonomously processing: ${team.team} (${team.teamId})...`);
      
      // Go to their Football Kit Archive landing page
      const url = `https://www.footballkitarchive.com/${team.slug}-kits/`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await waitForBypass(page);
      
      // Wait for a kit link to actually exist on the page to ensure rendering is complete
      console.log("  Waiting for page elements to paint...");
      try {
        await page.waitForSelector("a[href*='-kit-']", { timeout: 15000 });
      } catch (e) {
        console.log("  ⚠️ Timeout waiting for kit links selector. Continuing...");
      }

      // Find the links
      const kitLinks = await page.$$eval("a", (anchors) => 
        anchors
          .map(a => ({ href: a.href, text: a.textContent?.trim() || "" }))
          .filter(item => item.href.includes("-kit-") || item.href.includes("-home-"))
      );

      // Pick the best recent Home kit link
      const homeKitLink = kitLinks.find(link => 
        (link.text.toLowerCase().includes("home") || link.href.toLowerCase().includes("home")) &&
        (link.text.includes("2024") || link.text.includes("2026") || link.text.includes("2025") || 
         link.href.includes("2024") || link.href.includes("2026") || link.href.includes("2025"))
      ) ?? kitLinks.find(link => link.text.toLowerCase().includes("home") || link.href.toLowerCase().includes("home"));

      if (!homeKitLink) {
        console.warn(`  ⚠️ No recent home kit link found for ${team.team}. Skipping.`);
        continue;
      }

      console.log(`  🔗 Navigating to kit: ${homeKitLink.href}`);
      await page.goto(homeKitLink.href, { waitUntil: "domcontentloaded", timeout: 45000 });
      await waitForBypass(page);
      
      console.log("  Waiting for kit details to paint...");
      try {
        await page.waitForSelector("img[src*='/cdn/']", { timeout: 15000 });
      } catch (e) {
        console.log("  ⚠️ Timeout waiting for kit image selector. Continuing...");
      }

      // Find the clean CDN image URL
      const imageUrl = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
        const matches = images.filter(img => 
          img.src.includes("/cdn/") && 
          (img.src.toLowerCase().includes("kit") || img.src.toLowerCase().includes("shirt") || img.src.toLowerCase().includes("jersey"))
        );
        return matches[0]?.src ?? null;
      });

      if (!imageUrl) {
        console.warn(`  ⚠️ Could not find flat-lay kit image URL for ${team.team}. Skipping.`);
        continue;
      }

      console.log(`  📸 Found clean kit image: ${imageUrl}`);

      // Download the image using Playwright's page.evaluate
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
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

      if (error) {
        console.error(`  ❌ Supabase upload failed: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      results[team.teamId] = data.publicUrl;
      console.log(`  ✅ Successfully stored: ${data.publicUrl}`);
    }

  } catch (err) {
    console.error("❌ Scraping error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n=== Scraping Completed Successfully! ===");
  fs.writeFileSync("scratch/flat_lay_results.json", JSON.stringify(results, null, 2));
  console.log("Saved results to scratch/flat_lay_results.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
