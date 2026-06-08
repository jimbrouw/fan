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
  const isFootballCardStyle = input.posterStyle.id === "hero-card";
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
${isGptImage ? `Use [img1] only for ${userMatchTeam?.name ?? input.teamProfile.name} on the ${matchContext.userSide === "away" ? "RIGHT" : "LEFT"} side. Make one huge chest-up selected-side hero portrait dominate the poster, with four to five smaller selected-side full-body action shots along the bottom third. Opponents stay ${matchContext.userSide === "away" ? "LEFT" : "RIGHT"} as secondary match context only. ${matchContext.opponentMode === "another-person" ? "Use [img2] for one opposing feature player only, never for the selected-side hero figures." : ""} Do not swap sides.` : `Use [img1] only for ${userMatchTeam?.name ?? input.teamProfile.name} on the ${matchContext.userSide === "away" ? "RIGHT" : "LEFT"} side: centre portrait plus action poses. Opponents stay ${matchContext.userSide === "away" ? "LEFT" : "RIGHT"}. ${matchContext.opponentMode === "another-person" ? "Use [img2] for one opposing feature player." : ""} Do not swap sides.`}`
    : isFootballCardStyle
      ? `Premium photorealistic football player card for ${input.teamProfile.name}, starring [img] as the collectible-card hero.

COMPOSITION & POSES:
${isGptImage ? "Use one clean hero figure or chest-up portrait of [img] as the central card subject. Keep the pose confident and readable, with optional subtle action silhouettes or pitch texture behind the main figure. Do not create a multi-pose collage; this should feel like one polished player card." : "Use [img] as one clear central card subject with a confident football-card pose. Keep background action subtle and secondary."}`
    : `Modern football ${isNationalTeam ? "tournament" : "league"} poster${isGptImage ? " starring [img] in a fresh football campaign concept" : ", surrounded by multiple versions of [img] in different athletic poses and kit colours"}.

COMPOSITION & POSES:
${isGptImage ? "Use one huge chest-up hero portrait occupying approximately 60-70% of the poster, plus four to five smaller full-body action shots positioned along the bottom third. Every smaller figure must be the same reference person. Include running, celebrating, match action, arms raised after scoring, and crowd celebration energy. Do not include a trophy, cup, or medal as a central prop." : "Use the same [img] face in every pose: close-up centre portrait, triumphant shouting pose, thoughtful captain pose, running and celebrating figures. Do not include a trophy, cup, or medal as a central prop."}`;

  /*
   * LEGACY GPT IMAGE 2 PROMPT (rollback reference):
   *
   * Use GPT Image 2's stronger prompt adherence to build a premium but intentionally funny football media-day poster. The mood should feel like the best day of the fan's life, as if they have just won the biggest match of their life: joyful, comedic, over-the-top, broad grins, laughing, arms raised, playful fist pumps, kneeslide celebration, badge-kiss pride, confetti-like atmosphere, warm internet-football humour, and a tiny controlled dose of lovable AI absurdity. Keep it family-friendly, polished, and emotionally light.
   *
   * IDENTITY LOCK:
   * The reference person is the hero. Preserve the reference person's recognisable likeness across every repeated version: head shape, baldness or hairline, eyes, nose, mouth shape, cheeks, jaw, skin texture, facial hair, age, and body type. Expressions may become happier and more theatrical, but the person must still clearly look like the source photo. Do not average the face with professional players, kit-reference models, or generic footballer faces.
   *
   * COMPOSITION:
   * Use one large central hero portrait with a joyful proud grin, plus smaller supporting versions doing funny match-winning celebrations. Keep the repeated figures readable and intentionally poster-like, not chaotic. If identity starts to drift, use fewer repeated figures and make the central portrait more accurate.
   *
   * NEGATIVE PROMPT:
   * No generic replacement face. No face averaging. No beautified stranger. No unrealistic body transformation. No body-shaming caricature. No exaggerated belly, double chin, or squeezed kit. No stern police-lineup expression. No dead-eyed serious portrait. No missing sponsor on visible shirt fronts. No fake sponsor font. No random readable poster titles. No slogan text. No malformed hands. No extra fingers. No warped limbs. No duplicate half-faces. No melted facial features. No chaotic AI slop. No scary or aggressive mood. No literal mascot costume. No giant nickname text. No applying the fan face to opposition players.
   */
  const modelDirection = isNanoBanana
    ? `NANO BANANA MODEL DIRECTION:
