import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const SUPABASE_URL = "https://gldtjiofbokiqcordale.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "kit-images";
const LEAGUE_URL = "https://www.footballkitarchive.com/premier-league-kits-2026-27-l224/";
const RESULTS_PATH = "scratch/premier_league_2026_kit_results.json";

const TEAM_ID_BY_NAME: Record<string, string> = {
  "Arsenal FC": "arsenal",
  "Aston Villa": "aston-villa",
  "Brighton & Hove Albion": "brighton",
  "Chelsea FC": "chelsea",
  "Leeds United": "leeds",
  "Liverpool FC": "liverpool",
  "Manchester City": "man-city",
  "Manchester United": "man-united",
  "Newcastle United": "newcastle",
  "Nottingham Forest": "nottingham-forest",
  "Tottenham Hotspur": "tottenham"
};

type KitResult = {
  teamId: string;
  team: string;
  variant: "home" | "away" | "third";
  sourceUrl: string;
  imageUrl?: string;
  publicUrl?: string;
};

async function waitForBypass(page: any) {
  for (let i = 0; i < 90; i++) {
    const title = await page.title().catch(() => "");
    const content = await page.content().catch(() => "");
    if (!title.includes("Just a moment") && !content.includes("challenges.cloudflare.com")) {
      return;
    }

    if (i % 5 === 0) {
      console.log("Waiting for Cloudflare bypass in the connected Chrome window...");
    }
    await page.waitForTimeout(1000);
  }

  throw new Error("Timed out waiting for Football Kit Archive Cloudflare bypass.");
}

function variantFromText(text: string): KitResult["variant"] | null {
  if (/\bHome\b/i.test(text)) return "home";
  if (/\bAway\b/i.test(text)) return "away";
  if (/\bThird\b/i.test(text)) return "third";
  return null;
}

function teamFromText(text: string) {
  return Object.keys(TEAM_ID_BY_NAME).find((team) => text.startsWith(`${team} 2026-27`)) ?? null;
}

function ext(url: string) {
  return url.split("?")[0].match(/\.(\w{3,4})$/)?.[1] ?? "jpg";
}

async function collectKitLinks(page: any): Promise<KitResult[]> {
  await page.goto(LEAGUE_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await waitForBypass(page);

  const links = await page.$$eval("a", (anchors: HTMLAnchorElement[]) =>
    anchors.map((anchor) => ({
      text: anchor.textContent?.replace(/\s+/g, " ").trim() ?? "",
      href: anchor.href
    }))
  );

  const results: KitResult[] = [];
  for (const link of links) {
    if (!/2026-27\b/.test(link.text)) continue;
    const team = teamFromText(link.text);
    const variant = variantFromText(link.text);
    if (!team || !variant) continue;

    const exists = results.some((result) => result.team === team && result.variant === variant);
    if (!exists) {
      results.push({
        teamId: TEAM_ID_BY_NAME[team],
        team,
        variant,
        sourceUrl: link.href
      });
    }
  }

  return results;
}

async function collectImageUrl(page: any, sourceUrl: string) {
  await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await waitForBypass(page);

  return page.evaluate(() => {
    const images = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
    return images.find((image) =>
      image.src.includes("/cdn/") &&
      /kit|shirt|jersey/i.test(`${image.src} ${image.alt}`)
    )?.src;
  });
}

async function uploadImage(supabase: ReturnType<typeof createClient>, result: KitResult) {
  if (!result.imageUrl) return undefined;

  const response = await fetch(result.imageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://www.footballkitarchive.com/"
    }
  });

  if (!response.ok) {
    console.warn(`Download failed ${response.status}: ${result.imageUrl}`);
    return undefined;
  }

  const storagePath = `premier-league/2026-27/${result.teamId}/${result.variant}.${ext(result.imageUrl)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, await response.arrayBuffer(), {
      contentType: response.headers.get("content-type") ?? "image/jpeg",
      upsert: true
    });

  if (error) {
    console.warn(`Upload failed for ${storagePath}: ${error.message}`);
    return undefined;
  }

  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function main() {
  console.log("Connecting to Chrome on port 9222...");
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0] ?? await browser.newContext();
  const page = await context.newPage();

  const supabase = SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : undefined;

  const results = await collectKitLinks(page);
  console.log(`Collected ${results.length} Premier League 2026/27 kit links.`);

  for (const result of results) {
    console.log(`${result.team} ${result.variant}: ${result.sourceUrl}`);
    result.imageUrl = await collectImageUrl(page, result.sourceUrl);

    if (supabase) {
      result.publicUrl = await uploadImage(supabase, result);
    }

    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
    await page.waitForTimeout(800);
  }

  await page.close();
  await browser.close();
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  console.log(`Saved ${RESULTS_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
