
import { isUsableRemoteImageUrl } from "../lib/remoteImages.ts";

async function test() {
  const url = "https://cdn.footballkitarchive.com/2025/08/05/du0Arc2gsNuIftL.jpg";
  console.log(`Checking ${url}...`);
  const usable = await isUsableRemoteImageUrl(url);
  console.log(`Usable: ${usable}`);
}

test().catch(console.error);
