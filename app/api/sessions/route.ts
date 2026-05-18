import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  const message = error.message ?? "";
  return (
    new RegExp(`Could not find the '${column}' column`, "i").test(message) ||
    new RegExp(`column .*\\.${column} does not exist`, "i").test(message)
  );
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    const supabase = createServerSupabaseClient();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const sessionInsert = {
      id,
      user_id: user?.id ?? null,
      status: "capturing",
      created_at: now,
      updated_at: now
    };

    let insert = await supabase.from("capture_sessions").insert(sessionInsert);

    if (insert.error && isMissingSchemaColumn(insert.error, "user_id")) {
      const legacySessionInsert: Omit<typeof sessionInsert, "user_id"> = { ...sessionInsert };
      delete (legacySessionInsert as Partial<typeof sessionInsert>).user_id;
      insert = await supabase.from("capture_sessions").insert(legacySessionInsert);
    }

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({ id, status: "capturing", createdAt: now, updatedAt: now });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Session creation failed." },
      { status: 500 }
    );
  }
}
