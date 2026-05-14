import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getKitSpec, describeKitSpec } from "../lib/kitSpecs.ts";
import { getTeamProfile } from "../lib/teamProfiles.ts";

const OUTPUT_DIR = path.resolve(process.cwd(), "test-images");

type DemoTarget = {
  teamId: string;
  team: string;
  fan: string;
};

const targets: DemoTarget[] = [
  { teamId: "arsenal", team: "Arsenal, Premier League", fan: "Martin, age 45, white British man from North London. Average build, shaved head, light stubble, slightly flushed cheeks, tired eyes, friendly grin, normal teeth, faint forehead lines. He should look like a real long-time supporter, not a model." },
  { teamId: "aston-villa", team: "Aston Villa, Premier League", fan: "Sonia, age 38, British Indian woman from Birmingham. Average build, shoulder-length dark hair, warm brown eyes, natural skin texture, soft cheeks, practical matchday look, slightly uneven smile. She should look like a normal local fan, not an advert actor." },
  { teamId: "bournemouth", team: "AFC Bournemouth, Premier League", fan: "Gary, age 51, white British man from Bournemouth. Stocky build, short sandy-grey hair, sun-weathered skin, light stubble, crow's feet, relaxed grin, slightly tired eyes. He should look like a real seaside match-going supporter." },
  { teamId: "brentford", team: "Brentford, Premier League", fan: "Nadia, age 34, Black British woman from West London. Average build, braided hair pulled back, expressive eyes, natural skin texture, round cheeks, broad real smile, relaxed everyday confidence. She should look like a genuine fan, not a brand model." },
  { teamId: "brighton", team: "Brighton & Hove Albion, Premier League", fan: "Chris, age 29, white British man from Brighton. Slim-average build, messy brown hair, light freckles, faint stubble, slightly uneven teeth, kind tired eyes, casual matchday expression. He should look ordinary and believable." },
  { teamId: "burnley", team: "Burnley, Premier League", fan: "Janet, age 58, white British woman from Lancashire. Average build, short auburn-grey hair, glasses, laugh lines, soft face, practical coat-and-scarf energy, warm proud smile. She should look like a lifelong supporter, not styled for an ad." },
  { teamId: "chelsea", team: "Chelsea, Premier League", fan: "Leon, age 41, Black British man from West London. Average build, close-cropped hair, trimmed beard, natural skin texture, tired eyes, strong cheekbones, normal teeth, proud relaxed smile. He should look like a real matchday fan." },
  { teamId: "crystal-palace", team: "Crystal Palace, Premier League", fan: "Kelly, age 36, mixed-race British woman from South London. Average build, curly dark hair, expressive eyebrows, faint smile lines, natural skin texture, bright but tired eyes, real everyday grin. She should not look like a model." },
  { teamId: "everton", team: "Everton, Premier League", fan: "Linda, age 63, white British woman from Merseyside. Short grey hair, glasses, soft face, laugh lines, average retired-teacher build, kind eyes, slightly uneven smile, practical everyday look. She should feel like a proud lifelong supporter, not styled for an advert." },
  { teamId: "fulham", team: "Fulham, Premier League", fan: "Arthur, age 67, white British man from West London. Slim older build, grey hair, glasses, soft jawline, age lines, slightly uneven teeth, kind eyes, gentle proud smile. He should look like a real lifelong supporter." },
  { teamId: "leeds", team: "Leeds United, Premier League", fan: "Mo, age 31, British Asian man from Leeds. Average build, short black hair, trimmed beard, tired eyes, natural teeth, faint under-eye shadows, friendly intense grin. He should look like a normal local supporter." },
  { teamId: "liverpool", team: "Liverpool, Premier League", fan: "Paul, age 54, white British man from Liverpool. Average height, broad everyday build, short greying hair, weathered cheeks, light stubble, laugh lines, slightly uneven teeth, kind tired eyes, proud match-going dad energy. He should look like a normal lifelong supporter, not a model." },
  { teamId: "man-city", team: "Manchester City, Premier League", fan: "Anne, age 49, white British woman from Manchester. Average build, short blonde-grey hair, soft face, laugh lines, natural skin texture, slightly tired eyes, proud warm smile. She should look like a real fan, not an advert model." },
  { teamId: "man-united", team: "Manchester United, Premier League", fan: "Amir, age 33, British Pakistani man from Manchester. Average build, short black hair, trimmed beard, slightly prominent nose, tired eyes, natural teeth, mild under-eye shadows, friendly but intense matchday expression. He should look ordinary, believable, and local, not like a professional athlete." },
  { teamId: "newcastle", team: "Newcastle United, Premier League", fan: "Michelle, age 42, white British woman from Newcastle. Average build, shoulder-length dark blonde hair tied back loosely, soft round face, natural skin texture, faint smile lines, practical coat-pocket confidence, slightly tired eyes, warm grin. She should look like a real matchday fan, not an advert model." },
  { teamId: "nottingham-forest", team: "Nottingham Forest, Premier League", fan: "Dave, age 47, white British man from the Midlands. Stocky dad build, short thinning brown hair, receding hairline, light stubble, forehead lines, faint under-eye shadows, slightly uneven teeth, friendly eyes. He should look like a normal match-going fan." },
  { teamId: "sunderland", team: "Sunderland, Premier League", fan: "Peter, age 56, white British man from Sunderland. Broad everyday build, short grey hair, ruddy cheeks, light stubble, tired eyes, laugh lines, slightly crooked smile. He should feel like a real lifelong supporter." },
  { teamId: "tottenham", team: "Tottenham Hotspur, Premier League", fan: "Jordan, age 28, Black British man from North London. Slim-to-average everyday build, short fade haircut, faint moustache and goatee, expressive eyes, natural skin texture, slightly tired smile, normal teeth, casual matchday confidence. He should look like a real supporter, not a fashion model." },
  { teamId: "west-ham", team: "West Ham United, Premier League", fan: "Tracey, age 44, white British woman from East London. Average build, dark hair tied back, strong cheekbones, natural skin texture, tired but warm eyes, normal teeth, practical matchday confidence. She should look real, not polished for an advert." },
  { teamId: "wolves", team: "Wolverhampton Wanderers, Premier League", fan: "Darren, age 39, white British man from Wolverhampton. Average-to-stocky build, shaved head, short beard, faint under-eye shadows, weathered skin, friendly grin, normal teeth. He should look like an ordinary fan, not a professional athlete." },
  { teamId: "england", team: "England, International", fan: "Emily, age 32, white British woman from Sheffield. Average build, light brown hair in a loose ponytail, faint freckles, natural skin texture, tired eyes, slightly uneven smile, warm pub-and-matchday energy. She should look like a real England fan." },
  { teamId: "scotland", team: "Scotland, International", fan: "Alistair, age 52, white Scottish man from Glasgow. Stocky build, greying ginger beard, short thinning hair, rosy cheeks, crow's feet, slightly uneven teeth, proud emotional smile. He should look like a normal lifelong Scotland supporter." }
];

