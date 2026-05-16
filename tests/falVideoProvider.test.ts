import assert from "node:assert/strict";
import test from "node:test";
import { buildFalSeedanceVideoInput, getFalVideoOutputUrl } from "../lib/ai/providers/falVideo.ts";

test("FAL Seedance video input preserves aspect ratio and disables audio", () => {
  const input = buildFalSeedanceVideoInput({
    prompt: "Animate this poster",
    sourceImageUrl: "https://example.com/poster.png",
    durationSeconds: 4,
  });

  assert.equal(input.prompt, "Animate this poster");
  assert.equal(input.image_url, "https://example.com/poster.png");
  assert.equal(input.duration, "4");
  assert.equal(input.aspect_ratio, "auto");
  assert.equal(input.generate_audio, false);
});

test("FAL Seedance video result extracts MP4 output URL", () => {
  assert.equal(
    getFalVideoOutputUrl({ video: { url: "https://example.com/poster.mp4" } }),
    "https://example.com/poster.mp4"
  );
});
