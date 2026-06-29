import sharp from "sharp";

export const PRODIGI_DIRECT_CARD_WIDTH = 6118;
export const PRODIGI_DIRECT_CARD_HEIGHT = 2161;

const PANEL_COUNT = 4;
const FRONT_PANEL_INDEX = 1;
const MESSAGE_PANEL_INDEX = 3;
const PANEL_INSET = 30;

export async function buildProdigiGreetingCardArtwork(input: {
  poster: Buffer;
  message?: string | null;
}) {
  const panelEdges = Array.from({ length: PANEL_COUNT + 1 }, (_, index) =>
    Math.round((PRODIGI_DIRECT_CARD_WIDTH * index) / PANEL_COUNT)
  );
  const frontLeft = panelEdges[FRONT_PANEL_INDEX];
  const frontWidth = panelEdges[FRONT_PANEL_INDEX + 1] - frontLeft;
  const messageLeft = panelEdges[MESSAGE_PANEL_INDEX];
  const messageWidth = panelEdges[MESSAGE_PANEL_INDEX + 1] - messageLeft;

  const poster = await sharp(input.poster)
    .rotate()
    .resize({
      width: frontWidth - PANEL_INSET * 2,
      height: PRODIGI_DIRECT_CARD_HEIGHT - PANEL_INSET * 2,
      fit: "contain",
      background: "#ffffff",
      withoutEnlargement: false,
    })
    .jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
    .toBuffer();

  const composites: sharp.OverlayOptions[] = [
    {
      input: poster,
      left: frontLeft + PANEL_INSET,
      top: PANEL_INSET,
    },
  ];

  const message = input.message?.trim();
  if (message) {
    composites.push({
      input: buildMessageSvg(message, messageWidth, PRODIGI_DIRECT_CARD_HEIGHT),
      left: messageLeft,
      top: 0,
    });
  }

  return sharp({
    create: {
      width: PRODIGI_DIRECT_CARD_WIDTH,
      height: PRODIGI_DIRECT_CARD_HEIGHT,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite(composites)
    .jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
    .withMetadata({ density: 300 })
    .toBuffer();
}

function buildMessageSvg(message: string, width: number, height: number) {
  const lines = wrapMessage(message, 28);
  const fontSize = lines.length > 6 ? 54 : 64;
  const lineHeight = Math.round(fontSize * 1.45);
  const firstBaseline = Math.round((height - lineHeight * (lines.length - 1)) / 2);
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${Math.round(width / 2)}" y="${firstBaseline + index * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff" />
      <text text-anchor="middle" fill="#17134a" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="600">
        ${tspans}
      </text>
    </svg>
  `);
}

function wrapMessage(message: string, maxCharacters: number) {
  const words = message.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];

  for (const word of words) {
    if (word.length > maxCharacters) {
      if (lines.length > 0 && lines[lines.length - 1].length < maxCharacters) {
        lines.push("");
      }
      for (let index = 0; index < word.length; index += maxCharacters) {
        lines.push(word.slice(index, index + maxCharacters));
      }
      continue;
    }

    const current = lines[lines.length - 1];
    if (!current) {
      lines.push(word);
    } else if (`${current} ${word}`.length <= maxCharacters) {
      lines[lines.length - 1] = `${current} ${word}`;
    } else {
      lines.push(word);
    }
  }

  return lines.filter(Boolean);
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
