import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getKitSpec, describeKitSpec } from "../lib/kitSpecs.ts";
import { getTeamProfile } from "../lib/teamProfiles.ts";

const OUTPUT_DIR = path.resolve(process.cwd(), "prompts-vs");

type Fan = {
  name: string;
  description: string;
};

type VsFixture = {
  homeId: string;
  awayId: string;
  homeFan: Fan;
  awayFan: Fan;
};

const fixtures: VsFixture[] = [
  {
    homeId: "arsenal",
    awayId: "tottenham",
    homeFan: { name: "Martin", description: "Martin, age 45, white British man from North London. Average build, shaved head, light stubble, slightly flushed cheeks, tired eyes, friendly grin, normal teeth, faint forehead lines. He should look like a real long-time supporter, not a model." },
    awayFan: { name: "Maya", description: "Maya, age 10, Black British girl from Tottenham. Child supporter with braided hair, round cheeks, bright excited eyes, a missing front baby tooth, and a shy proud smile. She must look like a normal happy kid at football with family, never adult-styled or model-like." }
  },
  {
    homeId: "aston-villa",
    awayId: "wolves",
    homeFan: { name: "Sonia", description: "Sonia, age 38, British Indian woman from Birmingham. Average build, shoulder-length dark hair, warm brown eyes, natural skin texture, soft cheeks, practical matchday look, slightly uneven smile. She should look like a normal local fan, not an advert actor." },
    awayFan: { name: "Eddie", description: "Eddie, age 8, white British boy from Wolverhampton. Child supporter with messy light-brown hair, freckles, a round face, big grin, slightly muddy knees, and pure matchday excitement. He should look like a real kid, not polished or posed like an advert." }
  },
  {
    homeId: "bournemouth",
    awayId: "brighton",
    homeFan: { name: "Gary", description: "Gary, age 51, white British man from Bournemouth. Stocky build, short sandy-grey hair, sun-weathered skin, light stubble, crow's feet, relaxed grin, slightly tired eyes. He should look like a real seaside match-going supporter." },
    awayFan: { name: "Iris", description: "Iris, age 15, mixed-race British teen girl from Brighton. Slim everyday build, curly hair tied back, light acne texture, braces, expressive eyes, slightly awkward but joyful grin. She should look like a real teenage supporter, not a fashion model." }
  },
  {
    homeId: "brentford",
    awayId: "fulham",
    homeFan: { name: "Nadia", description: "Nadia, age 34, Black British woman from West London. Average build, braided hair pulled back, expressive eyes, natural skin texture, round cheeks, broad real smile, relaxed everyday confidence. She should look like a genuine fan, not a brand model." },
    awayFan: { name: "Tommy", description: "Tommy, age 12, white British boy from Fulham. Child supporter with floppy brown hair, glasses, narrow shoulders, toothy grin, slightly oversized kit, and nervous excited energy. He should look like an ordinary school kid at a match." }
  },
  {
    homeId: "brighton",
    awayId: "chelsea",
    homeFan: { name: "Chris", description: "Chris, age 29, white British man from Brighton. Slim-average build, messy brown hair, light freckles, faint stubble, slightly uneven teeth, kind tired eyes, casual matchday expression. He should look ordinary and believable." },
    awayFan: { name: "Grace", description: "Grace, age 67, Black British woman from West London. Short silver curls, glasses, soft face, laugh lines, average older build, warm eyes, practical scarf-and-coat energy. She should look like a real lifelong supporter, not styled for advertising." }
  },
  {
    homeId: "burnley",
    awayId: "leeds",
    homeFan: { name: "Janet", description: "Janet, age 58, white British woman from Lancashire. Average build, short auburn-grey hair, glasses, laugh lines, soft face, practical coat-and-scarf energy, warm proud smile. She should look like a lifelong supporter, not styled for an ad." },
    awayFan: { name: "Rafi", description: "Rafi, age 9, British Pakistani boy from Leeds. Child supporter with short black hair, round cheeks, lively eyes, a wide uneven grin, and an oversized kit. He should look like a normal joyful kid, never adult-styled." }
  },
  {
    homeId: "chelsea",
    awayId: "arsenal",
    homeFan: { name: "Leon", description: "Leon, age 41, Black British man from West London. Average build, close-cropped hair, trimmed beard, natural skin texture, tired eyes, strong cheekbones, normal teeth, proud relaxed smile. He should look like a real matchday fan." },
    awayFan: { name: "Elsie", description: "Elsie, age 7, white British girl from Islington. Child supporter with a bob haircut, rosy cheeks, small gap-toothed smile, bright curious eyes, and a slightly oversized shirt. She should look like a real happy child at a family football day." }
  },
  {
    homeId: "crystal-palace",
    awayId: "west-ham",
    homeFan: { name: "Kelly", description: "Kelly, age 36, mixed-race British woman from South London. Average build, curly dark hair, expressive eyebrows, faint smile lines, natural skin texture, bright but tired eyes, real everyday grin. She should not look like a model." },
    awayFan: { name: "Barry", description: "Barry, age 62, white British man from East London. Broad everyday build, thinning grey hair, ruddy cheeks, light stubble, laugh lines, normal teeth, and pub-matchday warmth. He should look like a real supporter, not an actor." }
  },
  {
    homeId: "everton",
    awayId: "liverpool",
    homeFan: { name: "Linda", description: "Linda, age 63, white British woman from Merseyside. Short grey hair, glasses, soft face, laugh lines, average retired-teacher build, kind eyes, slightly uneven smile, practical everyday look. She should feel like a proud lifelong supporter, not styled for an advert." },
    awayFan: { name: "Noah", description: "Noah, age 11, mixed-race British boy from Liverpool. Child supporter with tight curls, freckles across the nose, bright eyes, natural grin, skinny kid build, and an oversized shirt. He should look like a real child fan, not a catalogue model." }
  },
  {
    homeId: "fulham",
    awayId: "brentford",
    homeFan: { name: "Arthur", description: "Arthur, age 67, white British man from West London. Slim older build, grey hair, glasses, soft jawline, age lines, slightly uneven teeth, kind eyes, gentle proud smile. He should look like a real lifelong supporter." },
    awayFan: { name: "Zara", description: "Zara, age 14, Black British teen girl from Brentford. Average teen build, braided ponytail, natural skin texture, braces, expressive eyes, slightly self-conscious but joyful smile. She should look like a normal teenage football fan." }
  },
  {
    homeId: "leeds",
    awayId: "man-united",
    homeFan: { name: "Mo", description: "Mo, age 31, British Asian man from Leeds. Average build, short black hair, trimmed beard, tired eyes, natural teeth, faint under-eye shadows, friendly intense grin. He should look like a normal local supporter." },
    awayFan: { name: "Charlie", description: "Charlie, age 13, white British boy from Manchester. Teen supporter with sandy hair, light acne, narrow shoulders, slightly crooked smile, and excited nervous eyes. He should look like an ordinary school kid, not a model." }
  },
  {
    homeId: "liverpool",
    awayId: "everton",
    homeFan: { name: "Paul", description: "Paul, age 54, white British man from Liverpool. Average height, broad everyday build, short greying hair, weathered cheeks, light stubble, laugh lines, slightly uneven teeth, kind tired eyes, proud match-going dad energy. He should look like a normal lifelong supporter, not a model." },
    awayFan: { name: "Ava", description: "Ava, age 9, white British girl from Merseyside. Child supporter with ponytail, round cheeks, missing baby tooth, bright eyes, and delighted grin. She should look like a normal kid at a family matchday, never adult-styled." }
  },
  {
    homeId: "man-city",
    awayId: "man-united",
    homeFan: { name: "Anne", description: "Anne, age 49, white British woman from Manchester. Average build, short blonde-grey hair, soft face, laugh lines, natural skin texture, slightly tired eyes, proud warm smile. She should look like a real fan, not an advert model." },
    awayFan: { name: "Samir", description: "Samir, age 16, British Asian teen boy from Manchester. Average teen build, short dark hair, faint moustache, mild acne texture, serious excited eyes, shy grin. He should look like a real teenager, not a professional athlete." }
  },
  {
    homeId: "man-united",
    awayId: "man-city",
    homeFan: { name: "Amir", description: "Amir, age 33, British Pakistani man from Manchester. Average build, short black hair, trimmed beard, slightly prominent nose, tired eyes, natural teeth, mild under-eye shadows, friendly but intense matchday expression. He should look ordinary, believable, and local, not like a professional athlete." },
    awayFan: { name: "Molly", description: "Molly, age 8, white British girl from Manchester. Child supporter with blonde hair in messy bunches, rosy cheeks, small gap-toothed smile, bright eyes, and a slightly oversized shirt. She should look like a real happy kid." }
  },
  {
    homeId: "newcastle",
    awayId: "sunderland",
    homeFan: { name: "Michelle", description: "Michelle, age 42, white British woman from Newcastle. Average build, shoulder-length dark blonde hair tied back loosely, soft round face, natural skin texture, faint smile lines, practical coat-pocket confidence, slightly tired eyes, warm grin. She should look like a real matchday fan, not an advert model." },
    awayFan: { name: "Callum", description: "Callum, age 12, white British boy from Sunderland. Child supporter with short ginger hair, freckles, big ears, narrow shoulders, toothy grin, and full matchday excitement. He should look like a real ordinary kid." }
  },
  {
    homeId: "nottingham-forest",
    awayId: "aston-villa",
    homeFan: { name: "Dave", description: "Dave, age 47, white British man from the Midlands. Stocky dad build, short thinning brown hair, receding hairline, light stubble, forehead lines, faint under-eye shadows, slightly uneven teeth, friendly eyes. He should look like a normal match-going fan." },
    awayFan: { name: "Priya", description: "Priya, age 35, British Indian woman from Birmingham. Average build, long dark hair tied back, warm eyes, soft cheeks, natural skin texture, practical everyday smile, and relaxed matchday pride. She should look real, not advert-polished." }
  },
  {
    homeId: "sunderland",
    awayId: "newcastle",
    homeFan: { name: "Peter", description: "Peter, age 56, white British man from Sunderland. Broad everyday build, short grey hair, ruddy cheeks, light stubble, tired eyes, laugh lines, slightly crooked smile. He should feel like a real lifelong supporter." },
    awayFan: { name: "Lily", description: "Lily, age 6, white British girl from Newcastle. Young child supporter with curly blonde hair, rosy cheeks, big bright eyes, small missing-tooth grin, and an oversized football shirt. She should look like a normal happy child with family at a match." }
  },
  {
    homeId: "tottenham",
    awayId: "arsenal",
    homeFan: { name: "Jordan", description: "Jordan, age 28, Black British man from North London. Slim-to-average everyday build, short fade haircut, faint moustache and goatee, expressive eyes, natural skin texture, slightly tired smile, normal teeth, casual matchday confidence. He should look like a real supporter, not a fashion model." },
    awayFan: { name: "Ruby", description: "Ruby, age 10, white British girl from North London. Child supporter with auburn hair, freckles, braces, round cheeks, bright intense eyes, and a proud grin. She should look like a normal young fan, never adult-styled." }
  },
  {
    homeId: "west-ham",
    awayId: "crystal-palace",
    homeFan: { name: "Tracey", description: "Tracey, age 44, white British woman from East London. Average build, dark hair tied back, strong cheekbones, natural skin texture, tired but warm eyes, normal teeth, practical matchday confidence. She should look real, not polished for an advert." },
    awayFan: { name: "Malik", description: "Malik, age 13, Black British boy from South London. Teen supporter with short twists, slim build, mild acne texture, expressive eyes, slightly awkward smile, and lively matchday pride. He should look like a real school kid." }
  },
  {
    homeId: "wolves",
    awayId: "aston-villa",
    homeFan: { name: "Darren", description: "Darren, age 39, white British man from Wolverhampton. Average-to-stocky build, shaved head, short beard, faint under-eye shadows, weathered skin, friendly grin, normal teeth. He should look like an ordinary fan, not a professional athlete." },
    awayFan: { name: "Hannah", description: "Hannah, age 11, mixed-race British girl from Birmingham. Child supporter with curly ponytail, soft cheeks, glasses, bright eyes, and a slightly uneven excited smile. She should look like a normal kid, not a model." }
  },
  {
    homeId: "england",
    awayId: "scotland",
    homeFan: { name: "Emily", description: "Emily, age 32, white British woman from Sheffield. Average build, light brown hair in a loose ponytail, faint freckles, natural skin texture, tired eyes, slightly uneven smile, warm pub-and-matchday energy. She should look like a real England fan." },
    awayFan: { name: "Eilidh", description: "Eilidh, age 9, white Scottish girl from Glasgow. Child supporter with ginger curls, freckles, rosy cheeks, bright eyes, missing-tooth grin, and a slightly oversized Scotland shirt. She should look like a normal happy child football fan." }
  },
  {
    homeId: "scotland",
    awayId: "england",
    homeFan: { name: "Alistair", description: "Alistair, age 52, white Scottish man from Glasgow. Stocky build, greying ginger beard, short thinning hair, rosy cheeks, crow's feet, slightly uneven teeth, proud emotional smile. He should look like a normal lifelong Scotland supporter." },
    awayFan: { name: "Oliver", description: "Oliver, age 12, white British boy from Sheffield. Child supporter with straight brown hair, glasses, narrow shoulders, natural grin, slightly uneven teeth, and nervous excited energy. He should look like an ordinary kid at football." }
  }
];

