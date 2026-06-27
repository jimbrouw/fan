import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET — get event state (called portrait IDs)
export async function GET(_request: Request, { params }: { params: Promise<{ eventCode: string }> }) {
  try {
    const { eventCode } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("bingo_events")
      .select("code, called_portrait_ids")
      .eq("code", eventCode)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      code: eventCode,
      calledPortraitIds: data?.called_portrait_ids ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load event.";
    console.error("[bingo/events GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