Make this a joyful, funny, celebratory fan media-day poster, not a stern professional lineup collage. Identity accuracy is more important than the smile or pose: preserve the reference person's head shape, baldness or hairline, eyes, nose, mouth shape, cheeks, jaw, skin texture, facial hair, age, and body type. The central hero should have a natural proud smile that still looks exactly like the reference person, not a generic smiling replacement face. Supporting poses can be playful and over-the-top: laughing, roaring with joy, arms raised, fist pump, kneeslide, or cheeky badge-kiss energy. If exact identity would suffer, use fewer supporting figures rather than inventing a new face.

${flatteringAthleticDirection}

Use a premium football broadcast environment: bright stadium atmosphere with curved stands and crowd texture, clean floodlit pitch, vibrant matchday energy, electric gradient light forms across the environment. The composition should feel like official sports campaign photography — sharp, premium, broadcast-quality. The people, pitch, lights, and crowd must feel integrated in one scene. Reproduce the shirt sponsor as the exact logo style from the kit reference, not plain typed text or a generic font. No plain studio background. No dark moody fog. No shadowy back-lit cinema look. No large poster title text, slogan text, fake readable banners, random advertising boards, old sponsors, trophies, cups, medals, or isolated cutout collage.`
    : isGptImage
      ? matchContext
        ? `GPT IMAGE 2 VS DIRECTION:
Create a premium photorealistic Kitface VS match poster that looks like a real app result: official football broadcast campaign artwork, pre-match programme cover, and modern tournament media-day poster in one image. This must feel more detailed and composed than a simple split-screen graphic.

MATCH POSTER CONCEPT:
Friendly but electric home-vs-away poster. Home team is always LEFT. Away team is always RIGHT. The selected-side uploaded person [img1] is the emotional hero, shown as a real supporter having their dream football media-day moment. Opposition figures create match tension, but never steal the hero role.

SIDE STRUCTURE:
Build a strong two-sided composition with clear visual separation. The ${matchContext.homeTeam.name} side uses home-team colour energy, kit details, crowd cues, and lighting on the LEFT. The ${matchContext.awayTeam.name} side uses away-team colour energy, kit details, crowd cues, and lighting on the RIGHT. Use a subtle central rivalry zone, tunnel glow, pitch line, diagonal broadcast graphics, or controlled "VS" energy without random readable text.

SELECTED-SIDE HERO:
Use [img1] only for ${userMatchTeam?.name ?? input.teamProfile.name} on the ${matchContext.userSide === "away" ? "RIGHT" : "LEFT"} side. Make one huge chest-up hero portrait of [img1] occupy about 55-70% of the selected side and dominate the poster. Add four to five smaller selected-side full-body action versions: running, celebrating, badge-kiss pride, arms raised, kneeslide or fist-pump celebration, and match-action movement. Every selected-side figure must clearly be [img1].

OPPOSITION HANDLING:
Opponents stay on the ${matchContext.userSide === "away" ? "LEFT" : "RIGHT"} side as secondary match context. ${matchContext.opponentMode === "another-person" ? "Use [img2] for exactly one opposing feature player only, wearing the opposition kit, positioned clearly on the opposition side. [img2] may have one strong portrait or action pose, but [img1] remains the main hero. Never use [img2] for selected-side hero figures." : "Use varied anonymous current-squad-style opposition players or named matchday players only when matchday notes allow them. Do not copy [img1] onto opposition players."} Keep opposition figures smaller, less prominent, and visually separated.

