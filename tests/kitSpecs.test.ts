import assert from "node:assert/strict";
import test from "node:test";
import { getKitSpec } from "../lib/kitSpecs.ts";
import { buildPosterPrompt, normalizeKitBrandPlacementMode } from "../lib/ai/promptBuilder.ts";
import { getDefaultPosterStyleIdForCreateMode } from "../lib/posterTemplates.ts";

const posterStyle = {
  id: "hero-card",
  name: "Hero Card",
  description: "Clean football card composition with club colours."
};

const starPlayerPosterStyle = {
  id: "player-reveal",
  name: "Star Player Poster",
  description: "Bold media-day poster with official campaign lighting."
};

test("Nottingham Forest home kit uses the current 2026/27 Premier League overlay", () => {
  const spec = getKitSpec("nottingham-forest", "home");

  assert.equal(spec?.season, "2026/27");
  assert.equal(spec?.variant, "home");
  assert.equal(spec?.manufacturer, "adidas");
  assert.equal(spec?.mainSponsor, "Bally's");
  assert.equal(spec?.sleeveSponsor, "Ideagen");
  assert.match(spec?.pattern ?? "", /2026\/27 Nottingham Forest home shirt/i);
  assert.match(spec?.sourceUrls.join(" ") ?? "", /premier-league-kits-2026-27/i);
});

test("poster prompt includes current 2026/27 kit mandate", () => {
  const kitSpec = getKitSpec("nottingham-forest", "home");
  assert.ok(kitSpec);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Nottingham Forest",
      group: "Premier League",
      primary: "#dd0000",
      accent: "#ffffff",
      kitNotes: "Red shirt, white shorts, clean Forest crest placement and simple trim.",
      trophy: "Premier League Trophy"
    },
    posterStyle,
    kitSpec
  });

  assert.match(prompt, /official 2026\/27 Nottingham Forest home kit/i);
  assert.match(prompt, /Bally's/i);
  assert.match(prompt, /Ideagen/i);
  assert.match(prompt, /2026\/27 Nottingham Forest home shirt/i);
  assert.doesNotMatch(prompt, /attached kit reference image/i);
  assert.match(prompt, /No kit reference image is attached/i);
});

test("World Cup teams can fall back to away kit metadata", () => {
  const spec = getKitSpec("england-wc", "away");

  assert.ok(spec);
  assert.equal(spec.team, "England");
  assert.equal(spec.variant, "away");
  assert.equal(spec.mainSponsor, "none");
  assert.equal(spec.referenceImageUrl, undefined);
  assert.match(spec.pattern, /away shirt/i);
  assert.match(spec.pattern, /national-team trim/i);
});

test("poster prompt can replace the main shirt sponsor with Kitface branding", () => {
  const kitSpec = getKitSpec("nottingham-forest", "home");
  assert.ok(kitSpec);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Nottingham Forest",
      group: "Premier League",
      primary: "#dd0000",
      accent: "#ffffff",
      kitNotes: "Red shirt, white shorts, clean Forest crest placement and simple trim.",
      trophy: "Premier League Trophy"
    },
    posterStyle,
    kitSpec,
    brandPlacementMode: "kitface"
  });

  assert.match(prompt, /BRAND PLACEMENT MODE: Kitface sponsor experiment/i);
  assert.match(prompt, /replace the real main chest sponsor with exact text "kitface\.app"/i);
  assert.match(prompt, /pitch-side LED advertising boards reading exactly "kitface\.app"/i);
  assert.match(prompt, /Do not show the original main sponsor text/i);
  assert.match(prompt, /Preserve crest, manufacturer logo, sleeve sponsor, kit pattern/i);
  assert.match(prompt, /NO text except .*exact "kitface\.app" text/i);
});

test("Kitface sponsor mode is the default unless original sponsors are explicitly requested", () => {
  assert.equal(normalizeKitBrandPlacementMode(undefined), "kitface");
  assert.equal(normalizeKitBrandPlacementMode("kitface"), "kitface");
  assert.equal(normalizeKitBrandPlacementMode("original"), "original");
});

