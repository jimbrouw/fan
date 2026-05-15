import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PreferenceRow = {
  email_enabled: boolean;
  push_enabled: boolean;
};

function isMissingPreferenceTable(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || /Could not find the table 'public\.user_notification_preferences'/i.test(error.message ?? "");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ emailEnabled: false, pushEnabled: false, available: false });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("email_enabled,push_enabled")
    .eq("user_id", user.id)
    .maybeSingle<PreferenceRow>();

  if (error) {
    if (isMissingPreferenceTable(error)) {
      return NextResponse.json({ emailEnabled: false, pushEnabled: false, available: false });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    emailEnabled: data?.email_enabled ?? true,
    pushEnabled: data?.push_enabled ?? false,
    available: true,
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to update notifications." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    emailEnabled?: boolean;
    pushEnabled?: boolean;
  };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("user_notification_preferences").upsert(
    {
      user_id: user.id,
      email_enabled: body.emailEnabled ?? true,
      push_enabled: body.pushEnabled ?? false,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    if (isMissingPreferenceTable(error)) {
      return NextResponse.json({ emailEnabled: false, pushEnabled: false, available: false });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    emailEnabled: body.emailEnabled ?? true,
    pushEnabled: body.pushEnabled ?? false,
    available: true,
  });
}
