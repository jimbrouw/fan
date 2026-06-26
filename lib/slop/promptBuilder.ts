import type { ReelItem } from "./reelData";

export function buildSlopPrompt(input: {
  style: ReelItem;
  colour: ReelItem;
  chaos: ReelItem;
}): string {
  const { style, colour, chaos } = input;

  return [
    `Award-winning masterpiece 8K ultra-HD photorealistic ${style.promptFrag}`,
    `of the person in this reference photo,`,
    `rendered with ${colour.promptFrag},`,
    `where ${chaos.promptFrag}.`,
    `Perfect anatomy. Professional lighting. Extremely high quality. Stunning. Breathtaking.`,
    `Best image ever created. No artifacts whatsoever.`,
  ].join(" ");
}
