import type { KitSpec } from "../kitSpecs.ts";
import type { PosterStyle } from "../posterTemplates.ts";
import type { TeamProfile } from "../teamProfiles.ts";
import { formatCorrectionInstructions, parseCorrectionPrompt } from "./corrections.ts";

export type MatchSide = "home" | "away";

export type MatchTeamPromptProfile = Pick<TeamProfile, "name" | "primary" | "accent" | "kitNotes" | "group" | "nickname" | "visualMotifs"> & {
  id: string;
  kitVariant: KitSpec["variant"];
};

export type MatchContext = {
  homeTeam: MatchTeamPromptProfile;
  awayTeam: MatchTeamPromptProfile;
  userSide: MatchSide;
  opponentMode: "club-players" | "another-person";
  opponentSourceImageUrl?: string;
  matchdayNotes?: string;
};

export type KitBrandPlacementMode = "original" | "kitface";

export function normalizeKitBrandPlacementMode(value?: string | null): KitBrandPlacementMode {
  return value === "original" ? "original" : "kitface";
}

function sponsorSummary(spec: KitSpec, mode: KitBrandPlacementMode) {
  return mode === "kitface"
    ? "main chest sponsor replaced with exact text kitface.app"
    : `sponsor ${spec.mainSponsor}`;
}

function sponsorPlacementSummary(spec: KitSpec, mode: KitBrandPlacementMode) {
  if (mode === "original") return spec.sponsorPlacement;
  if (spec.sponsorPlacement === "unknown") return "kitface.app sponsor centered on the shirt front in authentic football sponsor style";
  return `${spec.sponsorPlacement}; replace only the main sponsor artwork/text with kitface.app`;
}

function kitfaceBrandPlacementInstruction(mode: KitBrandPlacementMode, matchContext?: MatchContext) {
  if (mode === "original") {
    return "BRAND PLACEMENT MODE: Original kit sponsors. Keep the real main shirt sponsor from the kit reference or written kit profile.";
  }

  return `BRAND PLACEMENT MODE: Kitface sponsor experiment.
Shirt sponsor: replace the real main chest sponsor with exact text "kitface.app"${matchContext ? " on both home and away kits" : " on every visible kit front"}. Match the original sponsor's placement, scale, colour treatment, material, and logo style so it looks like an authentic football shirt sponsor integrated into the fabric. Preserve crest, manufacturer logo, sleeve sponsor, kit pattern, collar, shorts, socks, and team colours. Do not show the original main sponsor text.
Stadium boards: add a few realistic pitch-side LED advertising boards reading exactly "kitface.app". Keep them small, background-level, and integrated into the stadium; they must not become poster titles, foreground banners, or text over faces.
Do not invent other readable brand names, slogans, or random advertising text.`;
}

function compactKitSpec(spec: KitSpec, options: { includeLogoPlacement?: boolean; brandPlacementMode?: KitBrandPlacementMode } = {}) {
  const brandPlacementMode = options.brandPlacementMode ?? "original";
  const parts = [
    `${spec.season} ${spec.team} ${spec.variant}`,
    spec.manufacturer,
    sponsorSummary(spec, brandPlacementMode),
    spec.sleeveSponsor ? `Sleeve: ${spec.sleeveSponsor}` : undefined,
    spec.baseColor,
    spec.pattern,
    spec.collar,
    options.includeLogoPlacement ? `crest ${spec.crestPlacement}` : undefined,
    options.includeLogoPlacement ? `sponsor placement ${sponsorPlacementSummary(spec, brandPlacementMode)}` : undefined,
    spec.shorts,
    spec.socks
  ];

  return parts.filter(Boolean).join("; ");
}

function compactMatchKitSpec(spec: KitSpec, brandPlacementMode: KitBrandPlacementMode) {
  return [
    `${spec.season} ${spec.team} ${spec.variant}`,
    spec.manufacturer,
    sponsorSummary(spec, brandPlacementMode),
    spec.baseColor,
    spec.pattern
  ].join("; ");
}