const compositions = [
  "Classic hero collage. One large central portrait of the fictional fan wearing the selected team kit, smiling proudly. Around them, show smaller versions of the same fan celebrating: arms raised, laughing, badge kiss, fist pump, running pose, and one rear-facing shirt-number pose. Silver competition-style trophy near the lower centre.",
  "Matchday tunnel poster. The fictional fan stands in the players' tunnel wearing the selected team kit, lit by stadium light from behind, about to walk onto the pitch. Add two smaller ghosted action versions of the same fan in the background: one celebrating a goal and one clapping the crowd. Dramatic but warm, not aggressive.",
  "Last-minute winner celebration. The main fan is mid-knee-slide on the pitch in the selected team kit, laughing with arms wide. Behind them, include a large semi-transparent close-up portrait of the same fan smiling proudly. Crowd, floodlights, confetti, and grass spray create the energy.",
  "Captain poster. The fan stands front and centre wearing the selected team kit with captain-like pride, arms folded, smiling with quiet confidence. Behind them are three smaller action frames of the same fan: running, pointing to the badge, and celebrating with both arms raised. Clean, premium, less chaotic.",
  "Fan media-day fantasy. The fan is the central figure holding a scarf above their head in the selected team kit, smiling like it is the best day of their life. Around them are poster-like snapshots of the same fan: laughing in the stands, walking onto the pitch, and celebrating near the corner flag. Official, playful broadcast feel.",
  "Programme-cover style. A single dominant three-quarter portrait of the fan in the selected team kit fills most of the frame, with the stadium behind them. Add only two smaller action versions of the same fan near the bottom corners. More premium and simple, less busy.",
  "Retro match poster. The fan appears as one large joyful portrait at the top, with a full-body running pose below and a small rear-facing shirt-number pose near the bottom. Use stadium lighting and modern photography, but arrange it like a collectible football programme cover."
];

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function compactKit(teamId: string) {
  const spec = getKitSpec(teamId, "home");
  if (spec) return describeKitSpec(spec);

  const profile = getTeamProfile(teamId);
  return `${profile.name} kit. ${profile.kitNotes} Primary colour ${profile.primary}; accent colour ${profile.accent}.`;
}