const compositions = [
  "Split fan rivalry poster. Home fan LEFT, away fan RIGHT. The home fan is the large left-side hero in the home kit, smiling and celebrating. The away fan is a smaller but clear right-side hero in the away kit, also joyful. Keep it friendly and family-safe, like two supporters enjoying a dream matchday.",
  "Face-off tunnel poster. The two fictional fans stand on opposite sides of a stadium tunnel, home on the left and away on the right, both wearing their team kits. Stadium light pours in from behind. They look excited and proud, not angry or aggressive.",
  "Last-minute winner VS poster. The home fan is mid-knee-slide on the left foreground, laughing in the home kit. The away fan is on the right, smiling in disbelief and clapping, still joyful. Add soft close-up portraits of both fans behind their sides.",
  "Captain VS poster. The home fan stands arms-folded on the left with captain-like pride. The away fan stands on the right holding a scarf or clapping, proud and good-natured. Add two small action versions of each fan behind their side.",
  "Family matchday media poster. The two fictional fans are the main subjects on opposite sides of the poster, both happy and caught in their best football day. Use small broadcast-style moments around them: cheering, walking out, badge kiss, and laughing in the stands.",
  "Programme-cover derby poster. A clean collectible poster layout: large home fan portrait on the left, large away fan portrait on the right, pitch and crowd behind, trophy low centre, strong colour contrast between home and away.",
  "Two-fan celebration collage. Both fans appear in repeated but controlled poses on their own sides: one large portrait each, one full-body celebration each, and one smaller rear-shirt-number pose each. Keep the identities readable and clearly separated."
];

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function kitDescription(teamId: string, variant: "home" | "away") {
  const spec = getKitSpec(teamId, variant);
  if (spec) return describeKitSpec(spec);

  const profile = getTeamProfile(teamId);
  return `${profile.name} ${variant} kit. ${profile.kitNotes} Primary colour ${profile.primary}; accent colour ${profile.accent}.`;
}

