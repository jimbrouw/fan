import test from "node:test";
import assert from "node:assert/strict";
import { captureSteps } from "../lib/captureSteps.ts";

test("capture flow asks for only front and smile photos", () => {
  assert.deepEqual(
    captureSteps.map((step) => step.type),
    ["neutral_front", "smiling_front"]
  );
});