IDENTITY LOCK:
Preserve exact recognisable likeness for [img1]: head shape, hairline, eyes, nose, mouth, cheeks, jaw, skin texture, facial hair, age, body type, and natural proportions. Keep [img1] consistent across every selected-side appearance as if photographed in one football media-day shoot. Expressions can be happier and more match-winning, but [img1] must still clearly look like the uploaded photo. ${matchContext.opponentMode === "another-person" ? "For [img2], preserve the second person's exact identity on the opposition side only. Never blend [img1] and [img2], never average their faces, and never swap kits or sides." : "Opposition faces must not resemble [img1]."} Do not beautify, de-age, slim, bulk up, average faces with footballers, or replace either uploaded person.

REFERENCE PRIORITY:
The first attached person image is [img1], the selected-side identity source. ${matchContext.opponentMode === "another-person" ? "The second attached person image is [img2], the opposing feature-player identity source. " : ""}Kit reference images are clothing only. Never borrow faces, bodies, poses, or lighting from kit images. Identity accuracy wins over poster style.

PHOTO ENHANCEMENT:
If uploaded photos have heavy shadows, dull expression, uneven exposure, tired eyes, harsh phone-camera lighting, or flat indoor light, improve naturally: lift shadows, even skin lighting, brighten eyes, correct exposure, and keep natural skin texture. Do not change age, face shape, nose, eyes, jaw, facial hair, or body type.

PHYSICAL INTEGRATION:
The head, neck, shoulders, and shirt must look photographed together in one real stadium shoot, not composited. Match face lighting to stadium key/rim light on each side. Add contact shadows where chin, neck, collar, sleeves, and shirt fabric meet. Keep correct neck thickness, shoulder connection, skin tone, perspective, scale, and believable fabric tension.

KIT AND SIDE ACCURACY:
Use selected home and away kit variables and kit reference images exactly: fabric texture, stitching, folds, crest, manufacturer mark, collar, trim, shorts, socks, sleeve details, and sponsor placement. The ${matchContext.homeTeam.name} kit belongs only on the LEFT home side. The ${matchContext.awayTeam.name} kit belongs only on the RIGHT away side. If Kitface sponsor mode is active, both chest sponsors must read exactly "kitface.app"; otherwise keep original sponsors.

COMPOSITION DETAIL:
Vertical 3:4 poster. Use layered sports-campaign depth: huge selected-side hero portrait, smaller action versions in the foreground, opposition figures opposite, pitch texture under feet, stadium crowd, floodlight beams, soft confetti or rain-like particles, subtle broadcast overlays, and controlled colour energy from both clubs. Keep natural overlap and realistic scale. Avoid a flat two-person cutout layout.

EXPRESSION AND MOOD:
The selected hero should feel proud, warm, joyful, and celebratory, like a normal supporter experiencing the biggest matchday of their life. Opposition energy should feel competitive but friendly: focused, proud, amused, or impressed. This is football banter and broadcast excitement, not a fight poster.

ENVIRONMENT:
Modern football stadium at night with bright floodlights, crowd texture, visible pitch, tunnel or matchday entrance depth, light haze, crisp commercial lighting, and premium broadcast atmosphere. Keep it light, electric, playful, official, and polished.

DESIGN AND PALETTE:
Use modern sports editorial layout, official matchday programme quality, tournament media asset polish, and professional broadcast graphics. Blend both team palettes cleanly. Use translucent cyan, lime, blue, or violet electric beams as environmental light. Keep faces and kits sharp.

LIGHTING AND QUALITY:
Stadium commercial lighting, soft key light on faces, controlled rim light separating both sides, natural skin tones, premium sports photography, sharp focus, realistic anatomy, hands, eyes, and facial proportions.

${motifNotes ? `CLUB PERSONALITY:\nUse selected-side club personality lightly: ${motifNotes} Subtle background cues only; not literal mascots, large text, or the main subject.\n\n` : ""}NEGATIVE PROMPT:
No trophy. No cartoon, illustration, CGI look, celebrity likeness, generic replacement face, face averaging, beautified stranger, copied pro-player face, mismatched identity, identity drift, swapped sides, home kit on away side, away kit on home side, [img1] face on opposition players, ${matchContext.opponentMode === "another-person" ? "[img2] face on selected-side players, blended [img1]/[img2] identity, " : ""}pasted-on head, mismatched head/body lighting, missing neck shadow, collar gap, sad hero face, stern passport-photo expression, tired dead-eyed portrait, flat two-person cutout poster, missing selected-side action figures, distorted anatomy, extra fingers, warped limbs, malformed hands, blurry faces, unrealistic body transformation, body-shaming caricature, random logos, watermarks, fake sponsor names, misspelled text, random titles, extra slogans, mascot costume, hooligan mood, fighting, violence, or aggressive confrontation.`
        : isFootballCardStyle
          ? `GPT IMAGE 2 FOOTBALL CARD DIRECTION:
