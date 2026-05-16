import assert from "node:assert/strict";
import test from "node:test";
import { buildMuapiVideoSubmitRequest, getMuapiVideoOutputUrl } from "../lib/ai/providers/muapiVideo.ts";

test("Seedance Lite MuAPI video request uses cheap 480p poster animation settings", () => {
  const request = buildMuapiVideoSubmitRequest({
    prompt: "Animate this Kitface poster",
    sourceImageUrl: "https://example.com/poster.png",
    durationSeconds: 5,
    model: "seedance-lite-i2v",
  });

  assert.equal(request.endpoint, "seedance-lite-i2v");
  assert.equal(request.body.image_url, "https://example.com/poster.png");
  assert.equal(request.body.resolution, "480p");
  assert.equal(request.body.duration, 5);
  assert.equal(request.body.camera_fixed, false);
});

test("WAN 2.7 MuAPI video request sends image URL and negative prompt", () => {
  const request = buildMuapiVideoSubmitRequest({
    prompt: "Subtle sports broadcast motion",
    sourceImageUrl: "https://example.com/poster.png",
    durationSeconds: 5,
    model: "wan2.7-image-to-video",
  });

  assert.equal(request.endpoint, "wan2.7-image-to-video");
  assert.equal(request.body.image_url, "https://example.com/poster.png");
  assert.equal(request.body.resolution, "720p");
  assert.match(request.body.negative_prompt ?? "", /Do not alter the face/i);
});

test("Veo 3 Fast MuAPI video request uses images_list schema", () => {
  const request = buildMuapiVideoSubmitRequest({
    prompt: "Subtle sports broadcast motion",
    sourceImageUrl: "https://example.com/poster.png",
    model: "veo3-fast-image-to-video",
  });

  assert.equal(request.endpoint, "veo3-fast-image-to-video");
  assert.deepEqual(request.body.images_list, ["https://example.com/poster.png"]);
  assert.equal(request.body.aspect_ratio, "9:16");
});

test("MuAPI video output URL extractor handles common response shapes", () => {
  assert.equal(getMuapiVideoOutputUrl({ outputs: ["https://example.com/poster.mp4"] }), "https://example.com/poster.mp4");
  assert.equal(getMuapiVideoOutputUrl({ output: { video: "https://example.com/output.mp4" } }), "https://example.com/output.mp4");
  assert.equal(getMuapiVideoOutputUrl({ video: { url: "https://example.com/video.mp4" } }), "https://example.com/video.mp4");
});