function compactMatchdayNotes(notes?: string) {
  return notes?.replace(/\s+/g, " ").trim().slice(0, 420);
}

function kitReferenceInstruction(spec: KitSpec) {
  return spec.referenceImageUrl
    ? "Use the attached kit reference image as the source of truth."
    : "No kit reference image is attached; follow the written kit profile exactly.";
}

export function buildPosterPrompt(input: {
  teamProfile: Pick<TeamProfile, "name" | "primary" | "accent" | "kitNotes" | "trophy" | "group" | "nickname" | "visualMotifs">;
  posterStyle: PosterStyle;
  kitSpec?: KitSpec;
  homeKitSpec?: KitSpec;
  awayKitSpec?: KitSpec;
  matchContext?: MatchContext;
  model?: string;
  correctionPrompt?: string;
  brandPlacementMode?: KitBrandPlacementMode;
  shirtName?: string;
  teamSlogan?: string;
  accessibilityNote?: string;
}): string {
  const brandPlacementMode = input.brandPlacementMode ?? "original";
  const isNanoBanana = input.model === "nano-banana-2";
  const isGptImage = input.model === "gpt-image-2" || input.model === "gpt-image-2-fast";
  const isNationalTeam = input.teamProfile.group === "International" || input.teamProfile.group === "World Cup 2026";
  const matchContext = input.matchContext;
  const isPremierLeagueMatch = matchContext?.homeTeam.group === "Premier League" && matchContext.awayTeam.group === "Premier League";
  const userMatchTeam = matchContext?.userSide === "away" ? matchContext.awayTeam : matchContext?.homeTeam;
  const opponentMatchTeam = matchContext
    ? matchContext.userSide === "away"
      ? matchContext.homeTeam
      : matchContext.awayTeam
    : undefined;
  const matchdayNotes = compactMatchdayNotes(matchContext?.matchdayNotes);
  const moodTeam = userMatchTeam ?? input.teamProfile;
  const motifNotes = [
    moodTeam.nickname ? `Nickname: ${moodTeam.nickname}.` : undefined,
    moodTeam.visualMotifs?.length ? `Optional playful visual motifs: ${moodTeam.visualMotifs.join(", ")}.` : undefined
  ].filter(Boolean).join(" ");
  const matchdaySection = matchdayNotes
    ? `MATCHDAY SQUAD NOTES:
${matchdayNotes}
Only depict named real opposition players.`
    : "Use anonymous current-squad-style opponents unless matchday notes name players.";
  const matchSection = matchContext && userMatchTeam && opponentMatchTeam
    ? `MATCH:
Competition: ${isPremierLeagueMatch ? "Premier League" : `${matchContext.homeTeam.group} vs ${matchContext.awayTeam.group}`}.
LEFT SIDE: ${matchContext.homeTeam.name}, the HOME side, wearing the ${matchContext.homeTeam.kitVariant} kit.
RIGHT SIDE: ${matchContext.awayTeam.name}, the AWAY side, wearing the ${matchContext.awayTeam.kitVariant} kit.
Primary reference person [img1] plays for ${userMatchTeam.name}; never apply [img1] to ${opponentMatchTeam.name}.
${matchContext.opponentMode === "another-person"
  ? `Secondary reference person [img2] plays for ${opponentMatchTeam.name}; use [img2] for exactly one opposing feature player only.`
  : "Opposing club players have varied non-reference faces."}
${matchdaySection}
Home kit: ${input.homeKitSpec ? compactMatchKitSpec(input.homeKitSpec, brandPlacementMode) : matchContext.homeTeam.kitNotes}
Away kit: ${input.awayKitSpec ? compactMatchKitSpec(input.awayKitSpec, brandPlacementMode) : matchContext.awayTeam.kitNotes}
Opponent colours: ${opponentMatchTeam.primary}, ${opponentMatchTeam.accent}`
    : "";
  const kitSection = input.kitSpec
    ? `KIT ACCURACY MANDATE:
Render the official ${input.kitSpec.season} ${input.kitSpec.team} ${input.kitSpec.variant} kit.
${kitReferenceInstruction(input.kitSpec)}
${compactKitSpec(input.kitSpec, { includeLogoPlacement: !matchContext || isNanoBanana, brandPlacementMode })}
Do not change season, ${brandPlacementMode === "kitface" ? "Kitface sponsor replacement" : "sponsor"}, maker, pattern, shorts, or socks.`
    : `Kit styling for ${input.teamProfile.name} (${input.teamProfile.group}):
${input.teamProfile.kitNotes}
Colors: Primary ${input.teamProfile.primary}, Accent ${input.teamProfile.accent}
Render as a modern football kit with realistic fabric, stitching, and emblems.`;
  const brandPlacementSection = kitfaceBrandPlacementInstruction(brandPlacementMode, matchContext);

  const identityMandate = matchContext
    ? matchContext.opponentMode === "another-person"
      ? `IDENTITY MANDATE:
The first person reference [img1] is the selected side person for ${userMatchTeam?.name ?? input.teamProfile.name}.
The second person reference [img2] is the opposing feature player for ${opponentMatchTeam?.name ?? "the opposition"}.
Never blend identities, never swap sides, and never apply [img1] to the opposition or [img2] to the selected side.`
      : `IDENTITY MANDATE:
Every featured ${userMatchTeam?.name ?? input.teamProfile.name} player must match [img1]. Use [img1] only for that side, never the opposition.`
    : `IDENTITY MANDATE:
Every face must match the reference person [img]: bone structure, eyes, nose, and unique facial features. [img] is the only subject identity.`;

  const hasKitReference = Boolean(input.kitSpec?.referenceImageUrl || input.homeKitSpec?.referenceImageUrl || input.awayKitSpec?.referenceImageUrl);
  const kitReferencePhrase = hasKitReference
    ? "Kit reference images are for shirts only: sponsor logo, crest, manufacturer, pattern, collar, shorts, and socks."
    : "Written kit details are for shirts only: sponsor logo, crest, manufacturer, pattern, collar, shorts, and socks.";
  const referencePriority = matchContext
    ? `REFERENCE PRIORITY:
First person image = [img1]. ${matchContext.opponentMode === "another-person" ? "Second person image = [img2]. " : ""}${kitReferencePhrase} Do not blend kit-reference or pro-player faces into [img1].`
    : `REFERENCE PRIORITY:
The first attached image is the identity source for [img]. ${kitReferencePhrase} Do not blend kit-reference faces or professional player faces into [img].`;
  const flatteringAthleticDirection = `KIND ATHLETIC PRESENTATION:
Preserve the person's recognisable build, age, and identity, but present them kindly in a football-poster way: confident upright posture, slightly athletic stance, flattering kit fit, clean neckline, strong shoulders, natural chin angle, and dynamic action poses. Avoid unflattering compression, slouching, awkward double-chin emphasis, squeezed shirt fabric, or harsh low-angle body distortion. Do not make them unrealistically ripped, skinny, young, or transformed into a professional athlete.`;

  const compositionSection = matchContext
    ? `Photorealistic ${isPremierLeagueMatch ? "Premier League" : "football league"} VS poster. Home LEFT, away RIGHT.

${matchSection}

COMPOSITION & POSES:
Use [img1] only for ${userMatchTeam?.name ?? input.teamProfile.name} on the ${matchContext.userSide === "away" ? "RIGHT" : "LEFT"} side: centre portrait plus action poses. Opponents stay ${matchContext.userSide === "away" ? "LEFT" : "RIGHT"}. ${matchContext.opponentMode === "another-person" ? "Use [img2] for one opposing feature player." : ""} Do not swap sides.`
    : `Modern football ${isNationalTeam ? "tournament" : "league"} poster, surrounded by multiple versions of [img] in different athletic poses and kit colours.

COMPOSITION & POSES:
Use the same [img] face in every pose: close-up centre portrait, triumphant shouting pose, thoughtful captain pose, running and celebrating figures. Do not include a trophy, cup, or medal as a central prop.`;

  const modelDirection = isNanoBanana
    ? `NANO BANANA MODEL DIRECTION:
Make this a joyful, funny, celebratory fan media-day poster, not a stern professional lineup collage. Identity accuracy is more important than the smile or pose: preserve the reference person's head shape, baldness or hairline, eyes, nose, mouth shape, cheeks, jaw, skin texture, facial hair, age, and body type. The central hero should have a natural proud smile that still looks exactly like the reference person, not a generic smiling replacement face. Supporting poses can be playful and over-the-top: laughing, roaring with joy, arms raised, fist pump, kneeslide, or cheeky badge-kiss energy. If exact identity would suffer, use fewer supporting figures rather than inventing a new face.

${flatteringAthleticDirection}

Use a premium football broadcast environment: bright stadium atmosphere with curved stands and crowd texture, clean floodlit pitch, vibrant matchday energy, electric gradient light forms across the environment. The composition should feel like official sports campaign photography — sharp, premium, broadcast-quality. The people, pitch, lights, and crowd must feel integrated in one scene. Reproduce the shirt sponsor as the exact logo style from the kit reference, not plain typed text or a generic font. No plain studio background. No dark moody fog. No shadowy back-lit cinema look. No large poster title text, slogan text, fake readable banners, random advertising boards, old sponsors, trophies, cups, medals, or isolated cutout collage.`
    : isGptImage
      ? `GPT IMAGE 2 DIRECTION:
Use GPT Image 2's stronger prompt adherence to build a premium but intentionally funny football media-day poster. The mood should feel like the best day of the fan's life, as if they have just won the biggest match of their life: joyful, comedic, over-the-top, broad grins, laughing, arms raised, playful fist pumps, kneeslide celebration, badge-kiss pride, confetti-like atmosphere, warm internet-football humour, and a tiny controlled dose of lovable AI absurdity. Keep it family-friendly, polished, and emotionally light.

IDENTITY LOCK:
The reference person is the hero. Preserve the reference person's recognisable likeness across every repeated version: head shape, baldness or hairline, eyes, nose, mouth shape, cheeks, jaw, skin texture, facial hair, age, and body type. Expressions may become happier and more theatrical, but the person must still clearly look like the source photo. Do not average the face with professional players, kit-reference models, or generic footballer faces.

${flatteringAthleticDirection}

COMPOSITION:
Use one large central hero portrait with a joyful proud grin, plus smaller supporting versions doing funny match-winning celebrations. Keep the repeated figures readable and intentionally poster-like, not chaotic. If identity starts to drift, use fewer repeated figures and make the central portrait more accurate.

${matchContext
  ? `MATCHDAY VS HANDLING:
The selected-side fan figure is the hero. Opposition or matchday players are secondary scene elements only. Do not put the reference person's face on opposition players. Use opposition figures as smaller, less prominent, non-reference footballers with clear side separation. Avoid making real players look like distorted copies of the fan.`
  : "SINGLE-TEAM HANDLING:\nEvery human figure that represents the hero fan should use the same reference identity. Do not introduce unrelated celebrity or professional-player faces."}