test("poster prompt does not claim an image reference for metadata-only kits", () => {
  const kitSpecWithReference = getKitSpec("arsenal", "home");
  assert.ok(kitSpecWithReference);
  const kitSpec = { ...kitSpecWithReference, referenceImageUrl: undefined };
  assert.equal(kitSpec.referenceImageUrl, undefined);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Arsenal",
      group: "Premier League",
      primary: "#ef0107",
      accent: "#ffffff",
      kitNotes: "Red shirt with white sleeves.",
      trophy: "Premier League Trophy"
    },
    posterStyle,
    kitSpec
  });

  assert.doesNotMatch(prompt, /attached kit reference image/i);
  assert.match(prompt, /No kit reference image is attached/i);
});

test("Nano Banana prompt uses joyful broadcast media-day direction", () => {
  const kitSpec = getKitSpec("newcastle", "home");
  assert.ok(kitSpec);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Newcastle United",
      group: "Premier League",
      primary: "#111111",
      accent: "#ffffff",
      kitNotes: "Black and white striped shirt, black shorts, high-contrast Tyneside identity.",
      trophy: "Premier League Trophy"
    },
    posterStyle,
    kitSpec,
    model: "nano-banana-2"
  });

  assert.match(prompt, /NANO BANANA MODEL DIRECTION/i);
  assert.match(prompt, /joyful, funny, celebratory fan media-day poster/i);
  assert.match(prompt, /Identity accuracy is more important than the smile or pose/i);
  assert.match(prompt, /KIND ATHLETIC PRESENTATION/i);
  assert.match(prompt, /Do not make them unrealistically ripped/i);
  assert.match(prompt, /NO generic replacement face/i);
  assert.match(prompt, /NO unrealistic body transformation/i);
  assert.match(prompt, /exact logo style from the kit reference/i);
  assert.match(prompt, /premium football broadcast environment/i);
  assert.match(prompt, /No plain studio background/i);
  assert.match(prompt, /NO stern blank central expression/i);
});

test("GPT Image 2 football card prompt uses a clean card structure", () => {
  const kitSpec = getKitSpec("nottingham-forest", "home");
  assert.ok(kitSpec);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Nottingham Forest",
      group: "Premier League",
      primary: "#dd0000",
      accent: "#ffffff",
      kitNotes: "Red shirt, white shorts, clean Forest crest placement and simple trim.",
      trophy: "Premier League Trophy",
      nickname: "Tricky Trees",
      visualMotifs: ["subtle tree silhouettes", "playful forest hints"]
    },
    posterStyle,
    kitSpec,
    model: "gpt-image-2"
  });

  assert.match(prompt, /GPT IMAGE 2 FOOTBALL CARD DIRECTION/i);
  assert.match(prompt, /official player-card collectible/i);
  assert.match(prompt, /real app result/i);
  assert.match(prompt, /not a busy multi-pose campaign collage/i);
  assert.match(prompt, /one clear central hero figure or portrait/i);
  assert.match(prompt, /Do not add four or five duplicate versions/i);
  assert.match(prompt, /Avoid clutter; the card should read instantly at phone size/i);
  assert.match(prompt, /SUBJECT/i);
  assert.match(prompt, /real football supporter/i);
  assert.doesNotMatch(prompt, /One huge chest-up hero portrait occupies about 60-70%/i);
  assert.doesNotMatch(prompt, /four to five smaller full-body action shots/i);
  assert.match(prompt, /IDENTITY LOCK/i);
  assert.match(prompt, /Do not beautify, de-age, slim, bulk up/i);
  assert.match(prompt, /REFERENCE PRIORITY/i);
  assert.match(prompt, /PHOTO ENHANCEMENT/i);
  assert.match(prompt, /PHYSICAL INTEGRATION/i);
  assert.match(prompt, /Use the selected kit variables and kit reference images exactly/i);
  assert.match(prompt, /KIND ATHLETIC PRESENTATION/i);
  assert.match(prompt, /NEGATIVE PROMPT/i);
  assert.match(prompt, /random ratings/i);
  assert.match(prompt, /Tricky Trees/i);
  assert.match(prompt, /subtle tree silhouettes/i);
  assert.ok(prompt.length <= 10000, `GPT Image 2 prompt length ${prompt.length} exceeds expected budget`);
});