Create a premium photorealistic Kitface football card that looks like a real app result: official player-card collectible, modern football broadcast graphics, and clean club media design. This is a card-style poster, not a busy multi-pose campaign collage.

SUBJECT:
The hero is the uploaded person as a real football supporter presented on an official-style player card. Preserve realistic skin texture, natural imperfections, strong facial detail, natural eyes, realistic proportions, and a proud confident expression.

CARD STRUCTURE:
Vertical 3:4 poster. Build a strong collectible-card frame with rounded card geometry, team-colour panels, subtle pitch texture, clean lighting, crest/manufacturer/kit detail, and one clear central hero figure or portrait. Use the selected team palette for the frame and background energy. Keep any stats-style shapes abstract unless explicit text is allowed.

IDENTITY LOCK:
Preserve exact recognisable likeness above all style choices: head shape, baldness or hairline, eyes, nose, mouth shape, cheeks, jaw, skin texture, facial hair, age, body type, and natural facial proportions. Do not beautify, de-age, slim, bulk up, average the face with footballers, or replace them.

REFERENCE PRIORITY:
The first attached image is the primary identity source. Any additional person photos are the same person and may be used for smile, body build, and lighting correction. Kit reference images are clothing only: shirt, collar, crest, manufacturer, sponsor, pattern, shorts, and socks. Never borrow faces, bodies, poses, or lighting from kit images. Identity accuracy from the person photos wins over card style.

PHOTO ENHANCEMENT:
If the person photo has poor lighting, heavy shadows, dull expression, uneven exposure, tired eyes, harsh phone-camera lighting, or flat indoor light, improve it naturally: lift shadows, even skin lighting, brighten eyes, correct exposure, soften harsh under-eye shadows, and keep natural skin texture. Keep the same person; do not change age, face shape, nose, eyes, jaw, skin texture, facial hair, or body type.

PHYSICAL INTEGRATION:
The head, neck, shoulders, and shirt must look photographed together in one real studio or stadium card shoot, not composited. Match face lighting to the card environment. Add contact shadows where the chin, neck, and collar meet. Keep correct neck thickness, shoulder connection, skin tone, camera perspective, and lens scale.

EXPRESSION:
The hero portrait must feel proud, warm, and confident. Avoid sad, stern, tired, angry, blank, police-lineup, or dead-eyed expressions.

KIT:
Use the selected kit variables and kit reference images exactly. Render authentic fabric texture, stitching, folds, crest, manufacturer mark, collar, trim, shorts, and socks. The shirt must look physically worn, not pasted on. If Kitface sponsor mode is active, chest sponsor must read exactly "kitface.app" and be integrated into the fabric. If original sponsor mode is active, keep the original sponsor from the kit reference/profile.

${flatteringAthleticDirection}

COMPOSITION:
Use a clean official football card aesthetic. Keep one dominant player-card subject, a premium frame, clear team-colour accents, and crisp sports editorial lighting. Do not add four or five duplicate versions of the person. Avoid clutter; the card should read instantly at phone size.

ENVIRONMENT:
Light premium broadcast-card environment with subtle stadium or pitch cues, soft floodlight glow, and clean commercial photography. Keep it official, electric, playful, and polished.

DESIGN AND PALETTE:
Modern player-card layout, club colour frame, clean white/light-grey sports campaign base, translucent cyan/lime/blue/violet accents when helpful, and sharp kit detail.

BRANDING AND TEXT:
Only include readable text explicitly allowed by the dynamic prompt: "Kitface", "YOUR POSTER", authentic shirt numbers or provided shirt-name personalisation, crests, maker logos, allowed sleeve sponsors, and selected shirt sponsor. Do not add random stats, ratings, poster titles, fake slogans, stadium copy, or extra readable advertising.