KIT AND LOGO ACCURACY:
Treat kit references as shirt references only. Keep sponsor, crest, manufacturer, collar, shirt pattern, sleeve sponsor, shorts, and socks accurate. If the shirt front is visible, show the correct sponsor logo; do not leave the main central shirt blank.

${motifNotes ? `CLUB PERSONALITY:\nUse club personality lightly: ${motifNotes} These should be subtle environmental jokes or background atmosphere cues, not literal mascots, not large text, and not the main subject.` : ""}

NEGATIVE PROMPT:
No generic replacement face. No face averaging. No beautified stranger. No unrealistic body transformation. No body-shaming caricature. No exaggerated belly, double chin, or squeezed kit. No stern police-lineup expression. No dead-eyed serious portrait. No missing sponsor on visible shirt fronts. No fake sponsor font. No random readable poster titles. No slogan text. No malformed hands. No extra fingers. No warped limbs. No duplicate half-faces. No melted facial features. No chaotic AI slop. No scary or aggressive mood. No literal mascot costume. No giant nickname text. No applying the fan face to opposition players.`
    : "";
  const moodSection = !matchContext || isNanoBanana || isGptImage
    ? `MOOD:
Joyful, funny, best-day-of-your-life winning energy; proud warm expressions, preserve identity.
${motifNotes ? `Club personality: ${motifNotes} Subtle background cues only.` : ""}`
    : "";

  const personalisationSection = (input.shirtName || input.teamSlogan)
    ? `PERSONALISATION:
