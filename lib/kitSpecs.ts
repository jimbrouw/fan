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
    teamId: "arsenal",
    team: "Arsenal",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "Emirates",
    sleeveSponsor: undefined,
    baseColor: "red body with white sleeves",
    accentColors: ["white"],
    pattern: "contrasting-sleeve home shirt with a red main body and white sleeves",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/arsenal-fc-2025-26-home-kit-362997/"
    ],
    confidence: "low"
  },
  {
    teamId: "aston-villa",
    team: "Aston Villa",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "Betano",
    sleeveSponsor: undefined,
    baseColor: "claret body with sky blue sleeves",
    accentColors: ["sky blue", "gold"],
    pattern: "contrasting-sleeve home shirt with burgundy main color and blue and gold details",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/aston-villa-2025-26-home-kit-375022/"
    ],
    confidence: "low"
  },
  {
    teamId: "bournemouth",
    team: "AFC Bournemouth",
    season: kitSeason,
    variant: "home",
    manufacturer: "Umbro",
    mainSponsor: "bj88",
    sleeveSponsor: undefined,
    baseColor: "red and black vertical stripes",
    accentColors: ["black", "gold"],
    pattern: "red and black striped home shirt with rippled sand pattern inside the red stripes",
    collar: "collar with gold trim",
    cuffs: "sleeves with gold trim",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "black shorts",
    socks: "black socks",
    sourceUrls: [
      "https://www.footballkitarchive.com/afc-bournemouth-2025-26-home-kit-389299/"
    ],
    confidence: "low"
  },
  {
    teamId: "brentford",
    team: "Brentford",
    season: kitSeason,
    variant: "home",
    manufacturer: "Joma",
    mainSponsor: "Hollywoodbets",
    sleeveSponsor: undefined,
    baseColor: "red and white vertical stripes",
    accentColors: ["black", "white"],
    pattern: "wide red and white vertical stripes with tonal pinstriping in the red areas",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/brentford-fc-2025-26-home-kit-384099/"
    ],
    confidence: "low"
  },
  {
    teamId: "brighton",
    team: "Brighton & Hove Albion",
    season: kitSeason,
    variant: "home",
    manufacturer: "Nike",
    mainSponsor: "American Express",
    sleeveSponsor: undefined,
    baseColor: "blue and white stripes",
    accentColors: ["blue", "white", "hyper turq"],
    pattern: "bold blue and white stripes either side of a central blue panel with mostly white reverse",
    collar: "unknown",
    cuffs: "blue sleeves edged with white cuffs",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/brighton-hove-albion-2025-26-home-kit-384793/"
    ],
    confidence: "low"
  },
  {
    teamId: "burnley",
    team: "Burnley",
    season: kitSeason,
    variant: "home",
    manufacturer: "Castore",
    mainSponsor: "96",
    sleeveSponsor: undefined,
    baseColor: "claret",
    accentColors: ["sky blue", "white"],
    pattern: "claret home shirt with topographical contour-line graphic inspired by Lancashire hills",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/burnley-fc-2025-26-home-kit-384949/"
    ],
    confidence: "low"
  },
  {
    teamId: "chelsea",
    team: "Chelsea",
    season: kitSeason,
    variant: "home",
    manufacturer: "Nike",
    mainSponsor: "unknown",
    sleeveSponsor: undefined,
    baseColor: "blue",
    accentColors: ["white", "red"],
    pattern: "traditional blue home shirt with grunge graphic detailing",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/chelsea-fc-2025-26-home-kit-402045/"
    ],
    confidence: "low"
  },
  {
    teamId: "crystal-palace",
    team: "Crystal Palace",
    season: kitSeason,
    variant: "home",
    manufacturer: "Macron",
    mainSponsor: "NET88",
    sleeveSponsor: undefined,
    baseColor: "red and royal blue vertical stripes",
    accentColors: ["royal blue", "white"],
    pattern: "bold red and royal blue vertical stripes separated by thin white pinstripes",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/crystal-palace-2025-26-home-kit-387542/"
    ],
    confidence: "low"
  },
  {
    teamId: "everton",
    team: "Everton",
    season: kitSeason,
    variant: "home",
    manufacturer: "Castore",
    mainSponsor: "Stake",
    sleeveSponsor: undefined,
    baseColor: "royal blue",
    accentColors: ["navy", "white"],
    pattern: "royal blue home shirt with subtle tonal horizontal wavy line pattern",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/everton-fc-2025-26-home-kit-370187/"
    ],
    confidence: "low"
  },
  {
    teamId: "fulham",
    team: "Fulham",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "SBOBet",
    sleeveSponsor: undefined,
    baseColor: "white",
    accentColors: ["black"],
    pattern: "all-white home shirt with Craven Cottage balcony ironwork woven into the fabric",
    collar: "white neck with black accents",
    cuffs: "white cuffs with black accents",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "white shorts with black piping",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/fulham-fc-2025-26-home-kit-393305/"
    ],
    confidence: "low"
  },
  {
    teamId: "leeds",
    team: "Leeds United",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "Red Bull",
    sleeveSponsor: undefined,
    baseColor: "white",
    accentColors: ["blue", "yellow"],
    pattern: "plain white home shirt with blue adidas shoulder stripes",
    collar: "collar with unique blue and yellow pattern",
    cuffs: "sleeve cuffs with unique blue and yellow pattern",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/leeds-united-2025-26-home-kit-384063/"
    ],
    confidence: "low"
  },
  {
    teamId: "liverpool",
    team: "Liverpool",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "Standard Chartered",
    sleeveSponsor: undefined,
    baseColor: "strawberry red",
    accentColors: ["white"],
    pattern: "plain red home shirt with white logos",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/liverpool-fc-2025-26-home-kit-329216/"
    ],
    confidence: "low"
  },
  {
    teamId: "man-city",
    team: "Manchester City",
    season: kitSeason,
    variant: "home",
    manufacturer: "Puma",
    mainSponsor: "Etihad Airways",
    sleeveSponsor: undefined,
    baseColor: "sky blue",
    accentColors: ["white", "black"],
    pattern: "sky blue home shirt with sash design and white accents",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/manchester-city-2025-26-home-kit-349847/"
    ],
    confidence: "low"
  },
  {
    teamId: "man-united",
    team: "Manchester United",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "Snapdragon",
    sleeveSponsor: undefined,
    baseColor: "red",
    accentColors: ["black", "white"],
    pattern: "red graphic home shirt with white logos",
    collar: "black collar with white trim",
    cuffs: "black sleeve cuffs with white trim",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/manchester-united-2025-26-home-kit-365645/"
    ],
    confidence: "low"
  },
  {
    teamId: "newcastle",
    team: "Newcastle United",
    season: kitSeason,
    variant: "home",
    manufacturer: "adidas",
    mainSponsor: "Sela",
    sleeveSponsor: undefined,
    baseColor: "black and white stripes",
    accentColors: ["sky blue"],
    pattern: "black and white stripes with serrated Shepherd's Check edges",
    collar: "collar with light blue piping",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/newcastle-united-2025-26-home-kit-370607/"
    ],
    confidence: "low"
  },
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
      "https://www.footballkitarchive.com/nottingham-forest-2025-26-home-kit-397475/",
      "https://www.premierleague.com/en/news/4353461",
      "https://www.premierleague.com/news/4352974"
    ],
    confidence: "high"
  },
  {
    teamId: "sunderland",
    team: "Sunderland",
    season: kitSeason,
    variant: "home",
    manufacturer: "Hummel",
    mainSponsor: "W88",
    sleeveSponsor: undefined,
    baseColor: "red and white vertical stripes",
    accentColors: ["black"],
    pattern: "red and white vertical stripes with segmented red stripe detailing",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/sunderland-afc-2025-26-home-kit-376009/"
    ],
    confidence: "low"
  },
  {
    teamId: "tottenham",
    team: "Tottenham Hotspur",
    season: kitSeason,
    variant: "home",
    manufacturer: "Nike",
    mainSponsor: "AIA",
    sleeveSponsor: undefined,
    baseColor: "white",
    accentColors: ["navy"],
    pattern: "predominantly white home shirt with contrasting sleeve design",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/tottenham-hotspur-2025-26-home-kit-329780/"
    ],
    confidence: "low"
  },
  {
    teamId: "west-ham",
    team: "West Ham United",
    season: kitSeason,
    variant: "home",
    manufacturer: "Umbro",
    mainSponsor: "Boylesports",
    sleeveSponsor: undefined,
    baseColor: "claret",
    accentColors: ["sky blue", "white"],
    pattern: "minimal all-claret home shirt with tonal blue underarm inserts",
    collar: "ribbed collar with alternating claret and blue stripes",
    cuffs: "ribbed sleeve cuffs with alternating claret and blue stripes",
    crestPlacement: "full-color club crest on the front",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/west-ham-united-2025-26-home-kit-385259/"
    ],
    confidence: "low"
  },
  {
    teamId: "wolves",
    team: "Wolverhampton Wanderers",
    season: kitSeason,
    variant: "home",
    manufacturer: "Sudu",
    mainSponsor: "DEBET",
    sleeveSponsor: undefined,
    baseColor: "gold",
    accentColors: ["black"],
    pattern: "gold home shirt with subtle print inspired by Molineux Pleasure Grounds",
    collar: "unknown",
    cuffs: "unknown",
    crestPlacement: "unknown",
    sponsorPlacement: "unknown",
    shorts: "unknown",
    socks: "unknown",
    sourceUrls: [
      "https://www.footballkitarchive.com/wolverhampton-wanderers-2025-26-home-kit-365548/"
    ],
    confidence: "low"
  }
];

const fallbackKitSpecs: KitSpec[] = [
  {
    teamId: "nottingham-forest",
    team: "Nottingham Forest",
    season: kitSeason,
    variant: "away",
    manufacturer: "adidas",
    mainSponsor: "Bally's",
    sleeveSponsor: "Ideagen",
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
  return [...kitSpecs, ...fallbackKitSpecs].find((spec) => spec.teamId === teamId && spec.variant === variant);
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
