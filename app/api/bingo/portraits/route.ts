import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// POST — save a completed portrait
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      eventCode: string;
      playerName: string;
      jobId: string;
      outputUrl: string;
    };

    const { eventCode, playerName, jobId, outputUrl } = body;
    if (!eventCode || !playerName || !jobId || !outputUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Upsert the event so it exists
    await supabase.from("bingo_events").upsert({ code: eventCode }, { onConflict: "code" });

    // Save portrait
    const { data, error } = await supabase
      .from("bingo_portraits")
      .insert({ event_code: eventCode, player_name: playerName, job_id: jobId, output_url: outputUrl })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ portraitId: data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save portrait.";
    console.error("[bingo/portraits POST]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — list all portraits for an event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventCode = searchParams.get("eventCode");
    if (!eventCode) return NextResponse.json({ error: "Missing eventCode." }, { status: 400 });

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_portraits")
      .select("id, player_name, output_url, job_id")
      .eq("event_code", eventCode)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({ portraits: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load portraits.";
    console.error("[bingo/portraits GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