${input.shirtName ? `Shirt name: print "${input.shirtName.toUpperCase()}" in authentic football shirt-printing style on the back of the shirt. Keep it consistent with the kit typography.` : ""}
${input.teamSlogan ? `Team slogan: weave "${input.teamSlogan}" subtly into the scene — as a crowd banner, stadium board, or background environmental text. Do not make it the poster title or overlay it over faces.` : ""}`.trim()
    : "";

  const accessibilitySection = input.accessibilityNote
    ? `ACCESSIBILITY:
The fan uses a wheelchair or mobility aid. Represent them naturally and with dignity — seated in a customised kit wheelchair on the pitch or sideline, or integrated into the scene as they are. Do not force a standing or running pose. Do not distort, minimise, or exclude the wheelchair. Preserve full identity.${input.accessibilityNote.trim() ? ` Additional note: ${input.accessibilityNote.trim()}` : ""}`
    : "";

  const correctionSection = input.correctionPrompt
    ? `\n\n${formatCorrectionInstructions(parseCorrectionPrompt(input.correctionPrompt))}`
    : "";

  return `${identityMandate}

SCENE:
Photorealistic ${isNationalTeam ? "National Team" : "League"} football poster collage. ${isNanoBanana || isGptImage ? "Bright premium broadcast stadium, clean floodlit pitch, vibrant crowd energy, light editorial composition with translucent electric gradient forms." : "Premium football broadcast graphics, clean light editorial layout, electric lime-to-cyan energy forms, translucent diagonal beams, white/light-grey sports campaign background."}

