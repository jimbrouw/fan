import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFalGptImage2EditInput,
  decodeFalGptImageProviderJobId,
  encodeFalGptImageProviderJobId,
} from "../lib/ai/providers/fal.ts";

test("fal GPT Image 2 edit input uses maximum 3:4 high-quality PNG settings", () => {
  const input = buildFalGptImage2EditInput({
    prompt: "Create a premium football poster",
    referenceImageUrls: ["https://example.com/person.jpg", "https://example.com/kit.jpg"],
  });

  assert.equal(input.prompt, "Create a premium football poster");
  assert.deepEqual(input.image_urls, ["https://example.com/person.jpg", "https://example.com/kit.jpg"]);
  assert.deepEqual(input.image_size, { width: 2496, height: 3312 });
  assert.equal(input.quality, "high");
  assert.equal(input.output_format, "png");
});

test("fal GPT Image 2 provider ids round-trip with a stable prefix", () => {
  const encoded = encodeFalGptImageProviderJobId("fal-request-123");

  assert.equal(encoded, "fal:gpt-image-2-edit:fal-request-123");
  assert.equal(decodeFalGptImageProviderJobId(encoded), "fal-request-123");
  assert.equal(decodeFalGptImageProviderJobId("muapi-request-123"), null);
});
