import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}

export const captureBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "fan-hero-captures";
export const videoTestBucket =
  process.env.SUPABASE_VIDEO_TEST_BUCKET ?? "f9cbab46-9d5e-41e4-9261-70e1e5477a8d";
