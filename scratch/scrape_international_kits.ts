/**
 * scrape_international_kits.ts
 *
 * Automated pipeline for international (World Cup) kit images:
 *
 *  Phase 1 – Discover kit image URLs using the Wikipedia REST API.
 *             Fetches each team's national team page and picks the best photo
 *             (team group shot, kit photo, or jersey image).
 *
 *  Phase 2 – Download the image bytes and upload to Supabase Storage under
 *             kit-images/international/<teamId>/home.<ext>
 *
 *  Phase 3 – Print kitSpecs.ts patch data (JSON + TS snippet) to stdout.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node --experimental-strip-types scratch/scrape_international_kits.ts
 *
 * Optional env vars:
 *   DRY_RUN=1   – skip Supabase upload, only print what would be uploaded
 *   TEAM=brazil – only process a single team (for testing)
 */

import { createClient } from "@supabase/supabase-js";

// ─── CONFIG ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://gldtjiofbokiqcordale.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "kit-images";
const STORAGE_PREFIX = "international";
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY_TEAM = process.env.TEAM ?? "";
const POLITE_DELAY_MS = 1000;

// ─── TEAM DEFINITIONS ─────────────────────────────────────────────────────────

interface TeamDef {
  teamId: string;
  team: string;
  confederation: string;
  primaryColors: string[];
  /** en.wikipedia.org page title for national team (most images are here) */
  wikiTeamPage: string;
  /** Optional direct image URL from Wikimedia Commons if we already know it */
  directImageUrl?: string;
}

