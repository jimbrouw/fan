import assert from "node:assert/strict";
import test from "node:test";
import { buildMuapiSubmitRequest, isTransientMuapiStatusError } from "../lib/ai/providers/muapi.ts";

test("wan2.7-image-edit maps to the MuAPI image-edit endpoint with image references", () => {
  const request = buildMuapiSubmitRequest({
    prompt: "Create a football poster",
    referenceImageUrls: ["https://example.com/person.jpg", "https://example.com/kit.jpg"],
    model: "wan2.7-image-edit"
  });

  assert.equal(request.endpoint, "wan2.7-image-edit");
  assert.equal(request.body.prompt, "Create a football poster");
  assert.deepEqual(request.body.images_list, ["https://example.com/person.jpg", "https://example.com/kit.jpg"]);
  assert.equal(request.body.image_url, undefined);
});

test("gpt-image-2 defaults to the smallest fastest MuAPI image-to-image settings", () => {
  const request = buildMuapiSubmitRequest({
    prompt: "Create a quick football poster proof",
    referenceImageUrls: ["https://example.com/person.jpg"],
    model: "gpt-image-2"
  });

  assert.equal(request.endpoint, "gpt-image-2-image-to-image");
  assert.deepEqual(request.body.images_list, ["https://example.com/person.jpg"]);
  assert.equal(request.body.resolution, "1K");
  assert.equal(request.body.quality, "low");
});

test("gpt-image-2 can use medium 1K draft settings", () => {
  const request = buildMuapiSubmitRequest({
    prompt: "Create a better football poster proof",
    referenceImageUrls: ["https://example.com/person.jpg"],
    model: "gpt-image-2",
    gptImageTestMode: "draft-1k-medium"
  });

  assert.equal(request.endpoint, "gpt-image-2-image-to-image");
  assert.equal(request.body.resolution, "1K");
  assert.equal(request.body.quality, "medium");
});

test("gpt-image-2 can use high-quality final settings", () => {
  const request = buildMuapiSubmitRequest({
    prompt: "Create a finished football poster",
    referenceImageUrls: ["https://example.com/person.jpg"],
    model: "gpt-image-2",
    gptImageTestMode: "final-2k-high"
  });

  assert.equal(request.endpoint, "gpt-image-2-image-to-image");
  assert.equal(request.body.resolution, "2K");
  assert.equal(request.body.quality, "high");
});

test("gpt-image-2 unknown modes fall back to safe low settings", () => {
  const request = buildMuapiSubmitRequest({
    prompt: "Create a maximum-quality football poster",
    referenceImageUrls: ["https://example.com/person.jpg"],
    model: "gpt-image-2",
    gptImageTestMode: "unknown-mode" as never
  });

  assert.equal(request.endpoint, "gpt-image-2-image-to-image");
  assert.equal(request.body.resolution, "1K");
  assert.equal(request.body.quality, "low");
});

test("MuAPI transient status errors are retryable instead of terminal failures", () => {
  assert.equal(isTransientMuapiStatusError(500, { error: "Internal Error. Please try again later." }), true);
  assert.equal(isTransientMuapiStatusError(502, {}), true);
  assert.equal(isTransientMuapiStatusError(429, { message: "Rate limit" }), true);
  assert.equal(isTransientMuapiStatusError(400, { error: "Invalid image URL" }), false);
});
