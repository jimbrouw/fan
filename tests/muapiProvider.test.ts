import assert from "node:assert/strict";
import test from "node:test";
import { buildMuapiSubmitRequest } from "../lib/ai/providers/muapi.ts";

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
