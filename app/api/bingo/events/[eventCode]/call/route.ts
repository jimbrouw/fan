import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// POST — host calls a portrait (adds it to called_portrait_ids)
export async function POST(request: Request, { params }: { params: Promise<{ eventCode: string }> }) {
  try {
    const { eventCode } = await params;
    const { portraitId } = (await request.json()) as { portraitId: string };

    if (!portraitId) return NextResponse.json({ error: "Missing portraitId." }, { status: 400 });

    const supabase = createServerSupabaseClient();

    // Upsert event then append portrait ID if not already in the array
    await supabase.from("bingo_events").upsert({ code: eventCode }, { onConflict: "code" });

    const { data, error } = await supabase.rpc("bingo_call_portrait", {
      p_event_code: eventCode,
      p_portrait_id: portraitId,
    });

    if (error) {
      // Fallback: fetch current array and append manually
      const { data: event } = await supabase
        .from("bingo_events")
        .select("called_portrait_ids")
        .eq("code", eventCode)
        .single();

      const current: string[] = event?.called_portrait_ids ?? [];
      if (!current.includes(portraitId)) {
        const { error: updateError } = await supabase
          .from("bingo_events")
          .update({ called_portrait_ids: [...current, portraitId] })
          .eq("code", eventCode);
        if (updateError) throw new Error(updateError.message);
      }
    }

    // Return updated list
    const { data: updated } = await supabase
      .from("bingo_events")
      .select("called_portrait_ids")
      .eq("code", eventCode)
      .single();

    return NextResponse.json({ calledPortraitIds: updated?.called_portrait_ids ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to call portrait.";
    console.error("[bingo/events/call POST]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
