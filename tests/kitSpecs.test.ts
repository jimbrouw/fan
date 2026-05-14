import assert from "node:assert/strict";
import test from "node:test";
import { getKitSpec } from "../lib/kitSpecs.ts";
import { buildPosterPrompt } from "../lib/ai/promptBuilder.ts";
import { getDefaultPosterStyleIdForCreateMode } from "../lib/posterTemplates.ts";

const posterStyle = {
  id: "hero-card",
  name: "Hero Card",
  description: "Clean football card composition with club colours."
};

test("Nottingham Forest 2025/26 home kit exposes exact visual details", () => {
  const spec = getKitSpec("nottingham-forest", "home");

  assert.equal(spec?.season, "2025/26");
  assert.equal(spec?.variant, "home");
  assert.equal(spec?.manufacturer, "adidas");
  assert.equal(spec?.mainSponsor, "Bally's");
  assert.equal(spec?.sleeveSponsor, "Ideagen");
  assert.match(spec?.pattern ?? "", /thin vertical white pinstripes/i);
  assert.match(spec?.collar ?? "", /red polo collar/i);
});

test("poster prompt includes kit reference and 2025/26 kit mandate", () => {
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

  assert.match(prompt, /official 2025\/26 Nottingham Forest home kit/i);
  assert.match(prompt, /Bally's/i);
  assert.match(prompt, /Ideagen/i);
  assert.match(prompt, /thin vertical white pinstripes/i);
  assert.match(prompt, /white Bally's script sponsor/i);
  assert.match(prompt, /Nottingham Forest crest inside a white shield/i);
  assert.match(prompt, /attached kit reference image/i);
});

test("poster prompt does not claim an image reference for metadata-only kits", () => {
  const kitSpec = getKitSpec("arsenal", "home");
  assert.ok(kitSpec);
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

test("GPT Image 2 prompt uses joyful club personality direction", () => {
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

  assert.match(prompt, /GPT IMAGE 2 DIRECTION/i);
  assert.match(prompt, /best day of the fan's life/i);
  assert.match(prompt, /IDENTITY LOCK/i);
  assert.match(prompt, /recognisable likeness/i);
  assert.match(prompt, /KIND ATHLETIC PRESENTATION/i);
  assert.match(prompt, /flattering kit fit/i);
  assert.match(prompt, /No body-shaming caricature/i);
  assert.match(prompt, /No exaggerated belly, double chin, or squeezed kit/i);
  assert.match(prompt, /NEGATIVE PROMPT/i);
  assert.match(prompt, /No generic replacement face/i);
  assert.match(prompt, /No missing sponsor on visible shirt fronts/i);
  assert.match(prompt, /lovable AI absurdity/i);
  assert.match(prompt, /Tricky Trees/i);
  assert.match(prompt, /subtle tree silhouettes/i);
  assert.match(prompt, /not literal mascots/i);
  assert.ok(prompt.length <= 12000, `GPT Image 2 prompt length ${prompt.length} exceeds expected budget`);
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
  assert.match(prompt, /Premier League Trophy/i);
  assert.match(prompt, /NO Champions League trophy/i);
  assert.match(prompt, /NO swapping home and away sides/i);
  assert.match(prompt, /Primary reference person \[img1\] plays for Nottingham Forest/i);
  assert.match(prompt, /never apply \[img1\] to Manchester United/i);
  assert.match(prompt, /MATCHDAY SQUAD NOTES/i);
  assert.match(prompt, /Allowed Manchester United players: Bruno Fernandes, Kobbie Mainoo/i);
  assert.match(prompt, /Do not show Marcus Rashford or Scott McTominay/i);
  assert.match(prompt, /Only depict named real opposition players/i);
  assert.ok(prompt.length <= 3000, `prompt length ${prompt.length} exceeds MuAPI limit`);
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
  assert.ok(prompt.length <= 3000, `prompt length ${prompt.length} exceeds MuAPI limit`);
});

test("VS create mode defaults to the VS Match Poster style", () => {
  assert.equal(getDefaultPosterStyleIdForCreateMode("vs"), "matchday");
});
