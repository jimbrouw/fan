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
  assert.match(prompt, /attached kit reference image/i);
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
    matchContext: {
      homeTeam: {
        name: "Manchester United",
        group: "Premier League",
        primary: "#da291c",
        accent: "#111111",
        kitNotes: "Red shirt with white shorts and black socks.",
        kitVariant: "home"
      },
      awayTeam: {
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

  assert.match(prompt, /VS MATCH CONTEXT/i);
  assert.match(prompt, /Manchester United are the home side/i);
  assert.match(prompt, /Nottingham Forest are the away side/i);
  assert.match(prompt, /reference person \[img\] plays for Nottingham Forest/i);
  assert.match(prompt, /opposition players must not use the reference face/i);
  assert.match(prompt, /MATCHDAY SQUAD NOTES/i);
  assert.match(prompt, /Allowed Manchester United players: Bruno Fernandes, Kobbie Mainoo/i);
  assert.match(prompt, /Do not show Marcus Rashford or Scott McTominay/i);
  assert.match(prompt, /Do not depict recognizable real opposition players unless named in matchday notes/i);
  assert.ok(prompt.length <= 3000, `prompt length ${prompt.length} exceeds MuAPI limit`);
});

test("VS create mode defaults to the VS Match Poster style", () => {
  assert.equal(getDefaultPosterStyleIdForCreateMode("vs"), "matchday");
});
