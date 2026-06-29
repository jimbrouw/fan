export type PortraitStyle = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  /** CSS gradient for the thumbnail placeholder */
  thumbnail: {
    background: string;
    foreground: string;
    accent: string;
    emoji: string;
  };
};

export const PORTRAIT_STYLES: PortraitStyle[] = [
  {
    id: "pixar",
    name: "Pixar",
    description: "3D animated character",
    prompt:
      "Transform this person into a Pixar 3D animated character. Preserve their facial structure, hair, and expression so they remain clearly recognisable. Render as a high-quality 3D CGI character: smooth skin, slightly large expressive eyes, warm studio lighting, clean rounded surfaces. Pixar film quality. Portrait framing, shoulders and above. No background clutter.",
    thumbnail: {
      background: "linear-gradient(160deg, #FF9F0A 0%, #FF6B00 100%)",
      foreground: "#FFFFFF",
      accent: "#FFD60A",
      emoji: "✨",
    },
  },
  {
    id: "ghibli",
    name: "Studio Ghibli",
    description: "Hand-drawn anime portrait",
    prompt:
      "Transform this person into a Studio Ghibli anime character. Preserve their face shape, hair colour, and personality so they remain recognisable. Hand-drawn watercolour anime style: soft muted palette, gentle confident linework, warm Miyazaki aesthetic, expressive simplified features. Clean background with soft sky or nature tones. Portrait framing, shoulders and above.",
    thumbnail: {
      background: "linear-gradient(160deg, #5EADD4 0%, #7BC4A0 100%)",
      foreground: "#FFFFFF",
      accent: "#A8E6CF",
      emoji: "🌿",
    },
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    description: "Classical portrait masterpiece",
    prompt:
      "Transform this person into a classical oil painting portrait. Preserve their exact likeness. Old Masters technique: rich warm tones, visible confident brushstrokes, dramatic Rembrandt-style lighting from one side, deep shadow areas, canvas texture visible in the background. Museum-quality portrait. Shoulders and above.",
    thumbnail: {
      background: "linear-gradient(160deg, #8B4513 0%, #D4A853 100%)",
      foreground: "#FFF8E7",
      accent: "#FFD700",
      emoji: "🖼️",
    },
  },
  {
    id: "pop-art",
    name: "Pop Art",
    description: "Andy Warhol screen-print",
    prompt:
      "Transform this person into a pop art portrait in the style of Andy Warhol. Preserve their face structure and hair. Bold flat graphic colours, high contrast, halftone dot pattern visible in the shadow areas, strong black outlines, limited 4-colour palette, 1960s screen-print aesthetic. Portrait framing, shoulders and above.",
    thumbnail: {
      background: "linear-gradient(160deg, #FF2D55 0%, #FFD60A 100%)",
      foreground: "#1C1C1E",
      accent: "#FF9F0A",
      emoji: "🎨",
    },
  },
  {
    id: "comic",
    name: "Comic Book",
    description: "Superhero panel portrait",
    prompt:
      "Transform this person into a comic book character portrait. Preserve their facial features and hair. Bold black ink outlines, flat cel-shaded colours, halftone dot shading in shadow areas, dynamic side lighting, Marvel or DC comic art quality. Action hero framing. Portrait, shoulders and above.",
    thumbnail: {
      background: "linear-gradient(160deg, #1C1C2E 0%, #0A84FF 100%)",
      foreground: "#FFFFFF",
      accent: "#FFD60A",
      emoji: "💥",
    },
  },
  {
    id: "watercolour",
    name: "Watercolour",
    description: "Soft illustrated portrait",
    prompt:
      "Transform this person into a watercolour illustrated portrait. Preserve their likeness. Soft wet-on-wet colour washes, loose expressive brushwork, delicate colour bleeds at edges, white paper highlights showing through, contemporary portrait illustration style. Clean white or pale background. Shoulders and above.",
    thumbnail: {
      background: "linear-gradient(160deg, #BF5AF2 0%, #64D2FF 100%)",
      foreground: "#FFFFFF",
      accent: "#FF9F0A",
      emoji: "💧",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon future portrait",
    prompt:
      "Transform this person into a cyberpunk neon-lit portrait. Preserve their face and identity. Dark near-black background, vivid neon pink and electric cyan rim lighting, futuristic atmospheric depth, high contrast, rain-slicked reflections in the background. Editorial photography meets sci-fi concept art. Shoulders and above.",
    thumbnail: {
      background: "linear-gradient(160deg, #0A0A1A 0%, #2D0A3F 100%)",
      foreground: "#FF2D9B",
      accent: "#00D4FF",
      emoji: "⚡",
    },
  },
  {
    id: "sketch",
    name: "Pencil Sketch",
    description: "Hand-drawn graphite portrait",
    prompt:
      "Transform this person into a detailed pencil sketch portrait. Preserve their likeness. Graphite pencil on white paper: realistic shading with hatching and cross-hatching, fine line detail on facial features, clean white highlights. Classical portrait drawing technique. White or off-white background. Shoulders and above.",
    thumbnail: {
      background: "linear-gradient(160deg, #F2F2F7 0%, #C7C7CC 100%)",
      foreground: "#1C1C1E",
      accent: "#636366",
      emoji: "✏️",
    },
  },
];

export function getStyleById(id: string): PortraitStyle | undefined {
  return PORTRAIT_STYLES.find((s) => s.id === id);
}