function buildPrompt(target: DemoTarget, index: number) {
  return `Create one Kitface demo poster.

TEAM:
${target.team}

KIT:
${compactKit(target.teamId)}

FICTIONAL FAN:
${target.fan}

COMPOSITION:
${compositions[index % compositions.length]}

IDENTITY:
The same fictional fan must appear in every pose. Keep their face, age, body type, hair, skin texture, and overall identity consistent across all appearances. They should look like a real ordinary football fan, not a model, influencer, advert actor, or professional footballer.

SCENE:
Premium football broadcast environment. Bright stadium atmosphere, clean floodlit pitch, vibrant crowd energy. Electric lime-to-cyan gradient light forms and translucent diagonal beams integrated into the environment. Official sports campaign composition — sharp, premium, broadcast-quality. No dark moody fog. No shadowy cinema look.

MOOD:
Joyful, funny, best-day-of-your-life football energy. Confident, official, playful, and family-friendly.

STYLE:
Photorealistic premium football broadcast poster. Light editorial composition with electric gradient energy accents. Realistic shirt fabric, stitching, embroidered crest, believable sponsor placement, natural skin texture, believable hands, realistic body proportions. Portrait orientation, 3:4 aspect ratio.

NO:
No fake poster title. No slogan text. No cartoon style. No professional footballer face. No model look. No airbrushed skin. No beautified stranger. No body-shaming caricature. No scary mood. No hooligan mood. No warped limbs. No malformed hands. No extra fingers. No melted facial features. No random trophies.`;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const manifestLines = [
    "# Kitface Demo Image Prompt Pack",
    "",
    "Paste each `.prompt.txt` file into ChatGPT/GPT Image 2.",
    "When you save the generated image, use the matching `.png` filename shown below.",
    ""
  ];

  for (const [index, target] of targets.entries()) {
    const fanName = target.fan.split(",")[0] || "fan";
    const baseName = `${String(index + 1).padStart(2, "0")}-${slugify(target.teamId)}-${slugify(fanName)}`;
    const promptPath = path.join(OUTPUT_DIR, `${baseName}.prompt.txt`);
    const imageName = `${baseName}.png`;

    await fs.writeFile(promptPath, buildPrompt(target, index));
    manifestLines.push(`- ${imageName}: ${path.basename(promptPath)}`);
  }

  await fs.writeFile(path.join(OUTPUT_DIR, "README.md"), `${manifestLines.join("\n")}\n`);
  console.log(`Wrote ${targets.length} ChatGPT/GPT Image 2 prompts to ${OUTPUT_DIR}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
