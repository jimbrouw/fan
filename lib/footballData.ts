export type FootballDataTeamId =
  | "arsenal"
  | "aston-villa"
  | "bournemouth"
  | "brentford"
  | "brighton"
  | "burnley"
  | "chelsea"
  | "crystal-palace"
  | "everton"
  | "fulham"
  | "leeds"
  | "liverpool"
  | "man-city"
  | "man-united"
  | "newcastle"
  | "nottingham-forest"
  | "sunderland"
  | "tottenham"
  | "west-ham"
  | "wolves";

export const footballDataTeamIds: Partial<Record<string, number>> = {
  "arsenal": 57,
  "aston-villa": 58,
  "bournemouth": 1044,
  "brentford": 402,
  "brighton": 397,
  "burnley": 328,
  "chelsea": 61,
  "crystal-palace": 354,
  "everton": 62,
  "fulham": 63,
  "leeds": 341,
  "liverpool": 64,
  "man-city": 65,
  "man-united": 66,
  "newcastle": 67,
  "nottingham-forest": 351,
  "sunderland": 71,
  "tottenham": 73,
  "west-ham": 563,
  "wolves": 76,
};

type FootballDataSquadMember = {
  name?: string;
  position?: string | null;
};

type FootballDataTeamResponse = {
  name?: string;
  squad?: FootballDataSquadMember[];
};

type FootballDataMatchResponse = {
  matches?: Array<{
    utcDate?: string;
    homeTeam?: { name?: string };
    awayTeam?: { name?: string };
  }>;
};

export type TeamNewsSummary = {
  teamName: string;
  squadNames: string[];
  latestMatch?: string;
};

const footballDataBaseUrl = "https://api.football-data.org/v4";

function footballDataHeaders(apiKey: string) {
  return { "X-Auth-Token": apiKey };
}

async function footballDataJson<T>(path: string, apiKey: string): Promise<T> {
  const response = await fetch(`${footballDataBaseUrl}${path}`, {
    headers: footballDataHeaders(apiKey),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`football-data.org request failed: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchTeamNewsSummary(teamId: string, apiKey: string): Promise<TeamNewsSummary> {
  const providerTeamId = footballDataTeamIds[teamId];
  if (!providerTeamId) {
    throw new Error(`No football-data.org team mapping for ${teamId}.`);
  }

  const [team, matches] = await Promise.all([
    footballDataJson<FootballDataTeamResponse>(`/teams/${providerTeamId}`, apiKey),
    footballDataJson<FootballDataMatchResponse>(`/teams/${providerTeamId}/matches?status=FINISHED&limit=1`, apiKey),
  ]);

  const latest = matches.matches?.[0];
  const latestMatch = latest?.homeTeam?.name && latest.awayTeam?.name && latest.utcDate
    ? `${latest.utcDate.slice(0, 10)} ${latest.homeTeam.name} vs ${latest.awayTeam.name}`
    : undefined;

  return {
    teamName: team.name ?? teamId,
    squadNames: (team.squad ?? [])
      .map((player) => player.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 24),
    latestMatch,
  };
}

export function buildMatchdayNotesFromTeamNews(input: {
  opponent: TeamNewsSummary;
  selectedTeam: TeamNewsSummary;
}) {
  const opponentPlayers = input.opponent.squadNames.slice(0, 18).join(", ");
  const selectedPlayers = input.selectedTeam.squadNames.slice(0, 12).join(", ");
  const latestMatch = input.opponent.latestMatch ? ` Latest ${input.opponent.teamName} match: ${input.opponent.latestMatch}.` : "";

  return [
    `Allowed ${input.opponent.teamName} players: ${opponentPlayers || "current first-team squad only"}.`,
    `Allowed ${input.selectedTeam.teamName} context players: ${selectedPlayers || "current first-team squad only"}.`,
    `Do not show players not in the current squads.${latestMatch}`
  ].join(" ").slice(0, 420);
}