test("GPT Image 2 star player prompt uses the Kitface tournament poster structure", () => {
  const kitSpec = getKitSpec("nottingham-forest", "home");
  assert.ok(kitSpec);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Nottingham Forest",
      group: "Premier League",
      primary: "#dd0000",
      accent: "#ffffff",
      kitNotes: "Red shirt, white shorts, clean Forest crest placement and simple trim.",
      trophy: "Premier League Trophy",
      nickname: "Tricky Trees",
      visualMotifs: ["subtle tree silhouettes", "playful forest hints"]
    },
    posterStyle: starPlayerPosterStyle,
    kitSpec,
    model: "gpt-image-2"
  });

  assert.match(prompt, /GPT IMAGE 2 STAR PLAYER DIRECTION/i);
  assert.match(prompt, /official international tournament media campaign/i);
  assert.match(prompt, /real app result/i);
  assert.match(prompt, /not a single-player trading card/i);
  assert.match(prompt, /One huge chest-up hero portrait occupies about 60-70%/i);
  assert.match(prompt, /four to five smaller full-body action shots/i);
  assert.match(prompt, /ACTION POSES/i);
  assert.match(prompt, /running, celebrating, match action/i);
  assert.match(prompt, /IDENTITY LOCK/i);
  assert.match(prompt, /one football media-day shoot/i);
  assert.match(prompt, /Do not beautify, de-age, slim, bulk up/i);
  assert.match(prompt, /REFERENCE PRIORITY/i);
  assert.match(prompt, /additional person photos are the same person/i);
  assert.match(prompt, /PHOTO ENHANCEMENT/i);
  assert.match(prompt, /lift shadows/i);
  assert.match(prompt, /harsh phone-camera lighting/i);
  assert.match(prompt, /PHYSICAL INTEGRATION/i);
  assert.match(prompt, /head, neck, shoulders, and shirt must look photographed together/i);
  assert.match(prompt, /contact shadows where the chin, neck, and collar meet/i);
  assert.match(prompt, /EXPRESSION/i);
  assert.match(prompt, /proud, warm, joyful, and celebratory/i);
  assert.match(prompt, /not a passport photo/i);
  assert.match(prompt, /Use the selected kit variables and kit reference images exactly/i);
  assert.match(prompt, /KIND ATHLETIC PRESENTATION/i);
  assert.match(prompt, /flattering kit fit/i);
  assert.match(prompt, /Modern football stadium at night/i);
  assert.match(prompt, /national-team media asset polish/i);
  assert.match(prompt, /Only include readable text explicitly allowed by the dynamic prompt/i);
  assert.match(prompt, /NEGATIVE PROMPT/i);
  assert.match(prompt, /No cartoon/i);
  assert.match(prompt, /sad hero face/i);
  assert.match(prompt, /stern passport-photo expression/i);
  assert.match(prompt, /pasted-on head/i);
  assert.match(prompt, /mismatched head\/body lighting/i);
  assert.match(prompt, /collar gap/i);
  assert.match(prompt, /single generic footballer portrait/i);
  assert.match(prompt, /missing bottom action figures/i);
  assert.match(prompt, /Tricky Trees/i);
  assert.match(prompt, /subtle tree silhouettes/i);
  assert.match(prompt, /not literal mascots/i);
  assert.ok(prompt.length <= 10000, `GPT Image 2 prompt length ${prompt.length} exceeds expected budget`);
});

