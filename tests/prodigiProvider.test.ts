import assert from "node:assert/strict";
import test from "node:test";
import { buildProdigiOrderPayload, readProdigiDraftOrderConfig } from "../lib/fulfillment/prodigi.ts";

test("buildProdigiOrderPayload creates an order with the correct sku and image URL", () => {
  const payload = buildProdigiOrderPayload({
    externalId: "kitface-job-123",
    sku: "ART-FAP-BAP-A3",
    printReadyImageURL: "https://example.com/upscaled-poster.png",
    recipient: {
      name: "Kitface Test",
      addressLine1: "1 Test Street",
      city: "London",
      countryCode: "GB",
      postalOrZipCode: "SW1A 1AA"
    }
  });

  assert.equal(payload.merchantReference, "kitface-job-123");
  assert.equal(payload.recipient.address.countryCode, "GB");
  assert.equal(payload.items[0].sku, "ART-FAP-BAP-A3");
  assert.equal(payload.items[0].copies, 1);
  assert.deepEqual(payload.items[0].assets[0], {
    printArea: "default",
    url: "https://example.com/upscaled-poster.png"
  });
});

test("readProdigiDraftOrderConfig defaults card orders to direct-delivery greeting card SKU", () => {
  const previous = snapshotProdigiEnv();
  try {
    setRecipientEnv();
    delete process.env.PRODIGI_CARD_SKU;
    delete process.env.PRODIGI_POSTER_SKU;

    const config = readProdigiDraftOrderConfig("fathers-day-card");

    assert.equal(config.sku, "GLOBAL-GRE-MOH-7X5-DIR");
    assert.equal(config.productType, "card");
  } finally {
    restoreProdigiEnv(previous);
  }
});

test("readProdigiDraftOrderConfig defaults poster orders to A3 budget paper SKU", () => {
  const previous = snapshotProdigiEnv();
  try {
    setRecipientEnv();
    delete process.env.PRODIGI_CARD_SKU;
    delete process.env.PRODIGI_POSTER_SKU;

    const config = readProdigiDraftOrderConfig("poster");

    assert.equal(config.sku, "ART-FAP-BAP-A3");
    assert.equal(config.productType, "poster");
  } finally {
    restoreProdigiEnv(previous);
  }
});

test("readProdigiDraftOrderConfig maps small gift products to Prodigi SKUs", () => {
  const previous = snapshotProdigiEnv();
  try {
    setRecipientEnv();
    delete process.env.PRODIGI_MUG_SKU;
    delete process.env.PRODIGI_STICKER_SKU;
    delete process.env.PRODIGI_MAGNET_SKU;

    assert.deepEqual(
      ["mug", "sticker", "magnet"].map((optionId) => readProdigiDraftOrderConfig(optionId as "mug" | "sticker" | "magnet")),
      [
        expectProdigiConfig("H-MUG-W", "mug"),
        expectProdigiConfig("M-STI-3X4", "sticker"),
        expectProdigiConfig("MAG-1-10X10", "magnet")
      ]
    );
  } finally {
    restoreProdigiEnv(previous);
  }
});

function expectProdigiConfig(sku: string, productType: string) {
  return {
    sku,
    productType,
    recipient: {
      name: "John Doe",
      addressLine1: "1 Test Street",
      addressLine2: undefined,
      city: "London",
      stateOrCounty: undefined,
      countryCode: "GB",
      postalOrZipCode: "SW1A 1AA",
      phoneNumber: undefined,
      email: "test@example.com"
    }
  };
}

function setRecipientEnv() {
  process.env.PRINTFUL_TEST_RECIPIENT_ADDRESS1 = "1 Test Street";
  process.env.PRINTFUL_TEST_RECIPIENT_CITY = "London";
  process.env.PRINTFUL_TEST_RECIPIENT_COUNTRY_CODE = "GB";
  process.env.PRINTFUL_TEST_RECIPIENT_ZIP = "SW1A 1AA";
}

function snapshotProdigiEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith("PRODIGI_"))
  );
}

function restoreProdigiEnv(snapshot: Record<string, string | undefined>) {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("PRODIGI_")) delete process.env[key];
  }

  for (const [key, value] of Object.entries(snapshot)) {
    if (value !== undefined) process.env[key] = value;
  }
}