const WORLD_CUP_TEAMS: TeamDef[] = [
  // ── HOSTS ──
  { teamId: "canada",        team: "Canada",               confederation: "CONCACAF", primaryColors: ["red","canada"],             wikiTeamPage: "Canada_men%27s_national_soccer_team" },
  { teamId: "mexico",        team: "Mexico",               confederation: "CONCACAF", primaryColors: ["green","mexico"],           wikiTeamPage: "Mexico_national_football_team" },
  { teamId: "usa",           team: "United States",        confederation: "CONCACAF", primaryColors: ["white","blue","red"],       wikiTeamPage: "United_States_men%27s_national_soccer_team" },
  // ── UEFA ──
  { teamId: "england",       team: "England",              confederation: "UEFA",     primaryColors: ["white","england"],          wikiTeamPage: "England_national_football_team",
    directImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/England_team.jpg/500px-England_team.jpg" },
  { teamId: "france",        team: "France",               confederation: "UEFA",     primaryColors: ["blue","france"],            wikiTeamPage: "France_national_football_team" },
  { teamId: "germany",       team: "Germany",              confederation: "UEFA",     primaryColors: ["white","germany"],          wikiTeamPage: "Germany_national_football_team" },
  { teamId: "spain",         team: "Spain",                confederation: "UEFA",     primaryColors: ["red","spain"],              wikiTeamPage: "Spain_national_football_team" },
  { teamId: "portugal",      team: "Portugal",             confederation: "UEFA",     primaryColors: ["red","green","portugal"],   wikiTeamPage: "Portugal_national_football_team" },
  { teamId: "netherlands",   team: "Netherlands",          confederation: "UEFA",     primaryColors: ["orange","netherlands"],     wikiTeamPage: "Netherlands_national_football_team" },
  { teamId: "belgium",       team: "Belgium",              confederation: "UEFA",     primaryColors: ["red","belgium"],            wikiTeamPage: "Belgium_national_football_team" },
  { teamId: "croatia",       team: "Croatia",              confederation: "UEFA",     primaryColors: ["red","white","croatia"],    wikiTeamPage: "Croatia_national_football_team" },
  { teamId: "switzerland",   team: "Switzerland",          confederation: "UEFA",     primaryColors: ["red","switzerland"],        wikiTeamPage: "Switzerland_national_football_team" },
  { teamId: "austria",       team: "Austria",              confederation: "UEFA",     primaryColors: ["red","austria"],            wikiTeamPage: "Austria_national_football_team" },
  { teamId: "norway",        team: "Norway",               confederation: "UEFA",     primaryColors: ["red","norway"],             wikiTeamPage: "Norway_national_football_team" },
  { teamId: "sweden",        team: "Sweden",               confederation: "UEFA",     primaryColors: ["yellow","blue","sweden"],   wikiTeamPage: "Sweden_national_football_team" },
  { teamId: "scotland",      team: "Scotland",             confederation: "UEFA",     primaryColors: ["navy","blue","scotland"],   wikiTeamPage: "Scotland_national_football_team" },
  { teamId: "czech-republic",team: "Czech Republic",       confederation: "UEFA",     primaryColors: ["red","czech"],             wikiTeamPage: "Czech_Republic_national_football_team" },
  { teamId: "turkey",        team: "Turkey",               confederation: "UEFA",     primaryColors: ["red","turkey"],             wikiTeamPage: "Turkey_national_football_team" },
  { teamId: "bosnia",        team: "Bosnia and Herzegovina",confederation: "UEFA",    primaryColors: ["blue","yellow","bosnia"],   wikiTeamPage: "Bosnia_and_Herzegovina_national_football_team" },
  // ── CONMEBOL ──
  { teamId: "brazil",        team: "Brazil",               confederation: "CONMEBOL", primaryColors: ["yellow","green","brazil"],  wikiTeamPage: "Brazil_national_football_team" },
  { teamId: "argentina",     team: "Argentina",            confederation: "CONMEBOL", primaryColors: ["light blue","white"],       wikiTeamPage: "Argentina_national_football_team" },
  { teamId: "colombia",      team: "Colombia",             confederation: "CONMEBOL", primaryColors: ["yellow","colombia"],        wikiTeamPage: "Colombia_national_football_team" },
  { teamId: "ecuador",       team: "Ecuador",              confederation: "CONMEBOL", primaryColors: ["yellow","ecuador"],         wikiTeamPage: "Ecuador_national_football_team" },
  { teamId: "uruguay",       team: "Uruguay",              confederation: "CONMEBOL", primaryColors: ["sky blue","uruguay"],       wikiTeamPage: "Uruguay_national_football_team" },
  { teamId: "paraguay",      team: "Paraguay",             confederation: "CONMEBOL", primaryColors: ["red","white","paraguay"],   wikiTeamPage: "Paraguay_national_football_team" },
  // ── CAF ──
  { teamId: "morocco",       team: "Morocco",              confederation: "CAF",      primaryColors: ["red","green","morocco"],    wikiTeamPage: "Morocco_national_football_team" },
  { teamId: "senegal",       team: "Senegal",              confederation: "CAF",      primaryColors: ["green","yellow","senegal"], wikiTeamPage: "Senegal_national_football_team" },
  { teamId: "nigeria",       team: "Nigeria",              confederation: "CAF",      primaryColors: ["green","white","nigeria"],  wikiTeamPage: "Nigeria_national_football_team" },
  { teamId: "ivory-coast",   team: "Ivory Coast",          confederation: "CAF",      primaryColors: ["orange","ivory"],           wikiTeamPage: "Ivory_Coast_national_football_team" },
  { teamId: "egypt",         team: "Egypt",                confederation: "CAF",      primaryColors: ["red","egypt"],              wikiTeamPage: "Egypt_national_football_team" },
  { teamId: "ghana",         team: "Ghana",                confederation: "CAF",      primaryColors: ["black","white","ghana"],    wikiTeamPage: "Ghana_national_football_team" },
  { teamId: "algeria",       team: "Algeria",              confederation: "CAF",      primaryColors: ["white","green","algeria"],  wikiTeamPage: "Algeria_national_football_team" },
  { teamId: "south-africa",  team: "South Africa",         confederation: "CAF",      primaryColors: ["yellow","green","bafana"], wikiTeamPage: "South_Africa_national_football_team" },
  { teamId: "dr-congo",      team: "DR Congo",             confederation: "CAF",      primaryColors: ["blue","yellow","congo"],    wikiTeamPage: "DR_Congo_national_football_team" },
  { teamId: "cape-verde",    team: "Cape Verde",           confederation: "CAF",      primaryColors: ["blue","cape verde"],        wikiTeamPage: "Cape_Verde_national_football_team" },
  { teamId: "tunisia",       team: "Tunisia",              confederation: "CAF",      primaryColors: ["white","red","tunisia"],    wikiTeamPage: "Tunisia_national_football_team" },
  // ── AFC ──
  { teamId: "japan",         team: "Japan",                confederation: "AFC",      primaryColors: ["blue","japan"],             wikiTeamPage: "Japan_national_football_team" },
  { teamId: "south-korea",   team: "South Korea",          confederation: "AFC",      primaryColors: ["red","korea"],              wikiTeamPage: "South_Korea_national_football_team" },
  { teamId: "australia",     team: "Australia",            confederation: "AFC",      primaryColors: ["yellow","green"],           wikiTeamPage: "Australia_national_soccer_team" },
  { teamId: "saudi-arabia",  team: "Saudi Arabia",         confederation: "AFC",      primaryColors: ["green","white","saudi"],    wikiTeamPage: "Saudi_Arabia_national_football_team" },
  { teamId: "iran",          team: "Iran",                 confederation: "AFC",      primaryColors: ["white","green","iran"],     wikiTeamPage: "Iran_national_football_team" },
  { teamId: "iraq",          team: "Iraq",                 confederation: "AFC",      primaryColors: ["green","iraq"],             wikiTeamPage: "Iraq_national_football_team" },
  { teamId: "qatar",         team: "Qatar",                confederation: "AFC",      primaryColors: ["maroon","qatar"],           wikiTeamPage: "Qatar_national_football_team" },
  { teamId: "jordan",        team: "Jordan",               confederation: "AFC",      primaryColors: ["red","white","jordan"],     wikiTeamPage: "Jordan_national_football_team" },
  { teamId: "uzbekistan",    team: "Uzbekistan",           confederation: "AFC",      primaryColors: ["blue","uzbekistan"],        wikiTeamPage: "Uzbekistan_national_football_team" },
  // ── CONCACAF non-hosts ──
  { teamId: "panama",        team: "Panama",               confederation: "CONCACAF", primaryColors: ["white","red","panama"],     wikiTeamPage: "Panama_national_football_team" },
  { teamId: "curacao",       team: "Curaçao",              confederation: "CONCACAF", primaryColors: ["blue","curacao"],           wikiTeamPage: "Cura%C3%A7ao_national_football_team" },
  { teamId: "haiti",         team: "Haiti",                confederation: "CONCACAF", primaryColors: ["blue","red","haiti"],       wikiTeamPage: "Haiti_national_football_team" },
  // ── OFC ──
  { teamId: "new-zealand",   team: "New Zealand",          confederation: "OFC",      primaryColors: ["white","black"],            wikiTeamPage: "New_Zealand_national_football_team" },
];

// ─── WIKIPEDIA API ─────────────────────────────────────────────────────────────

const WP_API = "https://en.wikipedia.org/api/rest_v1";
const WP_UA = "Kitface/1.0 (kitface.app; kit-reference-images; contact@kitface.app)";

interface WpImage {
  title: string;
  url: string;
  scale: string;
}

async function getWikipediaImages(pageTitle: string): Promise<WpImage[]> {
  const url = `${WP_API}/page/media-list/${pageTitle}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": WP_UA, Accept: "application/json" } });
  } catch (e) {
    console.warn(`    ⚠ Network error fetching ${pageTitle}: ${e}`);
    return [];
  }
  if (!res.ok) {
    console.warn(`    ⚠ Wikipedia API ${res.status} for "${pageTitle}"`);
    return [];
  }
  const data = await res.json() as { items?: Array<{ title: string; type: string; srcset?: Array<{ src: string; scale: string }> }> };
  const results: WpImage[] = [];
  for (const item of data.items ?? []) {
    if (item.type !== "image") continue;
    for (const s of item.srcset ?? []) {
      const rawUrl = s.src.startsWith("//") ? `https:${s.src}` : s.src;
      if (/\.(jpe?g|png)(\?|$)/i.test(rawUrl)) {
        results.push({ title: item.title, url: rawUrl, scale: s.scale });
      }
    }
  }
  return results;
}

function scoreImage(img: WpImage, colorKeywords: string[]): number {
  const t = img.title.toLowerCase();
  const u = img.url.toLowerCase();
  let score = 0;

  // Strongly exclude non-kit images
  if (/flag|logo|crest|coat|badge|seal|emblem|stadium|trophy|medal|cap\b/i.test(t)) return -100;

  // Prefer kit/jersey photos
  if (/kit|shirt|jersey|uniform/i.test(t)) score += 20;

  // Team group photos (good reference)
  if (/team\b|squad|lineup|line.up|group/i.test(t)) score += 10;

  // Home kit preference
  if (/home/i.test(t)) score += 5;

  // Match a primary colour keyword
  const lowers = colorKeywords.map((k) => k.toLowerCase());
  if (lowers.some((k) => t.includes(k) || u.includes(k))) score += 8;

  // Prefer larger resolution (2x srcset)
  if (img.scale === "2x") score += 3;

  // Prefer larger pixel counts from URL
  const pxMatch = img.url.match(/\/(\d+)px-/);
  if (pxMatch) score += Math.min(parseInt(pxMatch[1]) / 100, 10);

  return score;
}

function pickBestImage(images: WpImage[], colorKeywords: string[]): string | null {
  if (images.length === 0) return null;
  const scored = images
    .map((img) => ({ img, score: scoreImage(img, colorKeywords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.img.url ?? null;
}

// ─── SUPABASE ─────────────────────────────────────────────────────────────────

async function ensureBucket(supabase: ReturnType<typeof createClient>) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  });
  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create bucket: ${error.message}`);
  }
}

