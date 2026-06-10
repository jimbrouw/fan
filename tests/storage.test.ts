import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSupabaseStorageUri,
  getCaptureSignedUrlTtlSeconds,
  parseSupabaseStorageUri,
} from "../lib/supabase/storage.ts";

test("buildSupabaseStorageUri creates stable private storage references", () => {
  assert.equal(
    buildSupabaseStorageUri("fan-hero-captures", "session-1/neutral_front.jpg"),
    "supabase://fan-hero-captures/session-1/neutral_front.jpg"
  );
});

test("parseSupabaseStorageUri returns bucket and path", () => {
  assert.deepEqual(
    parseSupabaseStorageUri("supabase://fan-hero-captures/session-1/neutral_front.jpg"),
    {
      bucket: "fan-hero-captures",
      path: "session-1/neutral_front.jpg",
    }
  );
});

test("parseSupabaseStorageUri rejects non-storage URLs", () => {
  assert.equal(parseSupabaseStorageUri("https://example.com/image.jpg"), null);
  assert.equal(parseSupabaseStorageUri("supabase://missing-path"), null);
});

test("getCaptureSignedUrlTtlSeconds uses a six-hour default", () => {
  const previous = process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS;
  delete process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS;

  try {
    assert.equal(getCaptureSignedUrlTtlSeconds(), 21600);
  } finally {
    if (previous === undefined) {
      delete process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS;
    } else {
      process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS = previous;
    }
  }
});

test("getCaptureSignedUrlTtlSeconds ignores invalid values", () => {
  const previous = process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS;
  process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS = "not-a-number";

  try {
    assert.equal(getCaptureSignedUrlTtlSeconds(), 21600);
  } finally {
    if (previous === undefined) {
      delete process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS;
    } else {
      process.env.SUPABASE_CAPTURE_SIGNED_URL_TTL_SECONDS = previous;
    }
  }
});