function competitionLabel(homeId: string, awayId: string) {
  const home = getTeamProfile(homeId);
  const away = getTeamProfile(awayId);
  return home.group === "Premier League" && away.group === "Premier League"
    ? "Premier League"
    : `${home.group} vs ${away.group}`;
}

function buildPrompt(fixture: VsFixture, index: number) {
  const home = getTeamProfile(fixture.homeId);
  const away = getTeamProfile(fixture.awayId);

  return `Create one Kitface VS demo poster.

MATCH:
${home.name} vs ${away.name}.
Competition: ${competitionLabel(fixture.homeId, fixture.awayId)}.
Home team LEFT: ${home.name}.
Away team RIGHT: ${away.name}.

HOME KIT:
${kitDescription(fixture.homeId, "home")}

AWAY KIT:
${kitDescription(fixture.awayId, "away")}

FICTIONAL HOME FAN:
${fixture.homeFan.description}

FICTIONAL AWAY FAN:
${fixture.awayFan.description}

COMPOSITION:
${compositions[index % compositions.length]}

IDENTITY:
There are exactly two fictional fan identities: the home fan and the away fan. Keep the home fan's face, age, body type, hair, skin texture, and overall identity consistent on the left side. Keep the away fan's face, age, body type, hair, skin texture, and overall identity consistent on the right side. Never blend the two identities. Never apply the home fan face to the away side or the away fan face to the home side.

CHILD SAFETY AND PRESENTATION:
If either fan is a child or teenager, present them as a normal happy football supporter in an age-appropriate way. No adult styling, no glamour posing, no romantic mood, no sexualized clothing, no mature body emphasis. Keep the image wholesome, family-friendly, and matchday-focused.

SCENE:
Premium football broadcast environment. Bright stadium atmosphere, clean floodlit pitch, vibrant crowd energy. Electric lime-to-cyan gradient light forms and translucent diagonal beams integrated into the environment. Home fan on the LEFT, away fan on the RIGHT. Official sports campaign composition — sharp, premium, broadcast-quality. No dark moody fog. No shadowy cinema look.

MOOD:
Joyful, funny, best-day-of-your-life football energy for both fans. Confident, official, playful, family-friendly. Competitive but friendly, never aggressive.

STYLE:
Photorealistic premium football broadcast VS poster. Light editorial composition with electric gradient energy accents. Realistic shirt fabric, stitching, embroidered crests, believable sponsor placement, natural skin texture, believable hands, realistic body proportions. Portrait orientation, 3:4 aspect ratio.

NO:
No real professional players. No swapping sides. No blending identities. No fake poster title. No slogan text. No cartoon style. No professional footballer body for either fan. No model look. No airbrushed skin. No beautified stranger. No body-shaming caricature. No scary mood. No hooligan mood. No fighting. No warped limbs. No malformed hands. No extra fingers. No melted facial features. No Champions League trophy for Premier League posters. No FA Cup trophy. No World Cup trophy unless the match is international.`;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const manifestLines = [
    "# Kitface Two-Fan VS Demo Prompt Pack",
    "",
    "Paste each `.prompt.txt` file into ChatGPT/GPT Image 2.",
    "Each prompt uses two fictional fans, not real players.",
    "When you save the generated image, use the matching `.png` filename shown below.",
    ""
  ];

  for (const [index, fixture] of fixtures.entries()) {
    const baseName = `${String(index + 1).padStart(2, "0")}-${slugify(fixture.homeId)}-vs-${slugify(fixture.awayId)}-${slugify(fixture.homeFan.name)}-${slugify(fixture.awayFan.name)}`;
    const promptPath = path.join(OUTPUT_DIR, `${baseName}.prompt.txt`);
    const imageName = `${baseName}.png`;

    await fs.writeFile(promptPath, buildPrompt(fixture, index));
    manifestLines.push(`- ${imageName}: ${path.basename(promptPath)}`);
  }

  await fs.writeFile(path.join(OUTPUT_DIR, "README.md"), `${manifestLines.join("\n")}\n`);
  console.log(`Wrote ${fixtures.length} two-fan VS ChatGPT/GPT Image 2 prompts to ${OUTPUT_DIR}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
