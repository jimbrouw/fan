import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FREE_TIER_GENERATIONS, isExemptEmail } from "@/lib/credits";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const exempt = isExemptEmail(user.email);
  const supabase = createServerSupabaseClient();

  const { count } = await supabase
    .from("generation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single<{ credits: number }>();

  const used = count ?? 0;
  const credits = profile?.credits ?? 0;

  return NextResponse.json({
    used,
    freeLimit: FREE_TIER_GENERATIONS,
    remainingFree: Math.max(0, FREE_TIER_GENERATIONS - used),
    credits,
    exempt,
  });
}
