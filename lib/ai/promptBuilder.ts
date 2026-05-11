import type { KitSpec } from "../kitSpecs.ts";
import type { PosterStyle } from "../posterTemplates.ts";
import type { TeamProfile } from "../teamProfiles.ts";

export type MatchSide = "home" | "away";

export type MatchTeamPromptProfile = Pick<TeamProfile, "name" | "primary" | "accent" | "kitNotes" | "group"> & {
  kitVariant: KitSpec["variant"];
};

export type MatchContext = {
  homeTeam: MatchTeamPromptProfile;
  awayTeam: MatchTeamPromptProfile;
  userSide: MatchSide;
  opponentMode: "club-players" | "another-person";
  matchdayNotes?: string;
};

function compactKitSpec(spec: KitSpec) {
  return [
    `Maker: ${spec.manufacturer}`,
    `Sponsor: ${spec.mainSponsor}`,
    spec.sleeveSponsor ? `Sleeve: ${spec.sleeveSponsor}` : undefined,
    `Base: ${spec.baseColor}`,
    `Pattern: ${spec.pattern}`,
    `Collar: ${spec.collar}`,
    `Crest: ${spec.crestPlacement}`,
    `Shorts: ${spec.shorts}`,
    `Socks: ${spec.socks}`
  ].filter(Boolean).join("; ");
}

function compactMatchdayNotes(notes?: string) {
  return notes?.replace(/\s+/g, " ").trim().slice(0, 420);
}

export function buildPosterPrompt(input: {
  teamProfile: Pick<TeamProfile, "name" | "primary" | "accent" | "kitNotes" | "trophy" | "group">;
  posterStyle: PosterStyle;
  kitSpec?: KitSpec;
  matchContext?: MatchContext;
}): string {
  const isNationalTeam = input.teamProfile.group === "International" || input.teamProfile.group === "World Cup 2026";
  const trophyDescription = input.teamProfile.trophy
    ? `the official ${input.teamProfile.trophy} situated prominently in the composition`
    : "a large central silver football trophy";
  const matchContext = input.matchContext;
  const userMatchTeam = matchContext?.userSide === "away" ? matchContext.awayTeam : matchContext?.homeTeam;
  const opponentMatchTeam = matchContext
    ? matchContext.userSide === "away"
      ? matchContext.homeTeam
      : matchContext.awayTeam
    : undefined;
  const matchdayNotes = compactMatchdayNotes(matchContext?.matchdayNotes);
  const matchdaySection = matchdayNotes
    ? `MATCHDAY SQUAD NOTES:
${matchdayNotes}
Do not depict recognizable real opposition players unless named in matchday notes.`
    : "Do not depict recognizable real opposition players unless named in matchday notes; use anonymous current-squad-style opponents.";
  const matchSection = matchContext && userMatchTeam && opponentMatchTeam
    ? `VS MATCH CONTEXT:
${matchContext.homeTeam.name} are the home side in ${matchContext.homeTeam.kitVariant} kit.
${matchContext.awayTeam.name} are the away side in ${matchContext.awayTeam.kitVariant} kit.
The reference person [img] plays for ${userMatchTeam.name}.
The opposition is ${opponentMatchTeam.name}; opposition players must not use the reference face.
${matchContext.opponentMode === "another-person"
  ? "Include one distinct opposing feature player with a non-reference face."
  : "Use a believable group of opposing club players with varied non-reference faces."}
${matchdaySection}
Opponent kit: ${opponentMatchTeam.kitNotes}
Opponent colours: ${opponentMatchTeam.primary}, ${opponentMatchTeam.accent}`
    : "";
  const kitSection = input.kitSpec
    ? `KIT ACCURACY MANDATE:
Render the official ${input.kitSpec.season} ${input.kitSpec.team} ${input.kitSpec.variant} kit.
Use the attached kit reference image as the source of truth.
${compactKitSpec(input.kitSpec)}
Do not change the season, sponsor, manufacturer, crest layout, pattern, shorts, or socks.`
    : `Kit styling for ${input.teamProfile.name} (${input.teamProfile.group}):
${input.teamProfile.kitNotes}
Colors: Primary ${input.teamProfile.primary}, Accent ${input.teamProfile.accent}
Render as a modern football kit with realistic fabric, stitching, and emblems.`;

  const identityMandate = matchContext
    ? `IDENTITY MANDATE:
Every featured ${userMatchTeam?.name ?? input.teamProfile.name} player on the selected side must match the reference person [img]: bone structure, eyes, nose, and unique facial features. Use [img] only for the selected side. Do not apply [img] to the opposition.`
    : `IDENTITY MANDATE:
Every face must match the reference person [img]: bone structure, eyes, nose, and unique facial features. [img] is the only subject identity.`;

  const compositionSection = matchContext
    ? `Modern football league VS poster: ${trophyDescription}. Stage ${userMatchTeam?.name ?? input.teamProfile.name} and ${opponentMatchTeam?.name ?? "the opposition"} as opposing sides in a dramatic matchday composition.

${matchSection}

COMPOSITION & POSES:
Use [img] repeatedly for ${userMatchTeam?.name ?? input.teamProfile.name}: close-up centre portrait, triumphant shouting pose, thoughtful captain pose. Opposing players stay on the other side with distinct non-reference faces.`
    : `Modern football ${isNationalTeam ? "tournament" : "league"} poster: ${trophyDescription}, surrounded by multiple versions of [img] in different athletic poses and kit colours.

COMPOSITION & POSES:
Use the same [img] face in every pose: close-up centre portrait, triumphant shouting pose, thoughtful captain pose, running and celebrating figures.`;

  return `${identityMandate}

SCENE:
Photorealistic ${isNationalTeam ? "National Team" : "League"} football poster collage. Off-white background, subtle haze, premium sports lighting, layered cut-out portraits, dynamic overlap.

${compositionSection}

${kitSection}

Lighting:
Bright stadium lighting, subtle rim light, clean facial definition on [img].

Style:
${input.posterStyle.name} - ${input.posterStyle.description}. Official ${isNationalTeam ? "International Tournament" : "Premier League"} launch poster.

Textures:
Realistic skin texture, sweat, sharp fabric, stitching, embroidered badges.

Camera aesthetic:
Medium portraits, action poses, telephoto sports photography.

Colour palette:
* Kits from ${input.teamProfile.name}
${matchContext && opponentMatchTeam ? `* Opposition colours from ${opponentMatchTeam.name}` : ""}
* subtle ${input.teamProfile.primary} and ${input.teamProfile.accent} accents
* silver trophy reflections
* soft atmospheric haze matching team colors

CRITICAL RESTRICTIONS:
* NO altering of the face from [img]
${matchContext ? "* NO applying [img]'s face to opposition players" : ""}
* NO "beautification" or generic AI face smoothing
* NO text except realistic shirt numbers/logos
* NO cartoon style
* NO AI-art distortion
* Realistic sports photography aesthetic`;
}