LIGHTING AND QUALITY:
Studio-card commercial lighting, soft key light on face, controlled rim light, natural skin tones, premium sports photography, professional retouching, photorealistic detail, sharp focus, realistic anatomy, hands, eyes, and facial proportions.

MOOD:
Confident, proud, collectible, and relatable. The person should feel like a typical supporter getting their official player-card moment, not like a celebrity or elite athlete.

${motifNotes ? `CLUB PERSONALITY:\nUse club personality lightly: ${motifNotes} These should be subtle card-background cues, not literal mascots, not large text, and not the main subject.` : ""}

NEGATIVE PROMPT:
No trophy. No cartoon, illustration, painting, CGI look, AI-art style, celebrity likeness, child, generic replacement face, face averaging, beautified stranger, copied pro-player face, mismatched identity, identity drift, pasted-on head, cutout face, mismatched head/body lighting, halo edge around head, missing neck shadow, collar gap, sad hero face, stern passport-photo expression, tired dead-eyed portrait, busy multi-pose collage, distorted anatomy, extra fingers, warped limbs, malformed hands, blurry faces, unrealistic body transformation, body-shaming caricature, exaggerated belly, double chin, squeezed kit, random logos, watermarks, fake sponsor names, misspelled text, random ratings, random stats, random titles, extra slogans, mascot costume, giant nickname text, or fan face on opposition players.`
          : `GPT IMAGE 2 STAR PLAYER DIRECTION:
Create a premium photorealistic Kitface football poster that looks like a real app result: official international tournament media campaign meets modern sports broadcast advertising; not a single-player trading card.

SUBJECT:
The hero is the uploaded person as a real football supporter, not a professional footballer, celebrity, or replacement model. Preserve realistic skin texture, natural imperfections, strong facial detail, natural eyes, realistic proportions, and a proud joyful expression. The same person must appear throughout the poster.

POSTER STRUCTURE:
Vertical 3:4 poster. One huge chest-up hero portrait occupies about 60-70% of the poster and dominates the background. Add four to five smaller full-body action shots along the bottom third: running, celebrating, match action, arms raised after scoring, and crowd celebration. Every figure must be the uploaded person.

IDENTITY LOCK:
Preserve exact recognisable likeness above all style choices: head shape, baldness or hairline, eyes, nose, mouth shape, cheeks, jaw, skin texture, facial hair, age, body type, and natural facial proportions. Keep identity consistent across every appearance as if photographed in one football media-day shoot. Expressions can be happier and more match-winning, but the person must still clearly look like the uploaded photo. Do not beautify, de-age, slim, bulk up, average the face with footballers, or replace them.

REFERENCE PRIORITY:
The first attached image is the primary identity source. Any additional person photos are the same person and may be used for smile, celebration, body build, and lighting correction. Kit reference images are clothing only: shirt, collar, crest, manufacturer, sponsor, pattern, shorts, and socks. Never borrow faces, bodies, poses, or lighting from kit images. Identity accuracy from the person photos wins over poster style.

PHOTO ENHANCEMENT:
If the person photo has poor lighting, heavy shadows, dull expression, uneven exposure, tired eyes, harsh phone-camera lighting, or flat indoor light, improve it naturally: lift shadows, even skin lighting, brighten eyes, correct exposure, soften harsh under-eye shadows, and keep natural skin texture. Keep the same person; do not change age, face shape, nose, eyes, jaw, skin texture, facial hair, or body type.

PHYSICAL INTEGRATION:
The head, neck, shoulders, and shirt must look photographed together in one real stadium shoot, not composited. Match face lighting to stadium key/rim light. Add contact shadows where the chin, neck, and collar meet. Keep correct neck thickness, shoulder connection, skin tone, camera perspective, and lens scale. Collar sits around the real neck with believable fabric tension and shadow.

EXPRESSION:
The hero portrait must feel proud, warm, joyful, and celebratory. This is a football celebration, not a passport photo. Avoid sad, stern, tired, angry, blank, police-lineup, or dead-eyed expressions.

