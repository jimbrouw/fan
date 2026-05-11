import assert from "node:assert/strict";
import test from "node:test";
import { hasSupportedImageSignature } from "../lib/remoteImages.ts";

test("detects supported image signatures", () => {
  assert.equal(hasSupportedImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), true);
  assert.equal(hasSupportedImageSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), true);
});

test("rejects html masquerading as an image URL response", () => {
  const htmlBytes = new TextEncoder().encode("<!DOCTYPE html><html><body>blocked</body></html>");

  assert.equal(hasSupportedImageSignature(htmlBytes), false);
});
