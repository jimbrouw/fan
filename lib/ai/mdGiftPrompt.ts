export type MdGiftOccasion = "birthday" | "world-cup" | "matchday" | "general";

export type MdGiftPromptInput = {
  recipientName: string;
  occasion: MdGiftOccasion;
  age?: string;
  teamStyle: string;
  message?: string;
  outputFormat: "greeting-card-front" | "poster";
};

function occasionLabel(occasion: MdGiftOccasion) {
  if (occasion === "world-cup") return "World Cup football gift";
  if (occasion === "matchday") return "matchday football gift";
  if (occasion === "birthday") return "birthday football gift";
  return "football gift";
}

function outputLabel(outputFormat: MdGiftPromptInput["outputFormat"]) {
  return outputFormat === "greeting-card-front" ? "greeting card front cover" : "printable poster";
}

export function buildMdGiftImagePrompt(input: MdGiftPromptInput): string {
  const recipient = input.recipientName.trim() || "the recipient";
  const occasion = occasionLabel(input.occasion);
  const output = outputLabel(input.outputFormat);
  const ageLine = input.age?.trim() ? `Age detail: ${input.age.trim()}.` : "";
  const messageLine = input.message?.trim()
    ? `Optional gift message to include only if it can be rendered cleanly: "${input.message.trim()}".`
    : "Do not add a long message. Keep any readable text minimal and print-safe.";

  return `Create a premium illustrated football ${output} for a ${occasion}.

REFERENCE PHOTOS:
Use the uploaded photos as identity references for ${recipient}. The goal is strong recognisable resemblance, not exact photoreal duplication. Preserve face shape, hairstyle, skin tone, age, smile, eyes, nose, and overall character. Do not invent a different child or average the face into a generic player.

STYLE:
Use stylised editorial realism: a polished football magazine cover mixed with modern sports-card illustration. The result should feel intentionally designed, giftable, and print-ready, not like a fake photograph. Use painterly but precise facial detail, clean poster lighting, crisp edges, subtle halftone or paper texture, and confident football-broadcast composition. Avoid uncanny photorealism.

SUBJECT:
${recipient} is the hero football star.
${ageLine}
Team/country style: ${input.teamStyle}. Use inspired-by colours and football kit styling without unlicensed crests, official badges, official sponsors, or exact replica marks unless the user supplied them.
Show the recipient in a joyful, confident football hero pose suitable for a family gift: proud smile, ball-at-feet stance, captain pose, celebration, or player-card portrait. Keep it warm, age-appropriate, and non-aggressive.

COMPOSITION:
Design one clear hero image with a strong central likeness. Add football details around the subject: pitch texture, floodlights, scarf-like colour shapes, crowd glow, shirt number, dynamic beams, and subtle celebratory confetti. Keep the layout simple enough for a printed card/poster. Leave safe margins for print bleed.

TEXT:
Readable text must be minimal, clean, and intentional.
Allowed text: recipient name "${recipient}", optional age, short birthday/matchday phrase, shirt number, and the optional gift message below.
${messageLine}
Do not generate random advertising, fake sponsor text, fake club names, or unreadable filler words.

PRINT REQUIREMENTS:
Portrait 3:4 layout. High contrast subject, clean background, no tiny critical details near the edge, no watermark, no UI frame, no mockup on a table. Artwork should be ready to place into a print-on-demand card or poster template.

NEGATIVE PROMPT:
No harsh photoreal deepfake look. No uncanny adult face on a child body. No generic replacement face. No scary expression. No distorted hands. No malformed ball. No official club crest unless supplied. No real sponsor logos unless supplied. No copyrighted character style. No dark gamer look. No messy collage. No wall of template options.`;
}
