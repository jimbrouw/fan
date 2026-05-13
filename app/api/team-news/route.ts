import { NextResponse } from "next/server";
import { buildMatchdayNotesFromTeamNews, fetchTeamNewsSummaryWithFallback } from "@/lib/footballData";

export async function GET(request: Request) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const url = new URL(request.url);
  const selectedTeamId = url.searchParams.get("selectedTeamId");
  const opponentTeamId = url.searchParams.get("opponentTeamId");

  if (!selectedTeamId || !opponentTeamId) {
    return NextResponse.json(
      { error: "Missing selectedTeamId or opponentTeamId." },
      { status: 400 }
    );
  }

  try {
    const [selectedTeam, opponent] = await Promise.all([
      fetchTeamNewsSummaryWithFallback(selectedTeamId, apiKey),
      fetchTeamNewsSummaryWithFallback(opponentTeamId, apiKey),
    ]);

    return NextResponse.json({
      notes: buildMatchdayNotesFromTeamNews({ selectedTeam, opponent }),
      selectedTeam,
      opponent,
      source: selectedTeam.source === "live" && opponent.source === "live" ? "live" : "fallback",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Live squad data is temporarily unavailable." },
      { status: 502 }
    );
  }
}
