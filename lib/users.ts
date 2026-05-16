import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type UserMetadata = {
  full_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
  provider?: string;
};

function isMissingOptionalUserTable(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || /Could not find the table 'public\.(users|user_notification_preferences)'/i.test(error.message ?? "");
}

export async function upsertUserProfile(user: User) {
  try {
    const metadata = user.user_metadata as UserMetadata;
    const supabase = createServerSupabaseClient();
    const email = user.email;

    if (!email) {
      console.warn("Skipping user profile upsert: signed-in user is missing an email address.");
      return;
    }

    const profile = await supabase.from("users").upsert(
      {
        id: user.id,
        email,
        full_name: metadata.full_name ?? metadata.name ?? null,
        avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
        provider: metadata.provider ?? "google",
      },
      { onConflict: "id" }
    );

    if (profile.error) {
      if (isMissingOptionalUserTable(profile.error)) {
        console.warn(`Skipping user profile upsert: ${profile.error.message}`);
        return;
      }

      throw new Error(profile.error.message);
    }

    const preferences = await supabase.from("user_notification_preferences").upsert(
      {
        user_id: user.id,
        email_enabled: true,
        push_enabled: false,
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    if (preferences.error) {
      if (isMissingOptionalUserTable(preferences.error)) {
        console.warn(`Skipping notification preference upsert: ${preferences.error.message}`);
        return;
      }

      throw new Error(preferences.error.message);
    }
  } catch (error) {
    console.warn(`Skipping user profile setup: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}
