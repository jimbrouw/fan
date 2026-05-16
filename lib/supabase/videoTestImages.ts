import type { SupabaseClient } from "@supabase/supabase-js";

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|webp)$/i;

type StorageListItem = {
  id?: string | null;
  name: string;
  updated_at?: string | null;
};

export type VideoTestImage = {
  bucket: string;
  path: string;
  name: string;
  signedUrl: string;
  updatedAt?: string | null;
};

export function isSupportedVideoTestImagePath(path: string) {
  return IMAGE_EXTENSION_PATTERN.test(path);
}

export function buildSupabaseStorageUri(bucket: string, path: string) {
  return `supabase://${bucket}/${path}`;
}

export async function createSignedVideoTestImageUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresInSeconds = 60 * 60,
) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not sign Supabase test image.");
  }

  return data.signedUrl;
}

export async function listSignedVideoTestImages(
  supabase: SupabaseClient,
  bucket: string,
  options: { limit?: number; maxDepth?: number; expiresInSeconds?: number } = {},
) {
  const limit = options.limit ?? 30;
  const maxDepth = options.maxDepth ?? 3;
  const expiresInSeconds = options.expiresInSeconds ?? 60 * 60;
  const paths = await listImagePaths(supabase, bucket, "", maxDepth);
  const selectedPaths = paths.slice(0, limit);

  return Promise.all(
    selectedPaths.map(async (item) => ({
      bucket,
      path: item.path,
      name: item.name,
      updatedAt: item.updatedAt,
      signedUrl: await createSignedVideoTestImageUrl(supabase, bucket, item.path, expiresInSeconds),
    })),
  );
}

async function listImagePaths(
  supabase: SupabaseClient,
  bucket: string,
  prefix: string,
  maxDepth: number,
): Promise<Array<{ path: string; name: string; updatedAt?: string | null }>> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 100,
    sortBy: { column: "updated_at", order: "desc" },
  });

  if (error) {
    throw new Error(error.message);
  }

  const items = (data ?? []) as StorageListItem[];
  const imagePaths: Array<{ path: string; name: string; updatedAt?: string | null }> = [];

  for (const item of items) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;

    if (isSupportedVideoTestImagePath(path)) {
      imagePaths.push({ path, name: item.name, updatedAt: item.updated_at });
      continue;
    }

    const looksLikeFolder = !item.id && !path.includes(".");
    if (looksLikeFolder && maxDepth > 0) {
      imagePaths.push(...(await listImagePaths(supabase, bucket, path, maxDepth - 1)));
    }
  }

  return imagePaths;
}
