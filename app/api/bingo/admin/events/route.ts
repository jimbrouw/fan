import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PortraitRow = { event_code: string; player_name: string; id: string };
type EventRow = { code: string; called_portrait_ids: string[]; created_at: string };

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const [{ data: events, error: eventsError }, { data: portraits, error: portraitsError }] =
      await Promise.all([
        supabase
          .from("bingo_events")
          .select("code, called_portrait_ids, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("bingo_portraits").select("event_code, player_name, id"),
      ]);

    if (eventsError) throw new Error(eventsError.message);
    if (portraitsError) throw new Error(portraitsError.message);

    // Group portraits by event_code
    const byEvent = new Map<string, PortraitRow[]>();
    for (const p of (portraits ?? []) as PortraitRow[]) {
      const list = byEvent.get(p.event_code) ?? [];
      list.push(p);
      byEvent.set(p.event_code, list);
    }

    const result = ((events ?? []) as EventRow[]).map((event) => {
      const eventPortraits = byEvent.get(event.code) ?? [];
      const playerCount = new Set(eventPortraits.map((p) => p.player_name)).size;
      return {
        code: event.code,
        portraitCount: eventPortraits.length,
        playerCount,
        calledCount: event.called_portrait_ids?.length ?? 0,
        createdAt: event.created_at,
      };
    });

    return NextResponse.json({ events: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load events.";
    console.error("[bingo/admin/events GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code?: string };

    if (!code || !/^[A-Z0-9]+$/.test(code) || code.length > 12) {
      return NextResponse.json(
        { error: "Event code must be 1–12 uppercase letters and numbers." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("bingo_events")
      .upsert({ code }, { onConflict: "code" });

    if (error) throw new Error(error.message);

    return NextResponse.json({ code });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create event.";
    console.error("[bingo/admin/events POST]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
