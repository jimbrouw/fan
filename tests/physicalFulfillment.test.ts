import assert from "node:assert/strict";
import test from "node:test";
import { isPhysicalFulfillmentEnabled } from "../lib/fulfillment/physicalFulfillment.ts";

test("physical fulfillment is disabled unless explicitly enabled", () => {
  assert.equal(isPhysicalFulfillmentEnabled({}), false);
  assert.equal(isPhysicalFulfillmentEnabled({ PRODIGI_FULFILLMENT_ENABLED: "0" }), false);
  assert.equal(isPhysicalFulfillmentEnabled({ PRODIGI_FULFILLMENT_ENABLED: "1" }), true);
});
