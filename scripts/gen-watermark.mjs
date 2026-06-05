// One-time script: generates public/watermark-tile.png in the target directory.
// Usage: node scripts/gen-watermark.mjs [outDir]
//   outDir defaults to the current project's public/ folder
// Run from the repo root: node scripts/gen-watermark.mjs ../fan/.claude/worktrees/optimistic-feynman-d71d04/public

import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outDir = process.argv[2] ?? path.join(__dirname, "..", "public");
const outPath = path.join(outDir, "watermark-tile.png");

const TILE_W = 320;
const TILE_H = 160;

const svg = `<svg width="${TILE_W}" height="${TILE_H}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="10" y="110"
    font-family="sans-serif"
    font-size="36"
    font-weight="bold"
    fill="white"
    fill-opacity="0.38"
    letter-spacing="2">kitface.app</text>
</svg>`;

await sharp({
  create: {
    width: TILE_W,
    height: TILE_H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: Buffer.from(svg), blend: "over" }])
  .png()
  .toFile(outPath);

console.log("Watermark tile written to", outPath);
