import { NextResponse } from "next/server";
import { buildMatchdayNotesFromTeamNews, fetchTeamNewsSummary } from "@/lib/footballData";

export async function GET(request: Request) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing FOOTBALL_DATA_API_KEY environment variable." },
      { status: 503 }
    );
  }

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
      fetchTeamNewsSummary(selectedTeamId, apiKey),
      fetchTeamNewsSummary(opponentTeamId, apiKey),
    ]);

    return NextResponse.json({
      notes: buildMatchdayNotesFromTeamNews({ selectedTeam, opponent }),
      selectedTeam,
      opponent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Team news lookup failed." },
      { status: 502 }
    );
  }
}
