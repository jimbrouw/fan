import { getTeamProfile } from "./teamProfiles.ts";

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
  | "wolves"
  | "canada"
  | "mexico"
  | "usa"
  | "australia"
  | "iraq"
  | "iran"
  | "japan"
  | "jordan"
  | "south-korea"
  | "qatar"
  | "saudi-arabia"
  | "uzbekistan"
  | "algeria"
  | "cabo-verde"
  | "congo-dr"
  | "cote-divoire"
  | "egypt"
  | "ghana"
  | "morocco"
  | "senegal"
  | "south-africa"
  | "tunisia"
  | "curacao"
  | "haiti"
  | "panama"
  | "argentina"
  | "brazil"
  | "colombia"
  | "ecuador"
  | "paraguay"
  | "uruguay"
  | "new-zealand"
  | "austria"
  | "belgium"
  | "bosnia"
  | "croatia"
  | "czechia"
  | "england-wc"
  | "france"
  | "germany"
  | "netherlands"
  | "norway"
  | "portugal"
  | "scotland"
  | "spain"
  | "sweden"
  | "switzerland"
  | "turkiye";

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
  "canada": 828,
  "mexico": 769,
  "usa": 771,
  "australia": 779,
  "iraq": 8062,
  "iran": 840,
  "japan": 766,
  "jordan": 8049,
  "south-korea": 772,
  "qatar": 8030,
  "saudi-arabia": 801,
  "uzbekistan": 8070,
  "algeria": 778,
  "cabo-verde": 1930,
  "congo-dr": 1934,
  "cote-divoire": 1935,
  "egypt": 825,
  "ghana": 763,
  "morocco": 815,
  "senegal": 804,
  "south-africa": 774,
  "tunisia": 802,
  "curacao": 9460,
  "haiti": 836,
  "panama": 1836,
  "argentina": 762,
  "brazil": 764,
  "colombia": 818,
  "ecuador": 791,
  "paraguay": 761,
  "uruguay": 758,
  "new-zealand": 783,
  "austria": 816,
  "belgium": 805,
  "croatia": 799,
  "czechia": 798,
  "england-wc": 770,
  "france": 773,
  "germany": 759,
  "netherlands": 8601,
  "norway": 8872,
  "portugal": 765,
  "scotland": 8873,
  "spain": 760,
  "sweden": 792,
  "switzerland": 788,
  "turkiye": 803,
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
  source: "live" | "fallback";
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
    source: "live",
  };
}

export function buildFallbackTeamNewsSummary(teamId: string): TeamNewsSummary {
  const team = getTeamProfile(teamId);

  return {
    teamName: team.name,
    squadNames: [],
    source: "fallback",
  };
}

export async function fetchTeamNewsSummaryWithFallback(teamId: string, apiKey?: string): Promise<TeamNewsSummary> {
  if (!apiKey || !footballDataTeamIds[teamId]) {
    return buildFallbackTeamNewsSummary(teamId);
  }

  try {
    return await fetchTeamNewsSummary(teamId, apiKey);
  } catch (error) {
    console.error(error);
    return buildFallbackTeamNewsSummary(teamId);
  }
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
