import assert from "node:assert/strict";
import test from "node:test";
import { buildPrintfulDraftOrderPayload } from "../lib/fulfillment/printful.ts";

test("buildPrintfulDraftOrderPayload creates a draft catalog order with the poster file layer", () => {
  const payload = buildPrintfulDraftOrderPayload({
    externalId: "kitface-job-123",
    catalogVariantId: 12345,
    printFileUrl: "https://example.com/upscaled-poster.png",
    placement: "default",
    technique: "digital",
    recipient: {
      name: "Kitface Test",
      address1: "1 Test Street",
      city: "London",
      country_code: "GB",
      zip: "SW1A 1AA"
    }
  });

  assert.equal(payload.external_id, "kitface-job-123");
  assert.equal(payload.recipient.country_code, "GB");
  assert.equal(payload.order_items[0].catalog_variant_id, 12345);
  assert.equal(payload.order_items[0].source, "catalog");
  assert.equal(payload.order_items[0].quantity, 1);
  assert.equal(payload.order_items[0].placements[0].placement, "default");
  assert.equal(payload.order_items[0].placements[0].technique, "digital");
  assert.deepEqual(payload.order_items[0].placements[0].layers[0], {
    type: "file",
    url: "https://example.com/upscaled-poster.png"
  });
});