test("poster prompt can frame an away VS match with the reference person on the selected side", () => {
  const kitSpec = getKitSpec("nottingham-forest", "away");
  assert.ok(kitSpec);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Nottingham Forest",
      group: "Premier League",
      primary: "#dd0000",
      accent: "#ffffff",
      kitNotes: "Red shirt, white shorts, clean Forest crest placement and simple trim.",
      trophy: "Premier League Trophy"
    },
    posterStyle,
    kitSpec,
    homeKitSpec: getKitSpec("man-united", "home"),
    awayKitSpec: kitSpec,
    model: "gpt-image-2",
    matchContext: {
      homeTeam: {
        id: "man-united",
        name: "Manchester United",
        group: "Premier League",
        primary: "#da291c",
        accent: "#111111",
        kitNotes: "Red shirt with white shorts and black socks.",
        kitVariant: "home"
      },
      awayTeam: {
        id: "nottingham-forest",
        name: "Nottingham Forest",
        group: "Premier League",
        primary: "#dd0000",
        accent: "#ffffff",
        kitNotes: "Off-white away kit with dark navy details.",
        kitVariant: "away"
      },
      userSide: "away",
      opponentMode: "club-players",
      matchdayNotes: "Allowed Manchester United players: Bruno Fernandes, Kobbie Mainoo. Do not show Marcus Rashford or Scott McTominay."
    }
  });

  assert.match(prompt, /MATCH:/i);
  assert.match(prompt, /Snapdragon/i);
  assert.match(prompt, /Manchester United, the HOME side/i);
  assert.match(prompt, /Nottingham Forest, the AWAY side/i);
  assert.match(prompt, /LEFT SIDE: Manchester United/i);
  assert.match(prompt, /RIGHT SIDE: Nottingham Forest/i);
  assert.doesNotMatch(prompt, /Premier League Trophy/i);
  assert.match(prompt, /NO trophies, cups, medals/i);
  assert.match(prompt, /NO Champions League/i);
  assert.match(prompt, /NO swapping home and away sides/i);
  assert.match(prompt, /Primary reference person \[img1\] plays for Nottingham Forest/i);
  assert.match(prompt, /never apply \[img1\] to Manchester United/i);
  assert.match(prompt, /MATCHDAY SQUAD NOTES/i);
  assert.match(prompt, /Allowed Manchester United players: Bruno Fernandes, Kobbie Mainoo/i);
  assert.match(prompt, /Do not show Marcus Rashford or Scott McTominay/i);
  assert.match(prompt, /Only depict named real opposition players/i);
  assert.match(prompt, /GPT IMAGE 2 VS DIRECTION/i);
  assert.match(prompt, /official football broadcast campaign artwork/i);
  assert.match(prompt, /pre-match programme cover/i);
  assert.match(prompt, /This must feel more detailed and composed than a simple split-screen graphic/i);
  assert.match(prompt, /strong two-sided composition/i);
  assert.match(prompt, /huge chest-up hero portrait of \[img1\] occupy about 55-70%/i);
  assert.match(prompt, /kneeslide or fist-pump celebration/i);
  assert.match(prompt, /OPPOSITION HANDLING/i);
  assert.match(prompt, /Opponents stay on the LEFT side as secondary match context/i);
  assert.match(prompt, /PHYSICAL INTEGRATION/i);
  assert.match(prompt, /KIT AND SIDE ACCURACY/i);
  assert.match(prompt, /The Manchester United kit belongs only on the LEFT home side/i);
  assert.match(prompt, /The Nottingham Forest kit belongs only on the RIGHT away side/i);
  assert.match(prompt, /Avoid a flat two-person cutout layout/i);
  assert.match(prompt, /football banter and broadcast excitement/i);
  assert.match(prompt, /No trophy/i);
  assert.match(prompt, /flat two-person cutout poster/i);
  assert.ok(prompt.length <= 10000, `prompt length ${prompt.length} exceeds GPT Image 2 budget`);
});

test("poster prompt does not ask for a trophy or cup prop", () => {
  const kitSpec = getKitSpec("nottingham-forest", "home");
  assert.ok(kitSpec);

  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Mansfield Town",
      group: "EFL League One",
      primary: "#f6c600",
      accent: "#2346a0",
      kitNotes: "Amber shirt with blue trim.",
      trophy: "EFL Trophy"
    },
    posterStyle,
    kitSpec,
    brandPlacementMode: "kitface"
  });

  assert.doesNotMatch(prompt, /official .*trophy/i);
  assert.doesNotMatch(prompt, /situated prominently/i);
  assert.match(prompt, /NO trophies, cups, medals/i);
  assert.match(prompt, /central silverware props/i);
});

