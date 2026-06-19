import type { SupabaseClient } from "@supabase/supabase-js";
import { buildProdigiGreetingCardArtwork } from "@/lib/fulfillment/cardArtwork";
import { captureBucket } from "@/lib/supabase/server";
import { createSignedStorageUrl } from "@/lib/supabase/storage";

export const PRINT_ASSET_PREFIX = "print-assets";
export const PRINT_ASSET_RETENTION_MS = 8 * 24 * 60 * 60 * 1000;

const PRINT_ASSET_SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60;
const MAX_POSTER_BYTES = 25 * 1024 * 1024;

export async function createProdigiCardPrintAsset(input: {
  supabase: SupabaseClient;
  posterUrl: string;
  message?: string | null;
  assetKey: string;
}) {
  const poster = await downloadPoster(input.posterUrl);
  const artwork = await buildProdigiGreetingCardArtwork({
    poster,
    message: input.message,
  });
  const safeAssetKey = input.assetKey.replace(/[^a-zA-Z0-9_-]/g, "-");
  const path = `${PRINT_ASSET_PREFIX}/${safeAssetKey}.jpg`;
  const { error } = await input.supabase.storage.from(captureBucket).upload(path, artwork, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    throw new Error(`Could not store Prodigi card artwork: ${error.message}`);
  }

  return createSignedStorageUrl(
    input.supabase,
    captureBucket,
    path,
    PRINT_ASSET_SIGNED_URL_TTL_SECONDS
  );
}

async function downloadPoster(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not download poster artwork (${response.status}).`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.startsWith("image/")) {
    throw new Error("Poster artwork URL did not return an image.");
  }

  const contentLength = Number.parseInt(response.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_POSTER_BYTES) {
    throw new Error("Poster artwork is too large to prepare for printing.");
  }

  const poster = Buffer.from(await response.arrayBuffer());
  if (poster.length === 0 || poster.length > MAX_POSTER_BYTES) {
    throw new Error("Poster artwork is empty or too large to prepare for printing.");
  }

  return poster;
}