KIT:
Use the selected kit variables and kit reference images exactly. Render authentic fabric texture, stitching, folds, crest, manufacturer mark, collar, trim, shorts, and socks. The shirt must look physically worn, not pasted on. If Kitface sponsor mode is active, chest sponsor must read exactly "kitface.app" and be integrated into the fabric. If original sponsor mode is active, keep the original sponsor from the kit reference/profile.

${flatteringAthleticDirection}

COMPOSITION:
Use a clean official football federation media-day poster aesthetic. Place the huge hero portrait in the upper/middle area. Arrange smaller action versions across the bottom third with realistic scale, feet on pitch, and natural overlap. Keep layout premium and uncluttered with subtle broadcast graphic overlays.

ACTION POSES:
Bottom-third action figures should read as a complete sequence: running, celebrating, match action with ball or movement, arms raised after scoring, and crowd celebration. Figures are smaller than the hero but sharp and recognisable.

${matchContext
  ? `MATCHDAY VS HANDLING:
The selected-side fan figure is the hero and must follow the huge-portrait-plus-bottom-action-pose structure. Opposition or matchday players are secondary scene elements only. Do not put the reference person's face on opposition players. Use opposition figures as smaller, less prominent, non-reference footballers with clear side separation. Avoid making real players look like distorted copies of the fan.`
  : "SINGLE-TEAM HANDLING:\nEvery human figure that represents the hero fan should use the same reference identity. Do not introduce unrelated celebrity or professional-player faces."}

ENVIRONMENT:
Modern football stadium at night with bright floodlights, crowd texture, smoke haze, light confetti, visible pitch texture, cinematic depth, and premium matchday atmosphere.

DESIGN AND PALETTE:
Modern sports editorial layout, tournament campaign quality, national-team media asset polish, football advertising feel, professional matchday programme quality, and premium broadcast sports graphics. Use selected team palette. For England-style or neutral Kitface outputs, favour white, navy blue, England red accents, subtle grey overlays, and bright highlights.

BRANDING AND TEXT:
Only include readable text explicitly allowed by the dynamic prompt: "Kitface", "YOUR POSTER", authentic shirt numbers or provided shirt-name personalisation, crests, maker logos, allowed sleeve sponsors, and selected shirt sponsor. Do not add random poster titles, fake slogans, stadium copy, or extra readable advertising.

LIGHTING AND QUALITY:
Stadium commercial lighting, soft key light on face, controlled rim light, natural skin tones, premium sports photography, professional retouching, photorealistic detail, sharp focus, realistic anatomy, hands, eyes, and facial proportions.

MOOD:
Confident, proud, joyful, relatable, celebratory, and emotionally warm. The person should feel like a typical supporter having the best football media-day moment of their life, not like a celebrity or elite athlete. Keep it family-friendly and polished.

${motifNotes ? `CLUB PERSONALITY:\nUse club personality lightly: ${motifNotes} These should be subtle environmental jokes or background atmosphere cues, not literal mascots, not large text, and not the main subject.` : ""}

NEGATIVE PROMPT:
No trophy. No cartoon, illustration, painting, CGI look, AI-art style, celebrity likeness, child, generic replacement face, face averaging, beautified stranger, copied pro-player face, mismatched identity, identity drift, pasted-on head, cutout face, mismatched head/body lighting, halo edge around head, missing neck shadow, collar gap, sad hero face, stern passport-photo expression, tired dead-eyed portrait, single generic footballer portrait, missing bottom action figures, distorted anatomy, extra fingers, warped limbs, malformed hands, blurry faces, unrealistic body transformation, body-shaming caricature, exaggerated belly, double chin, squeezed kit, random logos, watermarks, fake sponsor names, misspelled text, random titles, extra slogans, mascot costume, giant nickname text, or fan face on opposition players.`
    : "";
  const moodSection = isGptImage
    ? `MOOD:
Premium tournament-final poster energy; confident, proud, relatable supporter expression; preserve identity.
${motifNotes ? `Club personality: ${motifNotes} Subtle background cues only.` : ""}`
    : !matchContext || isNanoBanana
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
