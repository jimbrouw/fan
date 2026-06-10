import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_CAPTURE_SIGNED_URL_TTL_SECONDS = 60 * 60 * 6;

export function getCaptureSignedUrlTtlSeconds() {
  const raw = process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS;
  if (!raw) return DEFAULT_CAPTURE_SIGNED_URL_TTL_SECONDS;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CAPTURE_SIGNED_URL_TTL_SECONDS;
}

export function buildSupabaseStorageUri(bucket: string, path: string) {
  return `supabase://${bucket}/${path}`;
}

export function parseSupabaseStorageUri(uri: string) {
  if (!uri.startsWith("supabase://")) return null;

  const withoutScheme = uri.slice("supabase://".length);
  const separatorIndex = withoutScheme.indexOf("/");
  if (separatorIndex <= 0 || separatorIndex === withoutScheme.length - 1) return null;

  return {
    bucket: withoutScheme.slice(0, separatorIndex),
    path: withoutScheme.slice(separatorIndex + 1),
  };
}

export async function createSignedStorageUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresInSeconds = getCaptureSignedUrlTtlSeconds()
) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not create signed storage URL.");
  }

  return data.signedUrl;
}
