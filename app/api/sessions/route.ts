import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const user = await getCurrentUser();
    const supabase = createServerSupabaseClient();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error } = await supabase.from("capture_sessions").insert({
      id,
      user_id: user?.id ?? null,
      status: "capturing",
      created_at: now,
      updated_at: now
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id, status: "capturing", createdAt: now, updatedAt: now });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Session creation failed." },
      { status: 500 }
    );
  }
}
