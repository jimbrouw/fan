import assert from "node:assert/strict";
import test from "node:test";
import { buildPrintfulDraftOrderPayload, readPrintfulDraftOrderConfig } from "../lib/fulfillment/printful.ts";

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

test("readPrintfulDraftOrderConfig defaults card orders to the Printful greeting card front", () => {
  const previous = snapshotPrintfulEnv();
  try {
    setRecipientEnv();
    delete process.env.PRINTFUL_CARD_VARIANT_ID;
    delete process.env.PRINTFUL_GREETING_CARD_VARIANT_ID;
    process.env.PRINTFUL_POSTER_VARIANT_ID = "48504";

    const config = readPrintfulDraftOrderConfig("fathers-day-card");

    assert.equal(config.catalogVariantId, 14457);
    assert.equal(config.placement, "front");
    assert.equal(config.technique, "digital");
    assert.equal(config.productType, "card");
  } finally {
    restorePrintfulEnv(previous);
  }
});

test("readPrintfulDraftOrderConfig keeps A3 poster mapping for poster orders", () => {
  const previous = snapshotPrintfulEnv();
  try {
    setRecipientEnv();
    process.env.PRINTFUL_POSTER_VARIANT_ID = "48504";
    process.env.PRINTFUL_POSTER_PLACEMENT = "default";
    process.env.PRINTFUL_POSTER_TECHNIQUE = "digital";

    const config = readPrintfulDraftOrderConfig("poster");

    assert.equal(config.catalogVariantId, 48504);
    assert.equal(config.placement, "default");
    assert.equal(config.technique, "digital");
    assert.equal(config.productType, "poster");
  } finally {
    restorePrintfulEnv(previous);
  }
});

function setRecipientEnv() {
  process.env.PRINTFUL_TEST_RECIPIENT_ADDRESS1 = "1 Test Street";
  process.env.PRINTFUL_TEST_RECIPIENT_CITY = "London";
  process.env.PRINTFUL_TEST_RECIPIENT_COUNTRY_CODE = "GB";
  process.env.PRINTFUL_TEST_RECIPIENT_ZIP = "SW1A 1AA";
}

function snapshotPrintfulEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith("PRINTFUL_"))
  );
}

function restorePrintfulEnv(snapshot: Record<string, string | undefined>) {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("PRINTFUL_")) delete process.env[key];
  }

  for (const [key, value] of Object.entries(snapshot)) {
    if (value !== undefined) process.env[key] = value;
  }
}
