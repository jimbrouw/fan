import { TeamProfile } from "@/lib/teamProfiles";
import { PosterStyle } from "@/lib/posterTemplates";

export function buildPosterPrompt(input: {
  teamProfile: Pick<TeamProfile, "name" | "primary" | "accent" | "kitNotes">;
  posterStyle: PosterStyle;
}): string {
  return `Photorealistic modern Premier League / EFL promotional poster collage in the style of an official 2025–26 season campaign image. Clean bright off-white background with subtle gradient haze and soft atmospheric blending around the edges. High-end sports editorial aesthetic with layered cut-out portraits and dynamic overlapping composition.

The image is built around the structure and composition of a modern football league poster:
a large central silver trophy near the bottom centre, surrounded by multiple football players in different poses, expressions and kit colours. The overall layout should feel dense, energetic, celebratory and heroic.

HOWEVER:
Every professional footballer in the composition is replaced by the specific person in the reference image (img). The same person (img) appears repeatedly throughout the collage in different poses, angles, emotions and kit variations.

Use the provided reference person (img) as the ONLY identity reference throughout the image. All faces must remain photorealistic and strictly resemble the reference person.

Kit styling for team ${input.teamProfile.name}:
${input.teamProfile.kitNotes}
Colors: Primary ${input.teamProfile.primary}, Accent ${input.teamProfile.accent}

Composition details:
* Multiple layered figures positioned around the trophy
* Some figures facing camera
* Some shouting or celebrating
* Some clapping
* Some looking serious
* Some side-profile poses
* One rear-facing pose showing shirt number
* One running pose
* One close-up portrait near centre
* One triumphant screaming pose
* One thoughtful/captain-style pose
* arms folded confidently
* flexing muscles

Lighting:
Bright premium stadium-commercial lighting with subtle rim light and clean facial definition.

Style:
${input.posterStyle.name} - ${input.posterStyle.description}. Official Premier League launch poster meets high-end sportswear advertising campaign.

Textures:
Sharp fabric detail, realistic football shirts, authentic stitching, embroidered badges, sweat texture, skin pores, natural facial lighting.

Camera aesthetic:
Mixture of medium portraits, action poses and telephoto sports photography compressed into one layered collage.

Colour palette:
* Kits from ${input.teamProfile.name}
* subtle sky blue accents
* silver trophy reflections
* soft pink atmospheric haze

Important:
* Keep the overall structure and energy of a football collage poster
* Preserve the dense overlapping composition
* No text except realistic shirt numbers/logos
* No cartoon style
* No AI-art distortion
* Faces must remain strictly consistent across all appearances
* Highly realistic sports photography aesthetic
* 4K ultra-detailed finish`;
}
