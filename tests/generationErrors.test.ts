import test from "node:test";
import assert from "node:assert/strict";
import { getGenerationFailureMessage, isTransientGenerationError } from "../lib/ai/generationErrors.ts";

test("content rejection is not classified as a transient provider outage", () => {
  const error = "The current content could not be processed. Please revise your input and try again.";

  assert.equal(isTransientGenerationError(error), false);
  assert.match(getGenerationFailureMessage(error), /poster setup could not be processed/i);
});

test("temporary provider failures remain retryable", () => {
  const error = "The provider hit an internal error. Please try again later.";

  assert.equal(isTransientGenerationError(error), true);
  assert.match(getGenerationFailureMessage(error), /temporary error/i);
});