function extFromUrl(url: string): string {
  return (url.split("?")[0].match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg")
    .toLowerCase()
    .replace("jpeg", "jpg");
}

async function downloadAndUpload(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string,
  storageBasePath: string
): Promise<string | null> {
  const ext = extFromUrl(imageUrl);
  const storagePath = `${storageBasePath}.${ext}`;

  const res = await fetch(imageUrl, {
    headers: {
      "User-Agent": WP_UA,
      Referer: "https://en.wikipedia.org/",
    },
  });

  if (!res.ok) {
    console.error(`    ✗ Download failed ${res.status}: ${imageUrl}`);
    return null;
  }

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  console.log(`    ↓ ${(buffer.byteLength / 1024).toFixed(0)} KB from ${imageUrl.slice(0, 80)}`);

  if (DRY_RUN) {
    console.log(`    [DRY RUN] Would upload → ${storagePath}`);
    return `https://gldtjiofbokiqcordale.supabase.co/storage/v1/object/public/${BUCKET}/${storagePath}`;
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) {
    console.error(`    ✗ Upload failed: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ─── RESULT TYPE ──────────────────────────────────────────────────────────────

interface KitResult {
  teamId: string;
  team: string;
  confederation: string;
  variant: "home";
  sourceImageUrl: string;
  publicUrl: string;
}

// ─── PROCESS ONE TEAM ─────────────────────────────────────────────────────────

async function processTeam(
  teamDef: TeamDef,
  supabase: ReturnType<typeof createClient>
): Promise<KitResult | null> {
  console.log(`\n→ ${teamDef.team} (${teamDef.confederation})`);

  let imageUrl: string | null = teamDef.directImageUrl ?? null;

  if (!imageUrl) {
    console.log(`  📖 Wikipedia: ${teamDef.wikiTeamPage}`);
    const images = await getWikipediaImages(teamDef.wikiTeamPage);
    console.log(`     ${images.length} image(s) found`);
    imageUrl = pickBestImage(images, teamDef.primaryColors);
    if (imageUrl) console.log(`     Selected: ${imageUrl.slice(0, 90)}`);
  } else {
    console.log(`  📎 Using direct URL`);
  }

  if (!imageUrl) {
    console.warn(`  ✗ No suitable image found — skipping`);
    return null;
  }

  const storagePath = `${STORAGE_PREFIX}/${teamDef.teamId}/home`;
  const publicUrl = await downloadAndUpload(supabase, imageUrl, storagePath);

  if (!publicUrl) return null;

  console.log(`  ✓ Stored: ${publicUrl}`);
  return {
    teamId: teamDef.teamId,
    team: teamDef.team,
    confederation: teamDef.confederation,
    variant: "home",
    sourceImageUrl: imageUrl,
    publicUrl,
  };
}

// ─── GENERATE TS PATCH ────────────────────────────────────────────────────────

function generateTsPatch(results: KitResult[]): string {
  const entries = results
    .map(
      (r) => `  {
    teamId: "${r.teamId}",
    team: "${r.team}",
    season: "2026 World Cup" as unknown as typeof kitSeason,
    variant: "home" as const,
    manufacturer: "unknown",
    mainSponsor: "unknown",
    baseColor: "unknown",
    accentColors: [],
    pattern: "unknown",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    referenceImageUrl: "${r.publicUrl}",
    sourceUrls: ["${r.sourceImageUrl}"],
    confidence: "low" as const,
  }`
    )
    .join(",\n");

  return `\n// ─── 2026 World Cup International Kit Specs ───────────────────────────────────
// Auto-generated by scratch/scrape_international_kits.ts
// Images stored in Supabase: kit-images/international/<teamId>/home.<ext>
export const internationalKitSpecs: KitSpec[] = [\n${entries}\n];\n`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error("❌ Set SUPABASE_SERVICE_ROLE_KEY before running.");
    process.exit(1);
  }

  const teams = ONLY_TEAM
    ? WORLD_CUP_TEAMS.filter((t) => t.teamId === ONLY_TEAM)
    : WORLD_CUP_TEAMS;

  if (teams.length === 0) {
    console.error(`❌ No team found: TEAM="${ONLY_TEAM}". Valid IDs: ${WORLD_CUP_TEAMS.map(t=>t.teamId).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n🌍 International Kit Scraper — ${teams.length} team(s)${DRY_RUN ? " [DRY RUN]" : ""}\n`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  if (!DRY_RUN) {
    await ensureBucket(supabase);
    console.log(`✓ Bucket "${BUCKET}" ready`);
  }

  const results: KitResult[] = [];
  const skipped: string[] = [];

  for (const team of teams) {
    const result = await processTeam(team, supabase);
    if (result) {
      results.push(result);
    } else {
      skipped.push(team.team);
    }
    if (teams.indexOf(team) < teams.length - 1) {
      await new Promise((r) => setTimeout(r, POLITE_DELAY_MS));
    }
  }

  const sep = "═".repeat(60);
  console.log(`\n\n${sep}`);
  console.log(`✅  ${results.length} / ${teams.length} teams processed`);
  if (skipped.length) console.log(`⚠  Skipped: ${skipped.join(", ")}`);
  console.log(sep);

  // Print TypeScript patch
  console.log("\n\n" + generateTsPatch(results));

  // Print raw JSON for further processing
  console.log("// ─── Raw JSON results ───");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
