import assert from "node:assert/strict";
import test from "node:test";
import { buildSupabaseStorageUri, isSupportedVideoTestImagePath } from "../lib/supabase/videoTestImages.ts";

test("video test image path filter accepts supported image files", () => {
  assert.equal(isSupportedVideoTestImagePath("front.jpg"), true);
  assert.equal(isSupportedVideoTestImagePath("nested/profile.PNG"), true);
  assert.equal(isSupportedVideoTestImagePath("test.webp"), true);
});

test("video test image path filter rejects unsupported files", () => {
  assert.equal(isSupportedVideoTestImagePath("clip.mp4"), false);
  assert.equal(isSupportedVideoTestImagePath("notes.txt"), false);
});

test("Supabase storage URI is stable for video test job reuse", () => {
  assert.equal(
    buildSupabaseStorageUri("f9cbab46-9d5e-41e4-9261-70e1e5477a8d", "front.jpg"),
    "supabase://f9cbab46-9d5e-41e4-9261-70e1e5477a8d/front.jpg",
  );
});