test("poster prompt can assign a second person reference to the opposition feature player", () => {
  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Nottingham Forest",
      group: "Premier League",
      primary: "#dd0000",
      accent: "#ffffff",
      kitNotes: "Off-white away kit with dark navy details.",
      trophy: "Premier League Trophy"
    },
    posterStyle,
    homeKitSpec: getKitSpec("man-united", "home"),
    awayKitSpec: getKitSpec("nottingham-forest", "away"),
    model: "gpt-image-2",
    matchContext: {
      homeTeam: {
        id: "man-united",
        name: "Manchester United",
        group: "Premier League",
        primary: "#da291c",
        accent: "#111111",
        kitNotes: "Red shirt with white shorts and black socks.",
        kitVariant: "home"
      },
      awayTeam: {
        id: "nottingham-forest",
        name: "Nottingham Forest",
        group: "Premier League",
        primary: "#dd0000",
        accent: "#ffffff",
        kitNotes: "Off-white away kit with dark navy details.",
        kitVariant: "away"
      },
      userSide: "away",
      opponentMode: "another-person",
      opponentSourceImageUrl: "https://example.com/opponent.jpg"
    }
  });

  assert.match(prompt, /first person reference \[img1\] is the selected side person/i);
  assert.match(prompt, /second person reference \[img2\] is the opposing feature player/i);
  assert.match(prompt, /Secondary reference person \[img2\] plays for Manchester United/i);
  assert.match(prompt, /Use \[img2\] for one opposing feature player/i);
  assert.match(prompt, /NO applying \[img2\]'s face to the selected side/i);
  assert.match(prompt, /Use \[img2\] for exactly one opposing feature player only/i);
  assert.match(prompt, /For \[img2\], preserve the second person's exact identity on the opposition side only/i);
  assert.match(prompt, /Never blend \[img1\] and \[img2\]/i);
  assert.match(prompt, /\[img2\] face on selected-side players/i);
  assert.ok(prompt.length <= 10000, `prompt length ${prompt.length} exceeds GPT Image 2 budget`);
});

test("VS poster prompt can apply Kitface sponsor and billboard mode to both kits", () => {
  const prompt = buildPosterPrompt({
    teamProfile: {
      name: "Nottingham Forest",
      group: "Premier League",
      primary: "#dd0000",
      accent: "#ffffff",
      kitNotes: "Off-white away kit with dark navy details.",
      trophy: "Premier League Trophy"
    },
    posterStyle,
    homeKitSpec: getKitSpec("man-united", "home"),
    awayKitSpec: getKitSpec("nottingham-forest", "away"),
    matchContext: {
      homeTeam: {
        id: "man-united",
        name: "Manchester United",
        group: "Premier League",
        primary: "#da291c",
        accent: "#111111",
        kitNotes: "Red shirt with white shorts and black socks.",
        kitVariant: "home"
      },
      awayTeam: {
        id: "nottingham-forest",
        name: "Nottingham Forest",
        group: "Premier League",
        primary: "#dd0000",
        accent: "#ffffff",
        kitNotes: "Off-white away kit with dark navy details.",
        kitVariant: "away"
      },
      userSide: "away",
      opponentMode: "another-person",
      opponentSourceImageUrl: "https://example.com/opponent.jpg"
    },
    brandPlacementMode: "kitface"
  });

  assert.match(prompt, /kitface\.app" on both home and away kits/i);
  assert.match(prompt, /Stadium boards:/i);
  assert.match(prompt, /Do not invent other readable brand names/i);
  assert.match(prompt, /NO text except .*subtle pitch-side LED boards/i);
});

test("VS create mode defaults to the VS Match Poster style", () => {
  assert.equal(getDefaultPosterStyleIdForCreateMode("vs"), "matchday");
});