${compositionSection}

${referencePriority}

${moodSection}

${kitSection}

${brandPlacementSection}

${personalisationSection ? `${personalisationSection}\n\n` : ""}${accessibilitySection ? `${accessibilitySection}\n\n` : ""}${modelDirection}

Style:
${input.posterStyle.name}. Kits from ${input.teamProfile.name}${matchContext && opponentMatchTeam ? `, opposition colours from ${opponentMatchTeam.name}` : ""}. Subtle ${input.teamProfile.primary}/${input.teamProfile.accent} accents.

CRITICAL RESTRICTIONS:
* NO altering of the face from ${matchContext ? "[img1]" : "[img]"}
${isNanoBanana ? "* NO generic replacement face, generic smile, face averaging, beautification, or identity drift" : ""}
${isNanoBanana || isGptImage ? "* NO unrealistic body transformation, body-shaming caricature, exaggerated belly, double chin, or squeezed kit" : ""}
${matchContext ? "* NO applying [img1]'s face to opposition players" : ""}
${matchContext?.opponentMode === "another-person" ? "* NO applying [img2]'s face to the selected side" : ""}
${matchContext ? "* NO swapping home and away sides; home is left, away is right" : ""}
* NO trophies, cups, medals, trophy ribbons, cup finals, or central silverware props
${isPremierLeagueMatch ? "* NO Champions League, European Cup, FA Cup, World Cup, or UEFA badges" : ""}
${brandPlacementMode === "kitface"
  ? '* NO text except realistic shirt numbers, crests, maker logos, sleeve sponsor logos, and exact "kitface.app" text on shirt sponsors and subtle pitch-side LED boards'
  : "* NO text except exact realistic shirt numbers, crests, maker logos, and sponsor logos from the kit reference"}
* NO cartoon style
${isNanoBanana ? "* NO stern blank central expression; make the fan joyful, proud, and celebratory" : ""}
* Realistic sports photography aesthetic${correctionSection}`;
}
