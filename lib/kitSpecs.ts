export const kitSeason = "2025/26" as const;

export type KitVariant = "home" | "away" | "third";

export type KitSpec = {
  teamId: string;
  team: string;
  season: typeof kitSeason;
  variant: KitVariant;
  manufacturer: string;
  mainSponsor: string;
  sleeveSponsor?: string;
  baseColor: string;
  accentColors: string[];
  pattern: string;
  collar: string;
  cuffs: string;
  crestPlacement: string;
  sponsorPlacement: string;
  shorts: string;
  socks: string;
  referenceImageUrl?: string;
  sourceUrls: string[];
  confidence: "high" | "medium" | "low";
};

export const kitVariants: Array<{ id: KitVariant; label: string }> = [
  { id: "home", label: "Home" },
  { id: "away", label: "Away" },
  { id: "third", label: "Third" }
];

const kitSpecs: KitSpec[] = [
  {
    teamId: "nottingham-forest",
    team: "Nottingham Forest",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "Bally's",
    sleeveSponsor: "Ideagen",
    baseColor: "bright Nottingham Forest red",
    accentColors: ["white", "dark red"],
    pattern: "thin vertical white pinstripes with additional subtle dark red pinstripes on the red shirt base",
    collar: "red polo collar with white trim and a single-button placket",
    cuffs: "red sleeve cuffs with a narrow white horizontal trim stripe",
    crestPlacement: "Nottingham Forest crest inside a white shield on the wearer's left chest, with two stars above",
    sponsorPlacement: "white Bally's script sponsor large across the centre chest",
    shorts: "white shorts with red adidas detailing",
    socks: "red socks with white adidas striping",
    referenceImageUrl: "https://cdn.footballkitarchive.com/2025/08/05/du0Arc2gsNuIftL.jpg",
    sourceUrls: [
      "https://www.footballkitarchive.com/nottingham-forest-2025-26-home-kit/397475/",
      "https://www.premierleague.com/news/4353461"
    ],
    confidence: "high"
  },
  {
    teamId: "nottingham-forest",
    team: "Nottingham Forest",
    season: kitSeason,
    variant: "away",
    manufacturer: "adidas",
    mainSponsor: "Bally's",
    baseColor: "off-white",
    accentColors: ["dark navy", "light grey"],
    pattern: "subtle lace-inspired tonal graphic pattern across the shirt body",
    collar: "simple off-white crew collar",
    cuffs: "off-white sleeve cuffs with minimal dark navy detailing",
    crestPlacement: "dark navy Nottingham Forest crest on the wearer's left chest",
    sponsorPlacement: "dark navy Bally's script sponsor across the centre chest",
    shorts: "off-white shorts with dark navy adidas detailing",
    socks: "off-white socks with dark navy accents",
    referenceImageUrl: "https://cdn.footballkitarchive.com/2025/03/25/dPYlxmgolrTZrPS.jpg",
    sourceUrls: [
      "https://www.footballkitarchive.com/nottingham-forest-2025-26-away-kit/357963/"
    ],
    confidence: "medium"
  },
  {
    teamId: "nottingham-forest",
    team: "Nottingham Forest",
    season: kitSeason,
    variant: "third",
    manufacturer: "adidas",
    mainSponsor: "Bally's",
    sleeveSponsor: "Ideagen",
    baseColor: "navy legend ink",
    accentColors: ["solar red", "dark navy"],
    pattern: "tonal navy graphic waves pattern across the front of the shirt",
    collar: "navy crew collar with bright solar red rear and shoulder accents",
    cuffs: "navy sleeve cuffs with solar red piping",
    crestPlacement: "solar red Nottingham Forest crest on the wearer's left chest, with two stars above",
    sponsorPlacement: "solar red Bally's script sponsor across the centre chest",
    shorts: "navy shorts with solar red adidas detailing",
    socks: "navy socks with solar red adidas striping",
    referenceImageUrl: "https://www.footballkitarchive.com/cdn/2025/08/29/N4FMH83z3OWAdP9/nottingham-forest-2025-26-third-kit.jpg",
    sourceUrls: [
      "https://www.footballkitarchive.com/nottingham-forest-2025-26-third-kit-405292/"
    ],
    confidence: "high"
  }
];

export function getKitSpec(teamId: string, variant: KitVariant): KitSpec | undefined {
  return kitSpecs.find((spec) => spec.teamId === teamId && spec.variant === variant);
}

export function describeKitSpec(spec: KitSpec): string {
  return [
    `${spec.season} ${spec.team} ${spec.variant} kit`,
    `Manufacturer: ${spec.manufacturer}`,
    `Main sponsor: ${spec.mainSponsor}`,
    spec.sleeveSponsor ? `Sleeve sponsor: ${spec.sleeveSponsor}` : undefined,
    `Base color: ${spec.baseColor}`,
    `Accent colors: ${spec.accentColors.join(", ")}`,
    `Pattern: ${spec.pattern}`,
    `Collar: ${spec.collar}`,
    `Cuffs: ${spec.cuffs}`,
    `Crest placement: ${spec.crestPlacement}`,
    `Sponsor placement: ${spec.sponsorPlacement}`,
    `Shorts: ${spec.shorts}`,
    `Socks: ${spec.socks}`
  ].filter(Boolean).join("\n");
}
