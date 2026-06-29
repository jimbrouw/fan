export type ReelItem = {
  id: string;
  label: string;
  emoji: string;
  promptFrag: string;
};

export const styleReel: ReelItem[] = [
  { id: "oil", label: "Oil Painting", emoji: "🎨", promptFrag: "highly detailed oil painting" },
  { id: "pixel", label: "Pixel Art", emoji: "👾", promptFrag: "retro 8-bit pixel art" },
  { id: "watercolor", label: "Watercolor", emoji: "💧", promptFrag: "soft watercolor illustration" },
  { id: "3d", label: "3D Render", emoji: "🌐", promptFrag: "glossy 3D CGI render" },
  { id: "anime", label: "Anime", emoji: "⚡", promptFrag: "anime illustration" },
  { id: "tapestry", label: "Medieval Tapestry", emoji: "🏰", promptFrag: "medieval illuminated tapestry" },
  { id: "stock", label: "Stock Photo", emoji: "📸", promptFrag: "generic stock photography" },
];

export const colourReel: ReelItem[] = [
  { id: "vaporwave", label: "Vaporwave", emoji: "💜", promptFrag: "vaporwave pink and purple neon palette" },
  { id: "rainbow", label: "Rainbow Vomit", emoji: "🌈", promptFrag: "maximum saturated rainbow colours everywhere" },
  { id: "mono", label: "Gritty Mono", emoji: "⚫", promptFrag: "gritty high contrast black and white" },
  { id: "pastel", label: "Soft Pastels", emoji: "🍑", promptFrag: "soft muted pastel colour palette" },
  { id: "neon", label: "Neon Fever", emoji: "⚡", promptFrag: "neon glowing electric colours on dark background" },
  { id: "sunset", label: "Sunset Gradient", emoji: "🌅", promptFrag: "warm orange and golden sunset tones" },
  { id: "beige", label: "Corporate Beige", emoji: "🪣", promptFrag: "boring corporate beige and grey colour palette" },
];

export const chaosReel: ReelItem[] = [
  { id: "fingers", label: "7 Fingers", emoji: "🖐️", promptFrag: "each hand has seven fingers" },
  { id: "melting", label: "Melting Faces", emoji: "😵", promptFrag: "face slightly melting like a Salvador Dali painting" },
  { id: "eyes", label: "Extra Eyes", emoji: "👁️", promptFrag: "extra eyes appearing randomly on the forehead" },
  { id: "knees", label: "Backwards Knees", emoji: "🦵", promptFrag: "knees bending backwards at wrong angle" },
  { id: "teeth", label: "Teeth Everywhere", emoji: "😬", promptFrag: "far too many teeth visible, teeth in unusual places" },
  { id: "limbs", label: "Bonus Limbs", emoji: "💪", promptFrag: "extra arm appearing from shoulder area" },
  { id: "ears", label: "Missing Ears", emoji: "👂", promptFrag: "mysteriously missing both ears completely" },
];

export const ALL_REELS = [styleReel, colourReel, chaosReel] as const;
