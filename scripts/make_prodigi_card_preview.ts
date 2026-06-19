import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildProdigiGreetingCardArtwork } from "../lib/fulfillment/cardArtwork.ts";

const [posterPath, outputPath, ...messageParts] = process.argv.slice(2);

if (!posterPath || !outputPath) {
  throw new Error(
    "Usage: npm run prodigi:card-preview -- <poster> <output.jpg> [card message]"
  );
}

const poster = await readFile(resolve(posterPath));
const artwork = await buildProdigiGreetingCardArtwork({
  poster,
  message: messageParts.join(" "),
});

await writeFile(resolve(outputPath), artwork);
console.log(`Wrote Prodigi card preview to ${resolve(outputPath)}`);
