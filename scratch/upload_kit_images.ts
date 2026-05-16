/**
 * Downloads kit images from source URLs and uploads them to Supabase Storage.
 * Usage: node --experimental-strip-types scratch/upload_kit_images.ts
 *
 * Reads KIT_URLS from the JSON data at the bottom of this file.
 * Outputs updated referenceImageUrl values to patch into kitSpecs.ts.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gldtjiofbokiqcordale.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "kit-images";

// Populated after running the URL-collection step
// Format: { teamId, variant, imageUrl }
const KIT_URLS: Array<{ teamId: string; variant: string; imageUrl: string }> = [
  { teamId: "arsenal",       variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/11/18/Z5U71ocitVEydDn/arsenal-fc-2025-26-home-kit.jpg" },
  { teamId: "aston-villa",   variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/07/19/oHl9m2AVpKx9AcP/aston-villa-2025-26-home-kit.jpg" },
  { teamId: "bournemouth",   variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/07/15/cqZWpPeYuqhb0S1/afc-bournemouth-2025-26-home-kit.jpg" },
  { teamId: "brentford",     variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/07/04/Ss8OoroRbWUUZBo/brentford-fc-2025-26-home-kit.jpg" },
  { teamId: "brighton",      variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/07/01/JlDs4PKkAbkYe7h/brighton-hove-albion-2025-26-home-kit.jpg" },
  { teamId: "burnley",       variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/07/02/AF63bL91Xam5qXU/burnley-fc-2025-26-home-kit.jpg" },
  { teamId: "chelsea",       variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/09/22/Wj8ki6qeOusGzIo/chelsea-fc-2025-26-home-kit.jpg" },
  { teamId: "crystal-palace",variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/08/18/VRMHHKKzF9YYwUM/crystal-palace-2025-26-home-kit.jpg" },
  { teamId: "everton",       variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/06/26/NHEJvpsYXD0iSm3/everton-fc-2025-26-home-kit.jpg" },
  { teamId: "fulham",        variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/08/18/KglXjDxam2HrNN6/fulham-fc-2025-26-home-kit.jpg" },
  { teamId: "leeds",         variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/07/04/eBTdg9Sl8IOp0Uj/leeds-united-2025-26-home-kit.jpg" },
  { teamId: "liverpool",     variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/08/06/kIvg6aRbsdiv12A/liverpool-fc-2025-26-home-kit.jpg" },
  { teamId: "man-city",      variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/05/13/gewy1MN5rMVUaTX/manchester-city-2025-26-home-kit.jpg" },
  { teamId: "man-united",    variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/11/18/RdjHzn4ULniPu0Z/manchester-united-2025-26-home-kit.jpg" },
  { teamId: "newcastle",     variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/06/12/iuRDJNGMm7vZyUg/newcastle-united-2025-26-home-kit.jpg" },
  { teamId: "sunderland",    variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/07/29/OpJJd0WOcfoMae2/sunderland-afc-2025-26-home-kit.jpg" },
  { teamId: "tottenham",     variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/06/03/AjKuLXeetr2zHNt/tottenham-hotspur-2025-26-home-kit.jpg" },
  { teamId: "west-ham",      variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/09/17/yqkFgKPTnE2kHpY/west-ham-united-2025-26-home-kit.jpg" },
  { teamId: "wolves",        variant: "home", imageUrl: "https://www.footballkitarchive.com/cdn/2025/06/27/wKi1rTZkD8iNPcV/wolverhampton-wanderers-2025-26-home-kit.jpg" },
];

async function ensureBucket(supabase: ReturnType<typeof createClient>) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
  });
  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create bucket: ${error.message}`);
  }
}

async function downloadAndUpload(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string,
  storagePath: string,
): Promise<string | null> {
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://www.footballkitarchive.com/",
    },
  });

  if (!response.ok) {
    console.error(`  ✗ Download failed ${response.status}: ${imageUrl}`);
    return null;
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) {
    console.error(`  ✗ Upload failed: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function ext(url: string) {
  const match = url.split("?")[0].match(/\.(\w{3,4})$/);
  return match?.[1] ?? "jpg";
}

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error("Set SUPABASE_SERVICE_ROLE_KEY env var before running.");
    process.exit(1);
  }

  if (KIT_URLS.length === 0) {
    console.error("KIT_URLS array is empty — populate it with the collected image URLs first.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  await ensureBucket(supabase);
  console.log(`✓ Bucket "${BUCKET}" ready\n`);

  const results: Array<{ teamId: string; variant: string; publicUrl: string }> = [];

  for (const { teamId, variant, imageUrl } of KIT_URLS) {
    console.log(`→ ${teamId} ${variant}`);
    console.log(`  ↓ ${imageUrl}`);

    const storagePath = `${teamId}/${variant}.${ext(imageUrl)}`;
    const publicUrl = await downloadAndUpload(supabase, imageUrl, storagePath);

    if (publicUrl) {
      console.log(`  ✓ ${publicUrl}`);
      results.push({ teamId, variant, publicUrl });
    }

    // Polite delay between requests
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log("\n=== kitSpecs.ts patches ===");
  console.log("Add these referenceImageUrl values:\n");
  for (const { teamId, variant, publicUrl } of results) {
    console.log(`${teamId} / ${variant}: "${publicUrl}"`);
  }

  console.log("\n=== Raw JSON (for automated patching) ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
